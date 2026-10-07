# For Dioca

A one-page apology website.

## Sections (in order)

1. **Hero** – her name with a red thread drawing around it
2. **The three days** – Day one to Day four, with scroll scenes that match the words (the thread snaps, rain on the windscreen, the phone ringing out, the heartbeat, the ceiling, the messages clearing, the clinic, the prescription, the colour coming back, Day 4)
3. **Memory lane** – five memories: the phone, AWS, that night, her dream, best times
4. **What you are to me**
5. **The letter** – a sealed envelope that opens into the apology letter
6. **Ten things I'll do differently** – a cracked heart mended with gold as each promise is read
7. **Us, mostly** – photos and videos hung on a red string
8. **The invite** – Saturday 10 October, 13:30, with an Accept button that shows the reservation

## Run it

Open `index.html` in a browser, or for videos and the PDF to behave properly:

```
python -m http.server 8000
```

then visit http://localhost:8000

## Adding things

- **Reservation PDF:** save it as `assets/reservation.pdf`. The Accept button shows it automatically.
- **Bouquet video:** save it as `assets/media/bouquet.mp4`.
- **Text:** all wording lives in `index.html`.
- **Photos/videos:** optimised copies live in `assets/media/`. The originals are in `gallery/`.
