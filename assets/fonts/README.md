# Taste Tale Studio typography

These fonts are served locally. Visitors do not contact Google Fonts or another font CDN.

| File | Family | Style | CSS weight |
| --- | --- | --- | --- |
| `cormorant-garamond-regular.woff2` | Cormorant Garamond | Normal | `400` |
| `cormorant-garamond-italic.woff2` | Cormorant Garamond | Italic | `400` |
| `manrope-latin.woff2` | Manrope | Normal | `400 600` (variable) |

Use `font-display: swap` on each `@font-face` declaration. Cormorant Garamond is intended for display type and Manrope for small text, navigation, and controls.

## Sources and licenses

Cormorant Garamond is by the Cormorant Project Authors and is licensed under the SIL Open Font License 1.1. The serif files were subset from the official static v4.000 release in the Google Fonts repository at commit `66f91f10f8e8590367c541bcb5adbe66c933f15f`:

- [Regular source](https://github.com/google/fonts/blob/66f91f10f8e8590367c541bcb5adbe66c933f15f/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf), Git blob `501048d35754a994599f7d751cca3f7fcdff6dec`.
- [Italic source](https://github.com/google/fonts/blob/66f91f10f8e8590367c541bcb5adbe66c933f15f/ofl/cormorantgaramond/CormorantGaramond-Italic.ttf), Git blob `f76f76052f3d1430a2a5184cec2c2e5183fec6e3`.
- The full original license is in `OFL-CormorantGaramond.txt`.

Manrope is by the Manrope Project Authors and is licensed under the SIL Open Font License 1.1:

- [Variable source](https://github.com/google/fonts/blob/main/ofl/manrope/Manrope%5Bwght%5D.ttf), Git blob `75274da58537d6123b14f2cd0c355ad4681fc2b3`.
- The full original license is in `OFL-Manrope.txt`.

## Build

The shipped WOFF2 files contain Latin characters, common combining marks, and typographic punctuation. Hinting is removed; common ligatures, kerning, mark positioning, and localization features are retained. Manrope's weight axis is restricted to 400–600 with a default of 400.

To reproduce the files, download the documented TTFs to a local directory and name them `cormorant-garamond-regular.ttf`, `cormorant-garamond-italic.ttf`, and `manrope.ttf`. Then run:

```sh
python scripts/fonts/subset.py /path/to/source-fonts
```

The script needs fontTools and either the Python Brotli extension or Node.js for Brotli compression. The live website has no build or runtime dependency on those tools.
