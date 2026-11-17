# Feedback Widget

The feedback widget asks one question with a row of numbers, then offers a box for the reason, then says thanks.

## Markup
```html
<form class="tray-card tray-feedback" data-tray="feedback">
  <div data-feedback="ask">
    <fieldset class="tray-scale">
      <legend class="tray-label">How likely are you to recommend Counter to another farm?</legend>
      <label><input type="radio" name="rating" value="0"><span>0</span></label>
      …
      <label><input type="radio" name="rating" value="10"><span>10</span></label>
    </fieldset>
    <p class="tray-scale__ends"><span>Not at all</span><span>Very</span></p>
  </div>
  <div data-feedback="more" hidden>
    <label class="tray-label" for="why">What is the main reason?</label>
    <textarea class="tray-textarea" id="why"></textarea>
    <button class="tray-btn tray-btn--sm" type="submit">Send</button>
  </div>
  <p data-feedback="thanks" hidden>Thank you. Oksana reads every answer.</p>
</form>
```
## Behaviour
`data-tray="feedback"` on the form: choosing a `rating` shows the part marked `data-feedback="more"`; sending hides the question and shows `data-feedback="thanks"`, which takes the focus. It fires `tray:complete` with `{ rating, comment }`: post the answer there.

`tray-scale` is a row of radio buttons drawn as number tiles; the chosen one is solid ink. Use 0 to 10 for "would you recommend", 1 to 5 for "how was it". Name both ends in `tray-scale__ends`.

## Accessibility
The scale is a `<fieldset>` of native radios: the `<legend>` asks the question, each number names its radio, `Tab` enters the group and the arrow keys move the choice. The tile under focus shows the 3px ink ring. Choosing a number shows the reason box and leaves focus where it is. Sending moves focus to the thanks, so it is read at once. The named ends sit outside the fieldset, so each end is tied to its radio: give each word of `tray-scale__ends` an `id` and point the first and the last radio's `aria-describedby` at it, as the example does, so "0" is read with "Not at all" and "10" with "Very".

## Do and don't
- Do ask after the person finished something, not while they work.
- Do let it be closed without answering, and do not ask again for a few months.
- Don't use faces or stars for the scale. Numbers with named ends are read the same by everyone.
- Don't make the reason required.
