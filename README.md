# AsciCat

**The House of Small Secrets** is a browser-based terminal point-and-click adventure in Bramble House. Nine kittens live here; only eight came to dinner. Explore twelve rooms, uncover physical clues, and find the missing kitten beneath the cellar.

Play: https://joramvanloenen.github.io/AsciCat/

The world is illustrated with procedural isometric SVG: translucent architectural planes, faceted kittens, recognizable furniture, and individually drawn inventory objects. Coral, cyan, yellow, sage, and lilac inks multiply where their transparent layers overlap. Delicate contour bands, registration marks, and paper grain draw on the supplied design references. The interface shares the warm paper palette and overlapping color language.

The underlying 58 x 23 navigation grid keeps collision, room connections, and environmental puzzle behavior consistent. It is never rendered as character art. No sprites, external images, fonts, frameworks, or runtime dependencies are needed.

## Playing

Select an action, then click an illustrated object: **LOOK AT, USE, PUSH, PULL, OPEN, CLOSE, TALK TO, TAKE, PET, WALK**. Actions automatically approach objects. Hover or keyboard-focus an object for its name. The expandable object list beneath each map offers the same interactions. Furniture, portraits, cupboards, carpets, windows, and kittens all respond.

The mystery uses environmental puzzles: align turning portraits, slide furniture to reveal recesses, open cupboards, combine supplies, reach a high ledge, play the piano from a pictorial clue, and operate linked cellar mechanisms. There are no cipher puzzles or password forms. Look closely at scenery and talk to kittens for hints. Observations go into the journal.

Select **USE**, click an inventory item, then click its target in the room or another inventory item. **LOOK AT** inspects items. Failed combinations do not consume supplies. The inventory panel also offers a direct **USE THIS ITEM** action.

- Arrow keys / WASD: walk.
- E / Space: selected action on a nearby object.
- P: pet a nearby kitten.
- L / O / T: select look / open / talk.
- 1 / 2 / 3 / 4: explore / inventory / journal / mansion directory.
- Escape: clear the held item and return to exploration.
- Touch controls support movement and all verbs.

Walk is the default action on launch and every new night. Dialogue stays in a compact sticky panel above the room; the verb buttons sit directly below it in a sticky action dock. Audio, room objects, clues/progress, and room details collapse until needed. Pockets appear in the dock when Use is selected. Buttons have visible borders, filled backgrounds, and a pressed state. Room hotspots are retained during movement, so hovering labels remain stable. Progress saves locally. The new adventure uses its own save slot; previous cipher-game saves are left intact. Visited rooms can be revisited through the mansion directory.

## Kitten animation

Kittens wander with smooth projected steps and alternating paws. Separate SVG layers animate their head tilts, eye blinks, breathing, and tail swishes. Each kitten has different timing, preserved across scene redraws. Click targets and name labels move with the kitten. Portrait illustrations remain still. Reduced-motion preferences disable the animated poses and sliding steps.

## Audio

Browser speech synthesis gives kittens distinct pitch and pace profiles. Procedural Web Audio supplies meows, purrs, footsteps, doors, discoveries, piano notes, and mansion ambience. Meows use a normalized vocal waveform with changing vowel resonances, a continuous pitch contour, and a dedicated mix channel that stays audible during speech. The opening meow finishes before the voice starts. Kittens meow before and after dialogue, and occasionally while idle in the current room. If speech synthesis is unavailable or muted, the dialogue meows still work with SFX enabled.

Audio starts after interacting with the page. Expand Audio beside the dialogue to separately mute voices and SFX, replay a message, and adjust volume. Test meow plays a kitten sound directly from the expanded Audio controls. Preferences are saved on the device. Background tabs suspend audio.

## Development and publishing

Serve the repository as static files:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build step is needed.

GitHub Pages publishes from **main**, **/ (root)**. `index.html`, `style.css`, `visuals.js`, `adventure-data.js`, `audio.js`, and `game.js` make up the application; `.nojekyll` keeps publishing static and dependency-free.

## Player character

Each new night chooses one of seven illustrated characters, saved with the adventure. Room-space foot anchors remain fixed throughout stance. Alternating lifted steps, two-segment leg/arm joints, weight transfer, and a lifted closing step bring the character naturally to rest. Footfall sounds follow landing. The renderer updates the player alone between tiles and retains the current gait through room redraws. Reduced motion keeps the same character with immediate movement.

Walking plants the leading foot slightly farther ahead of the body, with a calmer cadence (72 projected pixels per second). Double click or double tap a destination with Walk selected to run; double tap and hold a direction key to run using the keyboard. Running uses longer collision-checked strides, higher knee lift, bent arm swings, and airborne toe-off. A new single click returns to walking.
