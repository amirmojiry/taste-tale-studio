#!/usr/bin/env python3
"""Build the shipped Latin WOFF2 assets from the documented upstream TTFs.

Usage: python scripts/fonts/subset.py /path/to/source-fonts
Requires fontTools and Brotli, or fontTools plus Node.js as a Brotli fallback.
The production website needs neither Python nor Node.js.
"""

from pathlib import Path
import subprocess
import sys

from fontTools import subset
from fontTools.ttLib import TTFont, woff2
from fontTools.varLib.instancer import instantiateVariableFont


if not woff2.haveBrotli:
    class NodeBrotli:
        MODE_FONT = 2
        MODE_TEXT = 1

        @staticmethod
        def compress(data, mode=0):
            script = (
                "const z=require('node:zlib'),fs=require('node:fs');"
                "process.stdout.write(z.brotliCompressSync(fs.readFileSync(0),"
                "{params:{[z.constants.BROTLI_PARAM_QUALITY]:11,"
                f"[z.constants.BROTLI_PARAM_MODE]:{int(mode)}"
                "}}));"
            )
            return subprocess.run(
                ["node", "-e", script], input=data, capture_output=True, check=True
            ).stdout

        @staticmethod
        def decompress(data):
            return subprocess.run(
                ["node", "-e", "process.stdout.write(require('node:zlib').brotliDecompressSync(require('node:fs').readFileSync(0)))"],
                input=data, capture_output=True, check=True,
            ).stdout

    woff2.brotli = NodeBrotli
    woff2.haveBrotli = True


def build(source, target, weight_range=None):
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.hinting = False
    options.recalc_bounds = True
    options.recalc_timestamp = False
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
    options.layout_features = ["kern", "liga", "clig", "calt", "locl", "mark", "mkmk"]
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=subset.parse_unicodes(
        "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BB-02BC,"
        "U+02C6,U+02DA,U+02DC,U+0300-036F,U+2000-206F,U+20AC,U+2122"
    ))
    worker.subset(font)
    if weight_range:
        instantiateVariableFont(font, {"wght": weight_range}, inplace=True)
    font.flavor = "woff2"
    font.save(target)
    # Read the actual final bytes back to ensure a valid WOFF2 and cmap.
    verified = TTFont(target)
    assert all(ord(character) in verified.getBestCmap() for character in "Taste Tale Studio Hanieh 0123456789")
    print(f"{target.name}: {target.stat().st_size:,} bytes, {len(verified.getGlyphOrder())} glyphs")


if __name__ == "__main__":
    source_dir = Path(sys.argv[1])
    target_dir = Path(__file__).resolve().parents[2] / "assets" / "fonts"
    target_dir.mkdir(parents=True, exist_ok=True)
    build(source_dir / "cormorant-garamond-regular.ttf", target_dir / "cormorant-garamond-regular.woff2")
    build(source_dir / "cormorant-garamond-italic.ttf", target_dir / "cormorant-garamond-italic.woff2")
    build(source_dir / "manrope.ttf", target_dir / "manrope-latin.woff2", (400, 400, 600))
