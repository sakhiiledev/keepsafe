# Keepsake

Pick an occasion, add your words and photos, and download a one-of-a-kind website for someone you love.

## Templates

| Template | Look | Signature moment |
|---|---|---|
| Anniversary | Starlit plum and gold | Live "together for" counter, flip-card reasons, dinner invite |
| Birthday | Butter yellow and tangerine, confetti | A cake they blow out candle by candle |
| Apology | Rose milk, rain-on-glass story | Sealed letter, heart that mends with each promise, invite |
| Proposal | Sage and gold, falling petals | Ring box that opens to "Will you marry me?" |
| Valentine | Pink and red, floating hearts | "Will you be my Valentine?" where the No button runs away |
| Ask out | Periwinkle and sunshine | Dodging No button, then they pick the first date |

## Pages

- `index.html` is the template picker with live previews.
- `builder.html?t=<template>` is the builder: edit text, add photos, show/hide/reorder/add sections, live desktop and phone preview, download.
- `preview.html?t=<template>` shows a template with demo content.

## How it works

- `engine/engine.js` renders any page from a `SITE` object (theme + sections). Every template uses the same section blocks: hero, counter, story, memories, reasons (cards / mend / list), letter, cake, question (dodge / ringbox), plan, invite, gallery, closing.
- `engine/engine.css` holds the six themes as CSS variables, plus the section styles.
- `engine/templates.js` holds each template's demo content and the form schema the builder reads.
- **Download site** builds one self-contained `.html` file with the engine, the content and the photos (compressed to max 1400px) inlined. The customer can open it directly or drop it on Vercel/Netlify.
- Work in the builder autosaves to the browser (IndexedDB). **Project › Save project file** exports a `.json` you can reopen later.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000. The builder must run from a web address (not by double-clicking the file), because Download fetches the engine files.

## Adding a template

1. Add a theme block to `engine/engine.css` (`[data-theme="yourname"] { ... }`) and its fonts/ambient effect to `THEMES` in `engine/engine.js`.
2. Add an entry to `KEEPSAKE_TEMPLATES` in `engine/templates.js` with demo sections.
3. It shows up in the picker and the builder automatically.
