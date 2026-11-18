# Trace

A trace shows what an agent did on the way to an answer: one line per step, with its state and how long it took. Also called an agent steps log or a reasoning trace.

## Markup
```html
<details class="tray-trace-group" open>
  <summary>…chevron-right… Worked for 42 seconds, 5 steps</summary>
  <ol class="tray-trace" role="list">
    <li class="tray-trace__line">
      <span class="tray-trace__icon">…icon…</span>
      <span class="tray-trace__title"><b>Read</b> orders-november.csv</span>
      <span class="tray-trace__meta">0.4 s</span>
    </li>
  </ol>
</details>
```
Each line is a 32px icon tile, a title that starts with a bold verb, and a time. A hairline joins the tiles.

| State | Markup |
| --- | --- |
| Done | The default. |
| Running | `data-status="running"`, a Spinner in the tile, the verb in the present ("Writing the summary"). |
| Failed | `data-status="failed"`: the tile and the verb turn `danger`; say what failed in the title. |
| Denied or skipped | Plain line with the verb "Denied" or "Skipped". |

A step's output goes in a `tray-trace__detail` at the end of its line's `<li>`, where it takes a row of its own under the title, so the list holds one item per step. It is usually a small Code Block (its `<pre tabindex="0">`, as a long line scrolls) inside a Collapsible. Wrap the whole trace in `tray-trace-group`, a disclosure that reads "Worked for 42 seconds, 5 steps": open while the work runs, closed once the answer is there.

## Accessibility
The group is the browser's own `<details>`: `Enter` or `Space` on its summary opens and closes it, and a screen reader announces it as expanded or collapsed. The steps are an `<ol>`, so each line is read with its place, and the icons and the spinner in the tiles are `aria-hidden`. The words carry the state: a running step speaks in the present tense and a failed one says what failed, so the `danger` colour is never the only sign. The trace is not a live region, so steps added while it runs are not announced. Under `prefers-reduced-motion: reduce` the group opens at once instead of unfolding.

## Do and don't
- Do write each step as verb plus object: "Read orders.csv", "Searched for chilled delivery".
- Do put a request for permission outside the trace, as an Item with Approve and Deny buttons; it is a question, not activity.
- Don't show raw tool names or arguments as the title.
- Don't keep a finished trace open over the answer.
