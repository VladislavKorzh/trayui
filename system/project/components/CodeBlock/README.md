# Code Block

A code block sets code apart from prose: a tray in the mono face with a header that names it and copies it.

## Markup
```html
<div class="tray-code tray-code--numbered">
  <div class="tray-code__head">
    <span>stock.js</span>
    <button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#stock-code">
      …copy icon… <span data-label>Copy</span>
    </button>
  </div>
  <pre tabindex="0"><code id="stock-code"><span class="tray-code__line">…</span></code></pre>
</div>
```
- The block is the resting fill with 20px corners; long lines scroll sideways inside it, they never wrap.
- The header is optional: a file name or a language on the left, a Copy button on the right. `data-tray="copy"` copies the target's text and reads "Copied" for two seconds.
- `tray-code--numbered` numbers the `tray-code__line` spans. `data-mark` on a line highlights it.
- `tray-code--sm` is the compact size for output inside a Trace.
- Inline code in a sentence is `tray-code-inline`.

## Colour
Code takes GitHub's syntax colours, as tokens: `code-comment`, `code-keyword`, `code-string`, `code-function`, `code-tag`, `code-constant` and `code-variable`. Each holds 4.5:1 on every ground of every theme. On the ink card the code takes `on-dark-code-*` and on the yellow card `paper-code-*`, with no class of yours. Punctuation and plain names keep the ink.

The colours land on the classes [highlight.js](https://highlightjs.org) writes, so colour the code with it, when the page is built or in the page, and put its output in the `<code>`. Leave out highlight.js's own theme: the block colours its output itself.
```js
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);

code.innerHTML = hljs.highlight(source, { language: 'xml' }).value;
```
- With numbered lines, put each line of the output in its own `tray-code__line`; split it at the line breaks.
- For a word or two marked by hand, `tray-tok-k` (keywords), `tray-tok-s` (strings) and `tray-tok-c` (comments) take the same colours.
- Terminal output and plain text stay in ink: give them no classes.

The mono face is the system stack; no code font is shipped.

## Accessibility
The copy button keeps its name in `data-label`, which reads "Copied" for two seconds, or "Copy failed" when the browser refuses, and a hidden `role="status"` beside the button says the same aloud. The syntax colours carry no meaning of their own; a line marked with `data-mark` is only tinted, so say in the text which line matters. A `<pre tabindex="0">` that scrolls sideways takes focus, and its ring is drawn inside the block's rounded edge, so the block's clipping does not cut it. Line numbers are drawn by CSS, and some screen readers read them before each line. In a right-to-left page set `dir="ltr"` on the block, as the example does, so the code keeps its direction. Under `prefers-reduced-motion: reduce` the new word on the button appears without its pop.

## Do and don't
- Do give the `<pre>` a `tabindex="0"` so a keyboard can scroll it.
- Do name the language or the file in the header.
- Don't put more than about thirty lines in a block without a way to collapse it.
- Don't mirror code in right-to-left pages; a code block is always left to right.
- Don't link a highlight.js theme: its background and colours are not the system's, and they do not change with the ground.
