"""Encode existing artwork; fail on lost frames, alpha changes or excessive colour error."""
import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, features

# Failure cases: missing/corrupt input, missing WebP support, changed dimensions or
# transparency, degraded visible colours, and an export larger than its source.
assert features.check('webp'), 'Pillow needs WebP support'
assets = json.loads(Path('astrocade/asset_map.json').read_text())
out = Path('astrocade/assets')
out.mkdir(parents=True, exist_ok=True)
rows = []
for name in assets:
    source = Path('assets') / (name + '.png')
    target = out / (name + '.webp')
    original = Image.open(source).convert('RGBA')
    original.save(target, 'WEBP', quality=85, method=6, exact=True)
    decoded = Image.open(target).convert('RGBA')
    assert original.size == decoded.size, f'{name}: frame dimensions changed'
    assert not ImageChops.difference(original.getchannel('A'), decoded.getchannel('A')).getbbox(), f'{name}: alpha changed'
    background = Image.new('RGBA', original.size, (0, 0, 0, 255))
    difference = ImageChops.difference(
        Image.alpha_composite(background, original).convert('RGB'),
        Image.alpha_composite(background, decoded).convert('RGB'))
    rms = math.sqrt(sum(x*x for x in ImageStat.Stat(difference).rms) / 3)
    assert rms < 8, f'{name}: visible colour RMS {rms:.2f} exceeds 8/255'
    assert target.stat().st_size < source.stat().st_size, f'{name}: encoding grew'
    rows.append({'id': name, 'width': original.width, 'height': original.height,
                 'sourceBytes': source.stat().st_size, 'webpBytes': target.stat().st_size,
                 'alphaExact': True, 'visibleRms': round(rms, 3)})
report = {'format': 'WebP', 'quality': 85, 'method': 6, 'resized': False,
          'sourceBytes': sum(r['sourceBytes'] for r in rows),
          'webpBytes': sum(r['webpBytes'] for r in rows), 'assets': rows}
Path('astrocade/asset-sizes.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k != 'assets'}))
