# Tour

A tour points at parts of a screen one at a time: a small raised panel beside the part, with a count, a sentence or two, and "Next".

## Markup
```html
<div class="tray-tour-area" data-tray="tour">
  …the screen, with ids on the parts the tour points at…

  <div class="tray-tour tray-raised" role="dialog" aria-labelledby="tour-1" data-for="#orders-filter">
    <p class="tray-tour__count"></p>
    <h2 class="nav" id="tour-1">Filter by status</h2>
    <p class="tray-pop__text">Show only the orders that still need packing.</p>
    <div class="tray-tour__foot">
      <button class="tray-btn tray-btn--link" type="button" data-tour="skip">Skip the tour</button>
      <button class="tray-btn tray-btn--dark tray-btn--xs" type="button" data-tour="next">Next</button>
    </div>
  </div>
  <div class="tray-tour tray-raised" role="dialog" aria-labelledby="tour-2" data-for="#orders-export" hidden>…</div>
</div>
```
## Behaviour
`data-tray="tour"` on the area that holds both the screen and the steps. Each `tray-tour` names its target with `data-for`; the step that is not `hidden` is the one shown. The current target gets a 3px ink ring (`data-tour-on`) and the panel is placed under it, or over it when there is no room. Buttons carry `data-tour="next"`, `"back"` or `"skip"`; "next" on the last step ends the tour. The count is written for you. It fires `tray:change` with `{ step }` and `tray:complete` with `{ finished }`: remember there that the tour was seen.

## Do and don't
- Do keep a tour to three or four steps, and let it be skipped from every step.
- Do point at things the person will use today.
- Don't start a tour over a screen that is still empty: show the Empty state or the Onboarding Checklist first.
- Don't dim the page behind it. The ring is enough, and the screen stays usable.
