# jif

A client-side GIF maker. Drop in a batch of images, reorder them into a
sequence, preview the loop, tune fps/quality/size, and export a GIF — all in
the browser. No backend, no uploads.

Built with React + Vite + Tailwind, encoding via [gif.js](https://github.com/jnordberg/gif.js)
(runs in a Web Worker so the UI stays responsive during export).

## Develop

```
pnpm install
pnpm dev
```

## Build

```
pnpm build
pnpm preview   # sanity-check the production build locally
```

`pnpm install` copies gif.js's worker script into `public/gif.worker.js` via a
`postinstall` hook (`scripts/copy-gif-worker.mjs`) so it's served as a static
asset in both dev and the production build — it's also committed to the repo,
so a fresh `pnpm build` works even without a prior `pnpm install`.

## Deploy to Vercel

```
npx vercel
```

It's a static Vite app — no configuration needed. Framework preset: Vite,
build command `pnpm build`, output directory `dist`.
