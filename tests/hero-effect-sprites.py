"""Validate the packaged hero flipbooks. Run with Python 3 and Pillow."""
from itertools import combinations
from pathlib import Path

import unittest

from PIL import Image, ImageChops, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
ATLASES = ROOT / 'assets/hero-effect-sprites'
HEROES = 'ustaz rempit nok lan sari asha mira dani vanna keo nadi lia'.split()
SLOTS = ('basic', 'Q', 'E', 'F', 'R')


class HeroEffectArt(unittest.TestCase):
    def test_packaged_roster(self):
        self.assertEqual(set(HEROES), {path.stem for path in ATLASES.glob('*.webp')})

    def test_flipbook_cells(self):
        silhouettes = {}
        for hero in HEROES:
            with self.subTest(hero=hero), Image.open(ATLASES / f'{hero}.webp') as sheet:
                self.assertEqual((sheet.format, sheet.mode), ('WEBP', 'RGBA'))
                side = sheet.width // 4
                self.assertEqual(sheet.size, (side * 4, side * 5))
                for row, slot in enumerate(SLOTS):
                    weights = []
                    poses = []
                    for col in range(4):
                        with self.subTest(slot=slot, frame=col):
                            frame = sheet.crop((col * side, row * side,
                                                (col + 1) * side, (row + 1) * side))
                            alpha = frame.getchannel('A')
                            bounds = alpha.getbbox()
                            self.assertIsNotNone(bounds)
                            x, y, right, bottom = bounds
                            self.assertGreaterEqual(min(x, y, side-right, side-bottom), 2)
                            self.assertLess(abs((x+right)/2 - side/2), side*.08)
                            self.assertLess(abs((y+bottom)/2 - side/2), side*.08)
                            weights.append(ImageStat.Stat(alpha).mean[0])
                            self.assertGreater(weights[-1], 1, 'Frame must survive downsampling')
                            # Compare contours independent of colour, opacity and scale.
                            threshold = alpha.getextrema()[1] * .32
                            mask = alpha.point(lambda v: 255 if v > threshold else 0)
                            shape = ImageOps.pad(mask.crop(mask.getbbox()), (32, 32))
                            poses.append(shape)
                            if col == 2:
                                silhouettes[hero, slot] = shape
                                histogram = frame.convert('L').histogram(mask)
                                dark = sum(histogram[:100])
                                light = sum(histogram[145:])
                                self.assertGreater(min(dark, light), .015 * sum(histogram),
                                                   'Peak needs both shadows and lit paint')
                    with self.subTest(slot=slot):
                        self.assertGreater(weights[2], weights[0], 'Peak must grow from anticipation')
                        self.assertGreater(weights[2], weights[3], 'Dissipation must lose visual weight')
                        for a, b in combinations(poses, 2):
                            self.assertGreater(ImageStat.Stat(ImageChops.difference(a, b)).mean[0], 3,
                                               'Recoloured or resized repeated pose')
        for (first, a), (second, b) in combinations(silhouettes.items(), 2):
            with self.subTest(first=first, second=second):
                self.assertGreater(ImageStat.Stat(ImageChops.difference(a, b)).mean[0], 3,
                                   'Peak silhouettes should distinguish the skills')


if __name__ == '__main__':
    unittest.main()
