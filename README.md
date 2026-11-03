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

## Weddings, lobola and invitations

| Template | What's special |
|---|---|
| Lobola | Walking Nguni herd that counts up the cattle, "Agreed" stamp, programme, dress code, venue, RSVP |
| Traditional wedding | Couple, story, programme, attire with colour swatches, venue + maps, travel, FAQ, gifts, RSVP |
| White wedding | Classic ceremony and reception page with petals |
| Wedding invitation | Short invitation with an RSVP that becomes a ticket |
| Save the date | Countdown + add to calendar |

### Premium collection
Ivory Seal (wax-sealed envelope opening), Candlelight (tap to light), Heritage Beadwork (patterned envelope), Royal Kraal (curtains + herd), Golden Scratch (scratch-to-reveal save the date), Garden Curtain.

### Culture themes (11 official languages)
Zulu, Xhosa, Ndebele, Swati, Sotho, Tswana, Pedi, Venda, Tsonga, Afrikaans, English. Each sets colours, fonts, a drawn heritage pattern (beadwork, braid lines, Ndebele geometry, emahiya, shweshwe, diamonds, hempe stripes, minwenda bands, xibelani zigzags, fynbos, classic), a scenery photo, and words used through the copy: `{greet}`, `{invite}`, `{thanks}`, `{lobola}`, `{wedding}`, `{yes}`, `{no}`. Families should check spelling and usage.

### RSVP
Guests type their name, choose accept/decline, pick party size and meals, add a song and a message, and get a ticket. Replies are sent to the couple on WhatsApp (set the number in the RSVP section). Personal links (`?guest=Name&plus=2`) greet the guest by name and cap their party size; the builder generates them.

### Music
Upload a song in "Who's it for?". It plays from a floating button or when the cover opens.

### Photo credits
Scenery, craft and cattle photos are from Unsplash (Kuhle Mahlalela, Clara Metivier Beukes, William Veitch) and Pexels, used under their free licences. No people are shown; customers add their own.

## Customising the look

The builder's **Look** panel lets the customer change:

- **Colours:** 12 palettes, or pick each colour (background, soft colour, text, accent, second accent, cards, story background). Text on buttons and the story band switches between light and dark automatically for contrast.
- **Fonts:** 14 tested pairings, or choose the heading, body and handwriting fonts separately from 16 / 14 / 12 Google Fonts.
- **Type:** heading style (normal, all caps, italic), title size and text size.

The choices are saved in `site.style` and travel with the downloaded page.

## Make video

**Make video** turns the page into a short video in the browser (no server): title, counter, story chapters, memories, gallery, reasons one by one, letter, question, invite and closing, in the chosen colours and fonts. Portrait 9:16, square or landscape; slow/normal/quick pace; optional song with fade in and out. Chrome, Edge and Safari save MP4; other browsers save WebM. Recording runs in real time, so the tab must stay open.

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
