"""Validate original roster sheets and encode their same-size delivery WebPs.

Run in astrocade/assets.Dockerfile's pinned Pillow image, never host installs.
Failure cases: missing source, opaque canvas, wrong grid, empty/clipped cells,
identical motion poses, lossy alpha, excessive RGB error. Direction and portrayal
are visual checks recorded separately; pixel statistics cannot prove them.
"""
import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageChops, ImageStat, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
IDS = ('asha', 'mira', 'dani', 'vanna', 'keo', 'nadi', 'lia')


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--encode', action='store_true')
  parser.add_argument('--frames', help='Measured frame manifest; omission checks the original equal grid')
  parser.add_argument('--report', default='docs/evidence/roster-art/conformance.json')
  args = parser.parse_args()
  metadata = json.loads((ROOT / args.frames).read_text()) if args.frames else {}
  report = {'timestamp': datetime.now(timezone.utc).isoformat(), 'format': 'WebP', 'quality': 85, 'method': 4,
            'frameManifest': args.frames, 'files': [], 'failures': []}
  names = [f'{hero}-{kind}' for hero in IDS for kind in ('motion', 'skills')] + ['roster-portraits']
  for name in names:
    print(f'Checking {name}', flush=True)
    path = ROOT / 'assets' / f'{name}.png'
    if not path.exists():
      report['failures'].append(f'{name}: missing source PNG')
      continue
    source = Image.open(path).convert('RGBA')
    width, height = source.size
    cols, rows, populated = (4, 2, 7) if name == 'roster-portraits' else (8, 8, 64)
    hero, _, kind = name.partition('-')
    measured = metadata.get(hero, {}).get(kind)
    if measured is not None and len(measured) != 64:
      report['failures'].append(f'{name}: measured manifest does not contain exactly 64 frames')
      continue
    entry = {'name': name, 'size': [width, height], 'pngBytes': path.stat().st_size,
             'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'decodedBytes': width * height * 4, 'cells': []}
    report['files'].append(entry)
    alpha = source.getchannel('A')
    entry['alphaHistogram'] = alpha.histogram()
    edgeBands = [alpha.crop((0, 0, width, 2)), alpha.crop((0, height - 2, width, height)),
                 alpha.crop((0, 0, 2, height)), alpha.crop((width - 2, 0, width, height))]
    edgePixels = sum(b.width * b.height for b in edgeBands)
    edgeNonzero = sum(sum(b.histogram()[1:]) for b in edgeBands)
    entry['outer2px'] = {'pixels': edgePixels, 'nonzero': edgeNonzero,
                        'alphaMax': max(b.getextrema()[1] for b in edgeBands)}
    if edgeNonzero / edgePixels > 0.8:
      report['failures'].append(f'{name}: widespread low-alpha background at outer edges')
    if alpha.getextrema() != (0, 255):
      report['failures'].append(f'{name}: expected transparent and opaque alpha')
    for i in range(cols * rows):
      x, y = round(i % cols * width / cols), round(i // cols * height / rows)
      right, bottom = round((i % cols + 1) * width / cols), round((i // cols + 1) * height / rows)
      if measured:
        frame = measured[i]
        x, y, right, bottom = frame['x'], frame['y'], frame['x'] + frame['w'], frame['y'] + frame['h']
        if not (0 <= x < right <= width and 0 <= y < bottom <= height):
          report['failures'].append(f'{name}: invalid measured bounds for cell {i}')
          continue
      cw, ch = right - x, bottom - y
      cell = source.crop((x, y, right, bottom))
      bbox = cell.getchannel('A').getbbox()
      visible = cell.getchannel('A').point(lambda value: 255 if value >= 32 else 0).getbbox()
      entry['cells'].append({'index': i, 'frame': [x, y, cw, ch], 'bbox': bbox, 'visibleBbox': visible,
                             'sha256': hashlib.sha256(cell.tobytes()).hexdigest()})
      if i < populated and bbox is None:
        report['failures'].append(f'{name}: empty cell {i}')
      if i >= populated:
        lastAlpha = cell.getchannel('A')
        entry['unusedPortraitCell'] = {'alphaMax': lastAlpha.getextrema()[1], 'alphaNonzero': sum(lastAlpha.histogram()[1:])}
        if visible is not None:
          report['failures'].append(f'{name}: final portrait cell contains visible content at alpha >=32')
        for channel in (0, 255):
          flat = Image.new('RGBA', cell.size, (channel, channel, channel, 255))
          delta = ImageChops.difference(Image.alpha_composite(flat, cell).convert('RGB'), flat.convert('RGB'))
          maximum = max(hi for _, hi in delta.getextrema())
          entry['unusedPortraitCell'][f'compositeMaxErrorOn{channel}'] = maximum
          if maximum > 1:
            report['failures'].append(f'{name}: unused portrait slot composite differs from flat background by {maximum}')
      if visible and (visible[0] <= 0 or visible[1] <= 0 or visible[2] >= cw or visible[3] >= ch):
        report['failures'].append(f'{name}: visible body/tool in cell {i} touches frame edge')
    if rows == 8:
      for col in range(8):
        for start, end in ((0, 4), (4, 8)):
          hashes = [entry['cells'][r * 8 + col]['sha256'] for r in range(start, end)]
          if len(set(hashes)) != len(hashes):
            report['failures'].append(f'{name}: repeated pose in column {col}, rows {start}-{end - 1}')
    webp = path.with_suffix('.webp')
    if args.encode:
      source.save(webp, 'WEBP', quality=85, method=4, exact=True)
    if not webp.exists():
      report['failures'].append(f'{name}: missing WebP')
      continue
    try:
      encoded = Image.open(webp).convert('RGBA')
    except UnidentifiedImageError:
      report['failures'].append(f'{name}: corrupt WebP')
      continue
    entry['webpBytes'] = webp.stat().st_size
    entry['webpSha256'] = hashlib.sha256(webp.read_bytes()).hexdigest()
    if encoded.size != source.size:
      report['failures'].append(f'{name}: WebP dimensions changed')
      continue
    entry['alphaExact'] = ImageChops.difference(alpha, encoded.getchannel('A')).getbbox() is None
    if not entry['alphaExact']:
      report['failures'].append(f'{name}: WebP alpha changed')
    background = Image.new('RGBA', source.size, (0, 0, 0, 255))
    difference = ImageChops.difference(Image.alpha_composite(background, source).convert('RGB'),
                                     Image.alpha_composite(background, encoded).convert('RGB'))
    rms = math.sqrt(sum(v * v for v in ImageStat.Stat(difference).rms) / 3)
    entry['visibleRgbRms'] = rms
    if rms >= 8:
      report['failures'].append(f'{name}: visible RGB RMS {rms:.3f} exceeds 8')
    preview = ROOT / 'docs/evidence/roster-art/previews' / f'{name}.jpg'
    preview.parent.mkdir(parents=True, exist_ok=True)
    dark = Image.new('RGBA', source.size, (24, 32, 40, 255))
    Image.alpha_composite(dark, source).convert('RGB').save(preview, quality=88)
  report['result'] = 'PASS' if not report['failures'] else 'FAIL'
  report['totalDecodedBytes'] = sum(f['decodedBytes'] for f in report['files'])
  destination = ROOT / args.report
  destination.parent.mkdir(parents=True, exist_ok=True)
  destination.write_text(json.dumps(report, indent=2) + '\n')
  print(json.dumps({'result': report['result'], 'files': len(report['files']), 'failures': report['failures']}))
  raise SystemExit(0 if report['result'] == 'PASS' else 1)


if __name__ == '__main__':
  main()
