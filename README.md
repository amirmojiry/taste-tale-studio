# Taste Tale Studio

A bespoke, English-language cooking portfolio for Hanieh in Vaasa, Finland.

**Website:** https://amirmojiry.github.io/taste-tale-studio/

## A small, fast site

Original HTML, CSS and vanilla JavaScript. No site template, framework, animation library, package dependency, third-party embed, tracker or cookie. Photography and the original Taste Tale Studio logo are supplied by the owner. Fonts are served from the same origin, with their open-source licenses included.

The site includes a responsive editorial introduction, all 19 supplied photographs, three gallery categories, keyboard-accessible photo viewing, mobile swipe navigation, Hanieh’s story, and the supplied Instagram and YouTube links. Motion respects the visitor’s reduced-motion preference. Content and direct image links remain usable without JavaScript.

## Run locally

Serve the repository root with any static HTTP server, for example:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. No dependency installation is needed.

With Node.js 20 or newer:

```sh
npm run check
npm run build
```

The build command copies only public website files into `dist/`. It does not compile the site or install dependencies.

## GitHub Pages

The workflow `.github/workflows/pages.yml` checks and publishes the site when `main` changes. In the repository’s **Settings → Pages → Build and deployment**, the source must be **GitHub Actions**. This one-time repository setting cannot be enabled by the workflow’s default `GITHUB_TOKEN`.

Once enabled, use **Actions → Publish Taste Tale Studio → Run workflow** if the initial workflow ran before Pages was enabled. Future source changes publish automatically. No custom token, paid hosting, build service or custom domain is required.

All asset paths are relative so the project works at `/taste-tale-studio/`. The canonical URL, social image URL and 404 home link deliberately use the production address. Update those if moving domains.

## Edit the content

- **Intro, story and social links:** edit `index.html`.
- **Colours, spacing, typography and breakpoints:** edit the custom properties and rules in `styles.css`.
- **Photo titles, descriptions and ordering:** edit `scripts/gallery.json`, then run `node scripts/render-gallery.mjs`. Gallery markup is generated into the marked region of `index.html` so content remains readable without JavaScript. Keep the displayed category counts in the filter buttons in sync; `npm run check` catches mismatches.
- **Photography:** add responsive WebP images in `assets/images/` and record the actual dimensions in `assets/images/manifest.json`. The burger photo’s largest source is 720 px wide, although its target-width filename ends in `-960.webp`; its HTML correctly declares `720w`.
- **Fonts:** source information and full licenses are in `assets/fonts/`. A reproducible subset helper is in `scripts/fonts/`.

Photographs are not retouched or cropped in the asset files. CSS frames crop only the thumbnails; the photo viewer shows each complete photograph. Image metadata is removed from the distributed files.

## Interaction details

- Gallery filtering uses ordinary buttons with pressed states and a live result count.
- The photo viewer uses the native HTML dialog: Escape closes it, Left/Right arrow keys move between photographs, and closing restores focus to the original link. The background is inactive while the dialog is open.
- On mobile, swipe horizontally over a photograph to change images. The visible arrow buttons provide the same operation.
- Scroll reveals run once. The subtle hero movement is limited to 18 px and disabled on small screens or for reduced motion. There is no continuous animation loop or automatic carousel.
- Social links open the owner’s supplied profiles in a separate tab; no external scripts or video embeds load on the site.

This is a portfolio and introduction. It does not imply an online ordering service or promise prices, availability, delivery, allergen information or professional qualifications.

## Attribution and rights

Website content, logo and photographs belong to Taste Tale Studio or their respective owner. The fonts retain their included SIL Open Font License notices. No license to reuse the food photography or branding is granted by publishing this repository.
