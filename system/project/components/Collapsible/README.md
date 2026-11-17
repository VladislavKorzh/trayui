# Collapsible

A collapsible shows and hides one block of detail under a short trigger.

## Markup
```html
<details class="tray-collapsible">
  <summary><span>Show the figures</span><span class="tray-tile" aria-hidden="true">…plus icon…</span></summary>
  <div class="tray-collapsible__body">…a table…</div>
</details>
```
The trigger is `nav` type with the 44px tile beside it; the plus turns into a cross when open. Use it for the table behind a chart, the full list behind "3 more", the technical details of an error.

## Collapsible or Accordion
One block of optional detail is a collapsible. A set of sibling questions is an Accordion.

## Do and don't
- Do keep the same trigger text open and closed; the tile shows the state.
- Do make sure what is hidden is optional.
- Don't add a motion of your own: the content unfolds to its height (and opens at once for a visitor who asks for reduced motion, or where the browser cannot ease to it).
