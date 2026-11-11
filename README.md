# a-cite

A [reveal.js](https://revealjs.com/) presentation, served and built with [Vite](https://vite.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (installed here: v26 LTS)

## Usage

```sh
npm install       # first time only
npm run dev       # live-reloading dev server at http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve the built dist/ locally
```

## Publishing

Every push to `main` builds the deck and publishes it to GitHub Pages at
`https://<username>.github.io/azref/` (`.github/workflows/deploy.yml`). The repo's
Settings → Pages → Source must be set to "GitHub Actions".

## Where things are

- `index.html`: the slides (`<section>` elements inside `.slides`)
- `src/main.js`: theme, plugins and [reveal.js config](https://revealjs.com/config/)

Keyboard: `→`/`←` navigate, `Esc` overview, `S` speaker view, `F` fullscreen.
Add `?print-pdf` to the URL to [export to PDF](https://revealjs.com/pdf-export/) via the browser's print dialog.
