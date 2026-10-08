# AsciCat

**The House of Small Secrets** is a complete, browser-based ASCII mystery set in Bramble House. Nine kittens live here; only eight came to dinner. Explore twelve rooms, decipher their messages, and find the missing ninth kitten beneath the cellar.

Play: https://joramvanloenen.github.io/AsciCat/

Every visible illustration is made of printable ASCII characters. The map is a fixed 58 x 23 terminal grid with cell-by-cell movement, solid scenery, letter-based kittens, and connected doorways. No sprites, image assets, external fonts, frameworks, or runtime dependencies.

## Controls

- Arrow keys / WASD: move.
- E / Space: talk or inspect within two tiles.
- P: pet a nearby kitten.
- 1 / 2 / 3 / 4: explore, codebook, journal, mansion directory.
- Escape: return to exploration / close dialogs.
- Click a floor tile to walk; click a kitten or question mark to approach and interact.
- Touch buttons provide the same controls on mobile.

The codebook explains Caesar shifts, Atbash, A1Z26, reversed text, Morse, and Vigenere. Every message offers three progressive hints. A decoded clue accepts either its complete translation or its secret word. There is no penalty for mistakes or time limit. Progress is saved locally on each device. Optional synthesized sounds start only after enabling sound.

## Local development

Serve the repository as static files:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build step is needed.

## Publishing

GitHub Pages publishes from **main**, **/ (root)**. `index.html`, `style.css`, and `game.js` are the application; `.nojekyll` keeps publishing static and dependency-free.
