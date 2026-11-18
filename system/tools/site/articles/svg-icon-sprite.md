# An SVG icon sprite inside one script

Build an SVG sprite of `symbol` elements from a script, draw each icon with `use` and `currentColor`, hide it from screen readers and flip arrows right to left.

## Why a sprite

An icon drawn in SVG can be pasted inline wherever it appears, which repeats its path data on every use: a table of 50 rows with a pencil in each carries the pencil 50 times. An `<img src="pencil.svg">` is fetched once and cached, but the SVG inside it is a document of its own and cannot take the colour of the text around it.

A sprite draws each icon once, as a `<symbol>`, and every place that shows it holds a short reference:

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
</svg>

<button type="button"><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Saved</button>
```

MDN describes `<symbol>` as a template "not meant to be rendered" by itself: only its instances are drawn. `<use>` makes an instance. The effect, in MDN's words, "is the same as if the nodes were deeply cloned into a non-exposed DOM, then pasted where the `<use>` element is". The `viewBox` of the symbol lets the same drawing scale to any size the outer `<svg>` is given. Write `href`; `xlink:href` is deprecated since SVG 2.

## Why the sprite is in the script

A sprite can also be a file of its own, referenced as `<use href="/icons.svg#i-check">`. That works when the file comes from the same origin as the page. MDN warns that "browsers may apply the same-origin policy on `<use>` elements and may refuse to load a cross-origin URL", and that there is "currently no defined way to set a cross-origin policy" for them. In Chrome, a page on one port that points `<use>` at the same file on another port draws nothing, and the console says: "Unsafe attempt to load URL … Domains, protocols and ports must match."

A component library is often linked from a CDN, which is another origin. Its icons cannot live in a separate sprite file then, but the library's script is already on the page, and it can write the sprite into the document. The icons cost no extra request and no build step on the user's side, and the origin rule never applies, since the reference is to the same document.

The price is weight in the script. Tray UI's 118 icons are 17,317 bytes of JSON inside `components/bundle.js`; compressed with gzip, the script is 42.6 KB with them and 37.6 KB without, so the icons cost about 5 KB on the wire.

## The script

Keep the drawings as a map from name to the markup inside the symbol, and write the sprite once, as the first child of `<body>`:

```js
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
};

function addSprite() {
  if (document.getElementById('icon-sprite')) return;
  const symbols = Object.entries(ICONS)
    .map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`)
    .join('');
  document.body.insertAdjacentHTML('afterbegin',
    `<svg id="icon-sprite" width="0" height="0" style="position:absolute" aria-hidden="true">${symbols}</svg>`);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addSprite);
else addSprite();
```

- **The HTML parser makes it SVG.** `insertAdjacentHTML` parses the string as HTML, and inside an `<svg>` the parser puts `<symbol>` and `<path>` in the SVG namespace, so no `createElementNS` is needed.
- **It takes no room.** Zero width and height and `position: absolute` keep the sprite out of the layout.
- **The ids are prefixed.** A sprite shares the page's id space, so `i-` (or your library's name) keeps `check` from meeting an `id="check"` of the page.
- **It runs once.** The check for the sprite's id makes a second call harmless, for a page that loads the script twice.

Before the script runs, `<use href="#i-check">` points at nothing and draws nothing. When the sprite arrives, every reference is drawn, with no call to make. Size the icons in CSS, as below, and their boxes are in the layout from the first paint, so nothing moves when the drawings appear.

## Colour, stroke and size

The paths in the symbols carry no `fill` or `stroke` of their own. The cloned content inherits properties from the `<use>` element, which inherits them from the outer `<svg>`, so one class sets them all:

```css
.icon {
  display: block;
  inline-size: 20px;
  block-size: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

- **`currentColor`** is the value of `color` on the element. An icon inside a red button is red, an icon in a link takes the link's colour, and a hover that changes the text colour changes the icon with it.
- **The stroke scales with the drawing.** `stroke-width` is measured in the units of the symbol's `viewBox`, 24 across. At 20 pixels, 2.4 units are 2 pixels; a horizontal line of an icon drawn at 96 pixels comes out about 10 pixels thick in Chrome. Lucide's design guide draws icons on a 24 by 24 canvas with strokes 2 pixels wide, which would be 1.67 pixels at 20.
- **Selectors stop at the `<use>`.** A rule such as `.icon path` does not reach the paths of the clone: in Chrome the line stays the colour inherited from `.icon`. Everything has to come in by inheritance, which is why the paths leave `fill` and `stroke` unset.

## Hidden from assistive technology

An icon beside a word adds nothing for a screen reader. MDN's page on `aria-hidden` names "purely decorative content, such as icons or images" as what it is for, so every icon `<svg>` carries `aria-hidden="true"`, and so does the sprite.

The control is named by its words. An icon button with no visible words needs an `aria-label` on the button itself:

```html
<button type="button" aria-label="Next page">
  <svg class="icon icon--flip" aria-hidden="true"><use href="#i-arrow-right"/></svg>
</button>
```

Chrome's accessibility tree shows the two buttons above as `button "Saved"` and `button "Next page"`, with no trace of the icons or of the sprite. Keep `aria-hidden` off the button: MDN warns not to use it on an element that can take focus, or on its parent.

## Flipping right to left

In a right-to-left page, an arrow that means "next" points left. Icons that point along the reading direction mirror; a check, a clock or a play button does not. Mark the ones that do with a class, and mirror them:

```css
.icon--flip:dir(rtl) { transform: scaleX(-1); }
```

`:dir(rtl)` matches the direction the browser has worked out for the element, inherited from the nearest `dir` attribute. The attribute selector `[dir="rtl"] .icon--flip` also matches inside a `dir="ltr"` island of a right-to-left page, where the icon should not flip; in Chrome, the first leaves such an icon alone and the second mirrors it. MDN marks `:dir()` as available across browsers since December 2023. Which icons to mark is a question of its own, covered in [Right to left: which arrows to flip](#a-right-to-left-arrows).

## Icons in Tray UI

Tray UI's 118 icons are Lucide's, under Lucide's names. They are kept in one file, `src/icons.json`, a map from name to the markup inside the symbol, and `tools/build.py` turns that file into three things:

- `UI.icons`, written into `components/bundle.js` above the code that uses it;
- one SVG file per icon, in the Icons group of the design system's assets;
- typed data for the React package, where `IconName` lists the names.

When the script starts, it builds the sprite from `UI.icons` and puts it first in `<body>`: an `<svg id="tray-sprite">` of zero size, absolutely positioned and `aria-hidden`, holding one `<symbol id="tray-i-NAME" viewBox="0 0 24 24">` for each icon. An icon in the markup is a reference to it:

```html
<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg>
```

`.tray-icon` is 20 pixels square, with `stroke: currentColor` and a round stroke of 2.4 units, so 2 pixels on screen; `tray-icon--sm` is 16 pixels and `tray-icon--lg` 28. Under `dir="rtl"`, `tray-icon--flip` mirrors an icon with `transform: scaleX(-1)`. Its selector is `[dir="rtl"] .tray-icon--flip`, so it follows the attribute, as described above.

For markup written from script, `TrayUI.icon(name, className)` returns the same markup as a string:

```js
TrayUI.icon('chevron-right', 'tray-icon--flip');
// '<svg class="tray-icon tray-icon--flip" aria-hidden="true" focusable="false"><use href="#tray-i-chevron-right"/></svg>'
```

The script uses it for its own close buttons, the icons of toasts and the month arrows of a [Calendar](#c-calendar), which carry `tray-icon--flip`. The build checks every `#tray-i-` reference in the blocks, the component examples and the script against the set, and reports an unknown name as a problem.

An icon outside the 118 is written inline: copy it from [lucide.dev](https://lucide.dev/icons) and give it the class, which sets the size, the stroke and the colour.

```html
<svg class="tray-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
```

Lucide is under the ISC licence, and the icons it took from Feather are under the MIT licence. Both notices are in `components/LUCIDE-LICENSE.txt`, which the build copies beside the script, so the licence travels with the file that holds the drawings. The [Icons](#f-icons) page lists all 118 and copies the markup of each, and [Direction](#c-direction) shows the flipped icons in a right-to-left page.
