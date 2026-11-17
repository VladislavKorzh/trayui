# Accordion

An accordion is a list of questions that open one at a time: hairline rows, a bold question, a plus tile that turns into a cross.

## Markup
```html
<div class="tray-accordion">
  <details name="faq" open>
    <summary>What does it taste like? <span class="tray-tile" aria-hidden="true">…plus icon…</span></summary>
    <p class="tray-accordion__body">Mild and earthy…</p>
  </details>
</div>
```
It is the browser's own `<details>`: no script, searchable with find-in-page, open by default where you set `open`. Give the details the same `name` to let only one be open at a time; leave `name` out to let several stay open.

`tray-accordion` sets questions in `subtitle`; `tray-accordion--sm` sets them in `control` for settings and filters. Answers are `ink-soft` and at most 60 characters wide.

## Do and don't
- Do write the summary as the question a person would ask.
- Do open the first item when the answers are the point of the page.
- Don't hide anything a person must read to finish a task.
- Don't nest accordions.
