---
category: Conversation
keywords: [code block, code, snippet, pre, syntax, terminal, copy code, source]
---
# Code Block

A code block sets code apart from prose: a tray in the mono face with a header that names it and copies it.

## Use
```tsx
<CodeBlock title="stock.js" numbered mark={3}>{`
function jarsLeft(batch) {
  return batch.packed - batch.reserved;
}
`}</CodeBlock>

<CodeBlock size="sm" highlight={false} code="autumn batch: 412 packed, 280 reserved, 132 left" />  {/* output, no header */}

<p>Run <span className="tray-code-inline">npm run stock</span> in the terminal.</p>                  {/* inline code */}
```

## Parts
- The block is the resting fill with 20px corners. Long lines scroll sideways inside it; they never wrap.
- `title`: a file name or a language on the left of the header. With it, a Copy button on the right copies the code and reads "Copied" for two seconds (`copy={false}` leaves it out).
- `numbered` numbers the lines; `mark` highlights one line or several, by their numbers.
- `size="sm"` is the compact size for output inside a Trace.

## Colour
Code takes GitHub's syntax colours, as tokens (`code-keyword`, `code-string`…), which hold 4.5:1 on every ground of every theme, the ink card and the yellow card included. `highlight` (on by default) finds comments, strings, keywords, literals, numbers and the names of functions with a small tokenizer for JavaScript-like code. Turn it off for terminal output and plain text.

For HTML, CSS, JSX or any other grammar, colour the code with highlight.js and pass its output as the children; the block colours its classes, so leave out highlight.js's own theme:
```tsx
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);

<CodeBlock title="index.html">
  <span dangerouslySetInnerHTML={{ __html: hljs.highlight(source, { language: 'xml' }).value }} />
</CodeBlock>
```

A code block is always left to right, also in right-to-left pages.

## Do and don't
- Do name the language or the file in the header.
- Don't put more than about thirty lines in a block without a way to collapse it.
- Don't mirror code in right-to-left pages.
