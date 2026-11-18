# Settings Section

A settings section is one topic of a settings page: its name and a line of explanation in a narrow column at the start edge, its controls on a card beside it. Also called a section of a settings form.

## Markup
```html
<section class="tray-settings" aria-labelledby="set-orders">
  <div class="tray-settings__intro">
    <h2 class="subtitle" id="set-orders">Orders</h2>
    <p>How new orders reach the packing table.</p>
  </div>
  <div class="tray-settings__body">
    <div class="tray-card">
      <div class="tray-setting">
        <div class="tray-setting__text"><b id="s1">Print a label for every order</b><small id="s1-note">On the printer by the packing table.</small></div>
        <div class="tray-setting__control">
          <label class="tray-switch"><input type="checkbox" role="switch" aria-labelledby="s1" aria-describedby="s1-note" checked><span class="tray-switch__track"></span></label>
        </div>
      </div>
    </div>
    <div class="tray-settings__foot">
      <span class="tray-settings__note">Unsaved changes</span>
      <button class="tray-btn tray-btn--ghost tray-btn--sm" type="reset">Discard</button>
      <button class="tray-btn tray-btn--sm" type="submit">Save</button>
    </div>
  </div>
</section>
```
| Part | Use |
| --- | --- |
| `tray-settings` | Two columns from 56rem up, one below. Sections that follow each other get a hairline between them. |
| `tray-setting` | One row: the name in bold with a line under it, the control at the end edge. Rows are ruled. |
| `tray-setting__control` | A Switch, a small Select, a small Input, or a quiet button that opens a Dialog. |
| `tray-settings__foot` | "Save" and "Discard", for a section that is a form. A switch that saves by itself needs no foot. |

A section that deletes or transfers things comes last, with `danger` buttons and a title that says what is lost.

## Accessibility
The `<section>` takes its name from its heading through `aria-labelledby`, so a screen reader can list it with the page's regions and jump to it. The bold name of a row sits outside its control, so the control points at it with `aria-labelledby`. Point `aria-describedby` at the line under the name as well, as the example does, so the effect is read when the control takes focus. A button in a row needs a name that holds the setting, such as `aria-label="Change the courier days"`, since "Change" alone says nothing outside its row. The section that deletes says what it does in words, not only in the `danger` colour.

## Do and don't
- Do name a switch by what happens when it is on.
- Do save a switch at once and a text field with the "Save" button; never mix the two in one card.
- Don't hide a setting's effect in a tooltip. The line under the name is where it goes.
- Don't put more than seven rows in a card. Split the topic.
