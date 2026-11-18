# Forced colours mode in CSS: fills become edges

How Windows High Contrast and other forced colour modes repaint a page, and the CSS that keeps cards, chosen items, icons and focus rings visible.

## What forced colours mode does

In a forced colours mode the browser sets aside most of the page's colours and paints it in a short palette the person chose. Windows calls these contrast themes (Settings, Accessibility, Contrast themes); older versions called them High Contrast. Firefox has a mode of its own in its colour settings. Safari has none: Apple platforms have no forced colours mode, and in Safari `@media (forced-colors: active)` never matches.

The [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/) specification says what changes. Each colour in `color`, `background-color`, `border-color`, `outline-color`, `fill`, `stroke`, `text-decoration-color` and a few more properties is replaced by a system colour, unless it already is one. A background keeps its alpha, so a transparent one stays transparent. Some properties are switched off:

| Property | In forced colours |
| --- | --- |
| `box-shadow`, `text-shadow` | `none` |
| `background-image` | `none`, unless it holds a `url()` |
| `color-scheme` | `light dark` |
| `scrollbar-color`, `accent-color` | `auto` |

The browser picks each colour from what the element is in HTML. A `<button>` gets `ButtonText` on `ButtonFace`, a link gets `LinkText`, and ordinary text gets `CanvasText` on `Canvas`. MDN notes that ARIA does not count here: a `div` with `role="button"` is painted as text. Behind text, Chrome also draws a backplate in the `Canvas` colour, so words stay readable over a picture.

Your part is small. MDN's page on [forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors) advises against a separate design for this mode: the media query is for small tweaks where the forced result does not work.

## What disappears

A design that draws its shapes as fills, with no edges, loses them. Take a card drawn as a fill a shade darker than the page, a strip of tabs whose chosen tab is a dark pill, and a meter drawn as a dark bar on a grey track. With colours forced, in Chrome's emulation:

- the card's fill becomes the page colour, and the card is gone;
- the chosen tab's fill becomes the page colour too, and it looks like every other tab;
- the meter's track and bar both take the page colour, and the meter is gone;
- the shadow under a menu, and a focus ring drawn with `box-shadow`, are removed.

The words survive. Everything the fills were saying is lost with them.

## System colours

CSS gives you the person's palette by name. A colour you write as a system colour is left as it is, so these keywords are what you draw with in this mode. Use them in pairs, a background with its own text colour.

| Background | Text | For |
| --- | --- | --- |
| `Canvas` | `CanvasText` | The page and most content. |
| `ButtonFace` | `ButtonText` | Controls; `ButtonBorder` is their edge. |
| `Field` | `FieldText` | Text inputs. |
| `Highlight` | `HighlightText` | Selected text, the option under the keyboard. |
| `SelectedItem` | `SelectedItemText` | A chosen item, a checked box. |
| `Mark` | `MarkText` | Marked text, as in `<mark>`. |

`LinkText` colours links and `GrayText` disabled text; both go on `Canvas`.

## Turn fills into edges

Inside `@media (forced-colors: active)`, give each fill that carries meaning an edge, and draw the chosen state in the selected pair. This is the card, the tabs and the meter from above, with the tab panels and their script left out:

```html
<section class="card" aria-labelledby="order">
  <h2 id="order">Order PL-20418</h2>
  <div class="tabs" role="tablist" aria-label="Order">
    <button class="tab" role="tab" aria-selected="true" type="button">Items <span class="count">3</span></button>
    <button class="tab" role="tab" aria-selected="false" type="button">Delivery</button>
  </div>
  <div class="meter" role="meter" aria-label="Packed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="42"><span></span></div>
</section>
```

```css
.card { max-inline-size: 22rem; padding: 20px; border-radius: 24px; background: #f4f3f0; }
.tabs { display: flex; gap: 4px; margin-block: 12px; }
.tab { padding: 10px 16px; border: 0; border-radius: 12px; background: none; color: #141414; font: inherit; }
.tab[aria-selected="true"] { background: #141414; color: #fff; }
.tab:focus-visible { outline: 3px solid #141414; outline-offset: 3px; }
.count { padding-inline: 6px; border-radius: 6px; background: #ffd426; color: #141414; }
.meter { block-size: 8px; border-radius: 4px; background: #d9d7d0; }
.meter > span { display: block; inline-size: 42%; block-size: 100%; border-radius: inherit; background: #141414; }

@media (forced-colors: active) {
  .card, .meter { border: 1px solid CanvasText; }
  .tab[aria-selected="true"] {
    forced-color-adjust: none;
    background: SelectedItem;
    color: SelectedItemText;
  }
  .tab[aria-selected="true"] .count { background: SelectedItemText; color: SelectedItem; }
  .tab[aria-selected="true"]:focus-visible { outline-color: CanvasText; }
  .meter > span { background: CanvasText; }
}
```

`CanvasText` is a system colour, so the browser keeps it: the card and the meter get an edge in the person's text colour, and the bar is drawn in it, solid. An edge needs no media query if you reserve it in the normal style: `border: 1px solid transparent`. Transparent is not a system colour, so in forced colours it is replaced by a visible one; in Chrome it came out `CanvasText`.

## forced-color-adjust

The [forced-color-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/forced-color-adjust) property lets one element out of the mode.

- `auto`, the default: the browser forces the element's colours.
- `none`: it leaves them alone, and MDN adds that the backplate behind its text goes too.
- `preserve-parent-color`: like `none`, except that `color` takes the forced colour of the parent.

The chosen tab needs `none` even though `SelectedItem` is already a system colour, because of the backplate. Tested in Chrome without `none`, the tab kept its `SelectedItem` fill, but each word sat on a plate of the page colour. In a dark palette that plate is black, and the black `SelectedItemText` on it vanished.

The property is inherited, so nothing inside an element with `none` is forced either. Every colour inside it is yours to choose, in system colours. The example sets the count to the reversed pair and the focus ring to `CanvasText`. Left alone, the ring would keep `#141414`, invisible on a black page.

Use `none` with your own colours only where the colour is the content: the series of a chart, which its key names by colour. The specification is plain that mixing system colours with your own "cannot guarantee any particular contrast level".

Gradients need the same care. A bar drawn with `linear-gradient()` is a `background-image`, and it computes to `none`. Opt the element out and paint the gradient with a system colour.

## Icons

The specification asks browsers to style inline SVG with `forced-color-adjust: preserve-parent-color`, so that SVG content does not break, and Chrome does. An inline icon keeps its own `fill` and `stroke`, and its `color` follows the text around it. So draw icons with `currentColor`:

```css
.icon { fill: none; stroke: currentColor; stroke-width: 2; }
```

Such an icon follows the text into any palette. A circle with `fill="#e00"` stayed red in Chrome's black palette, where a dark red would be hard to see. Pictures in `<img>` are not changed.

An icon that differs from its neighbour only by colour, such as a green dot for paid and a red one for overdue, says nothing here. Pair every colour that means something with a word or a shape.

## Focus rings

An outline survives the mode: only its colour is forced. Tested in Chrome, the outline of a focused button came out in `Highlight`. A ring drawn with `box-shadow` is removed with all other shadows. If you draw focus with a shadow, add a transparent outline beside it, which forced colours turn into a visible one:

```css
.tab:focus-visible { outline: 2px solid transparent; box-shadow: 0 0 0 3px #141414; }
```

Inside an element with `forced-color-adjust: none`, set `outline-color` to a system colour, as the example does.

## Test it

- **Chrome or Edge.** In DevTools, open the Rendering tab and set "Emulate CSS media feature forced-colors" to `active`. Chrome's emulated palette follows `prefers-color-scheme`: tested, light gave a white `Canvas` and dark a black one. Check both.
- **Playwright.** `browser.new_context(forced_colors="active", color_scheme="dark")` gives the same emulation to automated tests.
- **Windows.** Turn on a contrast theme, one dark and one light. Left Alt, Left Shift and Print Screen together switch it on and off.

Go through the page and look for four things: every control and card has an edge, the chosen item differs from the rest, focus is visible everywhere, and nothing is told by colour alone.

## Forced colours in Tray UI

Tray UI draws most things as fills with no edge, so it is the case above at scale. Its answer is one block in `95-modes.css`, 51 rules inside `@media (forced-colors: active)`:

- buttons and controls get a 1px `ButtonText` edge, fields a `FieldText` edge, and trays, cards and everything that floats a `CanvasText` edge; a disabled control is `GrayText`;
- what is chosen takes `forced-color-adjust: none` and the selected pair: a tab, a segment, a pressed toggle, the current page, a picked day, a done task;
- the option under the keyboard in a menu or list is `Highlight`;
- checkboxes, radios, switches, sliders and meters are drawn in system colours, since each is nothing but fills;
- the marks of a chart keep the colours of their series, so the key still tells them apart, and a chart of one series takes `CanvasText`.

The tab rules follow the example. A tab draws its focus ring inside its edge, over the fill, so a chosen tab's ring takes `SelectedItemText`:

```css
@media (forced-colors: active) {
  .tray-tab[aria-selected="true"], .tray-tab[aria-current]:not([aria-current="false"]) {
    forced-color-adjust: none; border-color: SelectedItem; background: SelectedItem; color: SelectedItemText;
  }
  .tray-tab[aria-selected="true"] .tray-badge { border-color: SelectedItemText; background: SelectedItemText; color: SelectedItem; }
  .tray-tab[aria-selected="true"]:focus-visible { outline-color: SelectedItemText; }
}
```

On screen, a strip of tabs or a segmented control has a pill that slides behind the chosen item. That pill exists only inside `@media (forced-colors: none)`, so in forced colours the chosen item keeps a fill of its own and the rules above draw it. Icons are drawn with `stroke: currentColor` and follow the text. A tag input whose text is invalid is edged with an inset shadow on screen; in forced colours an outline takes its place.

The rules sit beside those for more contrast and for print, and the [Accessibility](#g-accessibility) guide describes all three. [Tabs](#c-tabs), [Switch](#c-switch) and [Progress](#c-progress) each say how they look with forced colours. For the gentler setting, where the page keeps its colours and asks for stronger ones, see [prefers-contrast: more](#a-prefers-contrast-more).
