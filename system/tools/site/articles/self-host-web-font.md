# Self-hosting a web font with one woff2 file

Self-host a variable font from one woff2 file: the `@font-face` rule, `font-display`, a preload with `crossorigin`, CORS for other sites and the OFL licence.

## One file for every weight

A variable font holds a range of designs in one file, along axes such as weight. Onest, Tray UI's typeface, has one axis, `wght`, from 100 to 900, so one file serves the 400 of body text, the 600 of buttons, the 700 of headings, and any weight between. Measured in Chrome, a line set at 650 is wider than at 600 and narrower than at 700: the browser draws the exact weight asked for.

The same font comes in two formats:

| File | Size |
| --- | --- |
| `Onest-Variable.ttf` | 193,056 bytes |
| `Onest-Variable.woff2` | 84,020 bytes |

WOFF2 is a compressed wrapper for the same font data. Read with fontTools, both files hold the same 876 glyphs, the same tables and the same weight axis; the WOFF2 is 44% of the size. MDN's compatibility data lists WOFF2 in Chrome since version 36, Firefox 39, Safari 10 and Edge 14, so it is the one file a page needs.

Self-hosting means serving that file from your own origin, beside your stylesheet, with your own caching, instead of linking a font service.

## The @font-face rule

```css
@font-face {
  font-family: "Onest";
  src: url("fonts/Onest-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

body { font-family: Onest, "Helvetica Neue", Arial, sans-serif; }
```

- **`src`** is resolved against the address of the stylesheet that holds the rule. A stylesheet at `/css/site.css` finds this font at `/css/fonts/`.
- **`format("woff2")`** is a hint. MDN: when the browser does not support a format, "it skips downloading the font resource". In a list of sources, the browser uses the first it can load, so put WOFF2 first.
- **`font-weight: 100 900`** declares the range of weights this one face covers. MDN describes the two-value form as "a range that is supported by a font face". With one `@font-face` for the whole range, there is nothing to repeat per weight.
- **`font-display: swap`** decides what text does while the font is on its way, below.

The browser downloads a face only when text on the page needs it. A page that declares Onest and sets everything in Arial makes no request for the file at all. That is also why the request starts late: the browser has to fetch the HTML and the stylesheet, and work out which text uses the family, before it asks for the font.

## font-display

The CSS Fonts specification divides the wait for a font into a block period, when text that uses it is drawn invisibly, and a swap period, when text is drawn in a fallback and swapped once the font arrives. Each value of `font-display` sets the two:

| Value | Block period | Swap period |
| --- | --- | --- |
| `block` | short, 3s recommended | infinite |
| `swap` | extremely small, 100ms or less recommended | infinite |
| `fallback` | extremely small | short, 3s recommended |
| `optional` | extremely small | none: the font is used only if it is there almost at once |

`swap` shows text almost at once and never gives up on the font. Its cost is the swap itself: when the font arrives, text set in the fallback is set again, and if the two fonts take different room, lines rewrap and the page moves. A preload makes the font arrive sooner, and a fallback with matching metrics makes the swap move less.

## Preload it, with crossorigin

A preload asks for the font as soon as the browser reads the `<head>`, beside the stylesheets, instead of after the styles are worked out:

```html
<link rel="preload" href="/fonts/Onest-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
```

- **`crossorigin` is required, even on your own origin.** The specification fetches fonts with the CORS mode "cors", and MDN says that the preload's `crossorigin` "needs to be set to match the resource's CORS and credentials mode, even when the fetch is not cross-origin". Without it, the preload is a different request from the one `@font-face` makes. In Chrome the font is then downloaded twice, and the console says: "A preload for … is found, but is not used because the request credentials mode does not match."
- **`type="font/woff2"`** lets a browser that cannot read the format skip the download.
- **The address must be the one `@font-face` resolves to.** A preload of `/fonts/a.woff2` does nothing for a rule that resolves to `/css/fonts/a.woff2`. Open the Network panel and check that the font appears once.

Preload only the files every page uses at once. One variable file makes that choice easy.

## Serving the font to other sites

A font is fetched in CORS mode, so a font on another origin loads only if its server allows it. The specification notes that "fonts will typically not be loaded cross-origin unless authors specifically take steps to permit cross-origin loads". The step is a response header:

```text
Access-Control-Allow-Origin: *
```

It matters when other sites link your stylesheet. Their pages fetch the stylesheet from you, its `url()` points at your server, and the font request comes from their origin. In Chrome, without the header the face fails and the console says the font "has been blocked by CORS policy"; with it, the same font loads.

## A fallback that takes the same room

Until Onest arrives, `swap` draws the text in the next family of the stack. Measured in Chrome, a sentence set in Onest is about 5% wider than in Arial, and an 18px paragraph 340px wide is 132 pixels tall in Onest and 126 in Arial: the swap moves everything under it.

`@font-face` can build a fallback face from a local font and resize it to match. MDN describes `size-adjust` as "a multiplier for glyph outlines and metrics"; `ascent-override`, `descent-override` and `line-gap-override` set the vertical metrics outright:

```css
@font-face {
  font-family: "Onest fallback";
  src: local("Arial");
  size-adjust: 105%;
  ascent-override: 92.4%;
  descent-override: 29%;
  line-gap-override: 0%;
}

body { font-family: Onest, "Onest fallback", sans-serif; }
```

The numbers come from the two fonts. `size-adjust` is the width of a sample sentence in Onest divided by its width in Arial. Onest's ascent and descent are 970 and 305 units on a 1,000 unit square, divided by the same 1.05 since the overrides are scaled too. With this face the paragraph is 132 pixels tall, as in Onest, and a phrase that is 169 pixels wide in Onest and 160 in Arial is 168.

A `local()` face matches one installed font, so it helps only where that font is installed; a system with another fallback needs a face of its own. MDN marks `size-adjust` as available across browsers since September 2023, and `ascent-override` as not yet in every major browser.

## Smaller still: a subset

Onest's 780 characters include all of Basic Latin and Latin Extended-A, most of Latin-1 and 162 Cyrillic letters and signs. A site in English needs little beyond Basic Latin and Latin-1. fontTools makes a subset that keeps the weight axis and the layout features:

```sh
pyftsubset Onest-Variable.woff2 --flavor=woff2 --layout-features='*' --name-IDs='*' \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212" \
  --output-file=Onest-Latin.woff2
```

The Latin file is 36,040 bytes, 43% of the whole. `--name-IDs='*'` keeps every record of the font's name table: by default the tool keeps only records 0 to 6, and drops the licence description and its address. Give the subset's `@font-face` the same ranges in `unicode-range`, and give a second face the Cyrillic range: in Chrome, a page in English then downloads only the Latin file, and the second file comes when a Cyrillic word appears.

## The licence travels with the file

Onest is under the SIL Open Font License 1.1. Its conditions, from the licence text:

1. The font may be used, embedded, redistributed and bundled with software, but not sold by itself.
2. Each copy contains the copyright notice and the licence, as a text file or in the font's own metadata.
3. A modified version may not use a Reserved Font Name.

Onest's copyright line names no Reserved Font Name. The OFL FAQ (2.2) says a change of format normally counts as a modification, but a WOFF or WOFF2 made by compression alone, with the font data unchanged, does not. The WOFF2 carries its notices inside too: its name table holds the copyright line, a licence description and the address of the licence. Keep `OFL.txt` beside the font file anyway, in every place you copy it.

## The font in Tray UI

Tray UI declares the font in its tokens, as the family Onest, the file `fonts/Onest-Variable.ttf` and the weights `100 900`. `tools/build.py` writes the rule into `tokens.css`, with the WOFF2 offered first and the TrueType file after it:

```css
@font-face { font-family: "Onest"; src: url("fonts/Onest-Variable.woff2") format("woff2"), url("fonts/Onest-Variable.ttf") format("truetype"); font-weight: 100 900; font-style: normal; font-display: swap; }
```

`--font-sans` is `Onest, "Helvetica Neue", Arial, sans-serif`. Tray UI has no fallback face with adjusted metrics: until the font arrives, text is set in Helvetica Neue, or Arial where that is missing.

The `fonts/` folder beside `tokens.css` holds both files and `OFL.txt`, in the download, in the `trayui` package on npm and in the repository. The build copies the licence into every folder it puts the font in, including the stylesheet folder of the React package.

The docs site preloads the WOFF2 with `crossorigin`. Its own copy of `tokens.css` lives in a folder of hashed files, `_/`, and the site's build rewrites `fonts/` to `../fonts/` in it, so the rule and the preload both resolve to `/fonts/Onest-Variable.woff2`. Served locally and opened in Chrome, a component page requests the file once. The site's response headers give `/fonts/*` `Access-Control-Allow-Origin: *` and a week of caching, so a page elsewhere that links `https://trayui.com/tokens.css` gets the font as well.

To set the system in another typeface, declare its face and point `--font-sans` at it, as [Theming](#d-theming) shows. [Typography](#f-type) lists the type styles and their weights, and [Installation](#d-installation) has the files.
