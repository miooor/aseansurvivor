"""Measure original pixels without editing artwork.

Failure cases: no clear gutter between adjacent bodies/tools, canvas-edge body
clipping, wrong frame counts. Geometry retains the >=32 clipping threshold;
128 measures sole pivots separately. No source or WebP pixels are changed.
"""
import json
from pathlib import Path
from statistics import median

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IDS = ('asha', 'mira', 'dani', 'vanna', 'keo', 'nadi', 'lia')


def boundary(mask, nominal, radius, horizontal):
  values = []
  for position in range(round(nominal - radius), round(nominal + radius) + 1):
    box = (0, position, mask.width, position + 1) if horizontal else (position, 0, position + 1, mask.height)
    values.append((position, mask.crop(box).histogram()[255]))
  best = min(score for _, score in values)
  runs = []
  for position, score in values:
    if score == best:
      if runs and runs[-1][-1] == position - 1:
        runs[-1].append(position)
      else:
        runs.append([position])
  run = min(runs, key=lambda row: (-len(row), abs(median(row) - nominal)))
  return round(median(run)), best


report = {'geometryThreshold': 32, 'soleThreshold': 128, 'sourcesUnchanged': True, 'sheets': {}, 'failures': []}
manifest = {}
for hero in IDS:
  for kind in ('motion', 'skills'):
    name = f'{hero}-{kind}'
    alpha = Image.open(ROOT / 'assets' / f'{name}.png').getchannel('A')
    strong = alpha.point(lambda value: 255 if value >= 32 else 0)
    soles = alpha.point(lambda value: 255 if value >= 128 else 0)
    rows = [0]
    for row in range(1, 8):
      edge, score = boundary(strong, row * strong.height / 8, strong.height / 8 * 0.22, True)
      rows.append(edge)
      if score:
        report['failures'].append(f'{name}: no empty strong-body row gutter {row}; pixels {score}')
    rows.append(strong.height)
    frames = []
    equal = []
    for row in range(8):
      band = strong.crop((0, rows[row], strong.width, rows[row + 1]))
      columns = [0]
      for col in range(1, 8):
        edge, score = boundary(band, col * strong.width / 8, strong.width / 8 * 0.22, False)
        columns.append(edge)
        if score:
          report['failures'].append(f'{name}: no empty strong-body column gutter row {row}, column {col}; pixels {score}')
      columns.append(strong.width)
      for col in range(8):
        # Share the empty cut row/column so both neighbors retain a padding pixel.
        x, y = columns[col], rows[row]
        right, bottom = min(strong.width, columns[col + 1] + 1), min(strong.height, rows[row + 1] + 1)
        bbox = strong.crop((x, y, right, bottom)).getbbox()
        frame = {'index': row * 8 + col, 'frame': [x, y, right - x, bottom - y], 'body': bbox}
        # Restrict sole measurement to the central body so a long pole is not a foot.
        center = (col + 0.5) * alpha.width / 8
        coreLeft, coreRight = max(x, round(center - alpha.width / 8 * 0.3)), min(right, round(center + alpha.width / 8 * 0.3))
        core = soles.crop((coreLeft, y, coreRight, bottom)).getbbox()
        if core:
          footTop = y + max(core[1], core[3] - 12)
          foot = soles.crop((coreLeft, footTop, coreRight, y + core[3])).getbbox()
          pivotX = coreLeft + (foot[0] + foot[2]) / 2 if foot else center
          pivotY = y + core[3]
        else:
          pivotX, pivotY = center, bottom
        frame['pivot'] = [(pivotX - x) / (right - x), (pivotY - y) / (bottom - y)]
        frames.append(frame)
        if bbox is None:
          report['failures'].append(f'{name}: measured empty cell {frame["index"]}')
        elif bbox[0] == 0 or bbox[1] == 0 or bbox[2] == right - x or bbox[3] == bottom - y:
          report['failures'].append(f'{name}: strong body touches measured frame edge {frame["index"]}')
        ey, eb = round(row * strong.height / 8), round((row + 1) * strong.height / 8)
        ex, er = round(col * strong.width / 8), round((col + 1) * strong.width / 8)
        equalBox = soles.crop((ex, ey, er, eb)).getbbox()
        equal.append(equalBox[3] / (eb - ey) if equalBox else None)
    report['sheets'][name] = {'size': list(alpha.size), 'rowEdges': rows, 'frames': frames,
                             'equalGridSoleMedian': median(value for value in equal if value is not None),
                             'equalGridIdleSoleMedian': median(value for value in equal[56:64] if value is not None)}
    manifest.setdefault(hero, {})[kind] = [dict(zip(('x', 'y', 'w', 'h', 'pivotX', 'pivotY'), frame['frame'] + frame['pivot'])) for frame in frames]
    assert len(frames) == 64, f'{name}: expected exactly 64 frames'
destination = ROOT / 'docs/evidence/roster-art/measured-frames.json'
report['result'] = 'FAIL' if report['failures'] else 'PASS'
destination.write_text(json.dumps(report, indent=2) + '\n')
(ROOT / 'docs/evidence/roster-art/frame-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
lines = ['// Measured from retained original PNGs by scripts/measure-roster-frames.py.', 'export const rosterFrames = {']
for hero, sheets in manifest.items():
  lines.append(f'  {hero}: {{')
  for kind, frames in sheets.items():
    lines.append(f'    {kind}: [')
    for frame in frames:
      values = ', '.join(f'{key}: {value:.8f}' if isinstance(value, float) else f'{key}: {value}' for key, value in frame.items())
      lines.append('      {' + values + '},')
    lines.append('    ],')
  lines.append('  },')
lines.append('};')
(ROOT / 'src/content/roster-frames.js').write_text('\n'.join(lines) + '\n')
print(json.dumps({'sheets': {name: {key: value for key, value in sheet.items() if key != 'frames'} for name, sheet in report['sheets'].items()},
                  'failures': report['failures']}), flush=True)
raise SystemExit(1 if report['failures'] else 0)
