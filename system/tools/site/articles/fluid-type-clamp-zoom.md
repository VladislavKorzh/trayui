# Fluid type with clamp() that grows with zoom

Why a clamp() font size made of vw alone ignores browser zoom and text size, what a rem part changes, and how to check fluid headings against WCAG 1.4.4.

## Fluid type with clamp()

A fluid heading grows with the window, between a smallest and a largest size:

```css
h1 { font-size: clamp(2.75rem, 0.25rem + 6.2vw, 6rem); }
```

`clamp(min, preferred, max)` takes the middle value and holds it between the two ends. The middle value is a straight line: a fixed part plus a share of the window's width, where `1vw` is a hundredth of it. Pick two points, the smallest size in a narrow window and the largest in a wide one, and the line follows:

```js
// The clamp() that grows from `min` pixels in a window `from` pixels wide to `max` pixels at `to`
function fluid(min, max, from, to) {
  const slope = (max - min) / (to - from);
  const base = min - slope * from;
  const rem = (px, places = 3) => +(px / 16).toFixed(places) + 'rem';
  return `clamp(${rem(min)}, ${rem(base, 2)} + ${+(slope * 100).toFixed(2)}vw, ${rem(max)})`;
}

fluid(44, 96, 645, 1484); // "clamp(2.75rem, 0.25rem + 6.2vw, 6rem)"
fluid(44, 96, 476, 1714); // "clamp(2.75rem, 1.5rem + 4.2vw, 6rem)"
```

The first line is Tray UI's display size: 44 pixels in a window 645 pixels wide, growing to 96 pixels at 1484. The fixed part, `0.25rem`, falls out of the arithmetic. It also decides what browser zoom does to the heading.

## What zoom does to a CSS pixel

Browser zoom, Ctrl or Cmd with the plus key, makes each CSS pixel larger. MDN's page on [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio): "When a page is zoomed in (made larger), the size of a CSS pixel increases, and so the `devicePixelRatio` value increases." A window 1280 screen pixels wide, zoomed to 200%, is 640 CSS pixels wide.

- A size in `rem` or `px` keeps its number of CSS pixels. Each is twice as large, so the text is twice as large on screen.
- A size in `vw` is a share of the window's width in CSS pixels, and that width has halved. `6.6vw` of 640 is 42.2 CSS pixels, which is 84.5 screen pixels: the size `6.6vw` gave at 100%. On screen it does not move.

The browser's text size setting, such as Font size in Chrome's Appearance settings, changes what `1rem` is. It does not change `vw` at all.

WCAG's failure technique [F94](https://www.w3.org/WAI/WCAG22/Techniques/failures/F94) names the problem: viewport units "cannot be resized by zooming or adjusting text-size", and text sized with them as the primary method is "likely to cause a failure" of [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), which asks that text "can be resized without assistive technology up to 200 percent".

## A clamp() of vw alone

`clamp(2.75rem, 6.6vw, 6rem)` has `rem` ends and a middle of `vw` alone. Inside its range, zoom leaves the heading at the same size on screen while the body text beside it doubles: measured in Chrome in a window 1400 pixels wide, the heading was 92.4 screen pixels at 100% and 92.4 at 200%, and the body text went from 18 to 36. The heading grows only once zoom has narrowed the window, in CSS pixels, to where the `2.75rem` floor takes over. From there it grows with the zoom.

These are the sizes in screen pixels of three versions of the display size and of body text, measured in Chrome in a window 1280 pixels wide:

| Zoom | `6.6vw` | `0.25rem + 6.2vw` | `1.5rem + 4.2vw` | Body, `1.125rem` |
| --- | --- | --- | --- | --- |
| 100% | 84.5 | 83.4 | 77.8 | 18 |
| 200% | 88 | 88 | 101.8 | 36 |
| 300% | 132 | 132 | 132 | 54 |
| 400% | 176 | 176 | 176 | 72 |
| 500% | 220 | 220 | 220 | 90 |

All three middles sit inside the same ends, `2.75rem` and `6rem`. At 200%, the first two grow by 4% and 6%, and part of that is the floor. From 300% on, all three are on the floor, and the floor grows with the zoom.

## Give the middle a rem part

On screen, a middle of `a rem + b vw` measures zoom × `a` plus `b`% of the window. Zoom scales the `rem` part alone, so the share of `rem` in the middle is the share of the size that zoom acts on.

- In `0.25rem + 6.2vw` at 1280 pixels, 4 of the 83 pixels are `rem`, about 5%. Zoom to 200% adds those 4 pixels, and the floor lifts the result to 88. In the 1400-pixel window it went from 90.8 to 94.8.
- In `1.5rem + 4.2vw`, 24 of the 78 pixels are `rem`, about 31%. Zoom to 200% adds 24 pixels, and the heading grows from 78 to 102.

A larger `rem` share costs some fluidity: the line is flatter. `1.5rem + 4.2vw` reaches its ends at 476 and 1714 pixels, where `0.25rem + 6.2vw` reaches them at 645 and 1484. Between those widths, the window matters less and the person's settings matter more. A middle of `rem` alone is no longer fluid at all.

## The ends

Write both ends in `rem`. Ends in `px` grow with zoom but not with the text size setting.

The ends also decide whether text can ever reach twice its size. At a high zoom the window in CSS pixels becomes narrow, the size falls to its floor, and from there it grows with the zoom: at 400%, every version above is 176 pixels, at least twice what it was at 100%. Maxwell Barvian worked this through in [Addressing Accessibility Concerns With Using Fluid Type](https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/). His starting point is that browsers zoom to 500%, so if the largest size is at most 2.5 times the smallest, five times the floor is at least twice the largest size, and the text can always reach 200%.

WCAG does not say at which zoom level text has to reach twice its size. F94's test asks only that text "can be resized up to 200% of the default" by the browser's zoom, its text size setting or controls on the page. By that test, text that gets there at 400% passes. If you want headings to grow at 200% as the body text does, the `rem` share is how.

## The text size setting

Some people leave zoom alone and set a larger default font size instead. Measured with Chrome's default font size set to 24 and 32 pixels, in the same 1280-pixel window:

| Default font size | `6.6vw` | `0.25rem + 6.2vw` | `1.5rem + 4.2vw` | Body, `1.125rem` |
| --- | --- | --- | --- | --- |
| 16px | 84.5 | 83.4 | 77.8 | 18 |
| 24px | 84.5 | 85.4 | 89.8 | 27 |
| 32px | 88 | 88 | 101.8 | 36 |

The `vw` middle ignores the setting until the floor, `2.75rem`, becomes larger than it. The `rem` part follows it in proportion.

## Check your own

1. Open the page in a desktop browser window about 1280 pixels wide.
2. Zoom to 200%, then 400%, and compare each heading with the body text.
3. Read the size in the console. `devicePixelRatio` grows with zoom, so their product follows the size on screen. On a high-density display it starts at 2, so compare the numbers with each other.
4. Set a larger default font size in the browser's settings and look again.

```js
parseFloat(getComputedStyle(document.querySelector('h1')).fontSize) * devicePixelRatio
```

In an automated test, a zoom of `z` in a window `w` pixels wide is a viewport of `w / z` CSS pixels with a device scale factor of `z`. In Python Playwright that is `browser.new_context(viewport={"width": 640, "height": 400}, device_scale_factor=2)` for 200% of 1280; the measurements above were made that way.

## Fluid type in Tray UI

Tray UI's five heading sizes are tokens in `tokens.css`:

| Token | Value | Fluid in windows |
| --- | --- | --- |
| `--display-size` | `clamp(2.75rem, 0.25rem + 6.2vw, 6rem)` | 645 to 1484px |
| `--headline-size` | `clamp(2.125rem, 0.25rem + 4.2vw, 4rem)` | 714 to 1429px |
| `--title-size` | `clamp(1.75rem, 0.25rem + 2.6vw, 2.5rem)` | 923 to 1385px |
| `--subtitle-size` | `clamp(1.375rem, 0.5rem + 1.4vw, 1.75rem)` | 1000 to 1429px |
| `--figure-size` | `clamp(4rem, 0.25rem + 7.2vw, 7rem)` | 833 to 1500px |

The classes `display`, `headline`, `title`, `subtitle` and `figure` read them, and so do components: the value of a stat card takes `title-size`, the price of a plan `headline-size`, the title of a chart `subtitle-size`.

In version 0.1.0 each middle was `vw` alone; `--display-size` was `clamp(2.75rem, 6.6vw, 6rem)`. Version 0.2.0 gave each a `rem` part, under "Type that grows with zoom" in the [Changelog](#d-changelog). The part is small, a quarter of a rem for four sizes and half a rem for the subtitle, so inside the range zoom adds a few pixels, as the table shows. The ends carry the rest. The largest size is at most 2.18 times the smallest, for the display size, which is inside Barvian's 2.5: at 400% zoom in a 1280-pixel window, the display size is 176 pixels, 2.1 times its 83.

To make the headings grow more at 200%, set the tokens again after `tokens.css` with a larger `rem` share:

```css
:root {
  --display-size: clamp(2.75rem, 1.5rem + 4.2vw, 6rem);
}
```

[Space and shape](#f-scale) lists the fluid tokens, [Typography](#f-type) the type styles, and the [Typography](#c-typography) component how to use them. The [Accessibility](#g-accessibility) guide's checks before shipping include zooming to 200%.
