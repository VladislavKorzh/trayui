# Upgrade Prompt

An upgrade prompt stands where a feature would be when the plan does not have it: what the feature does, which plan has it, and one button to get it.

## Markup
```html
<div class="tray-card tray-upsell">
  <span class="tray-upsell__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-lock"/></svg></span>
  <div class="tray-upsell__text">
    <h3 class="subtitle">Courier tracking is part of Shop</h3>
    <p>See where every box is and tell the customer before they ask.</p>
  </div>
  <div class="tray-upsell__actions">
    <a class="tray-btn tray-btn--md" href="/billing/plans">Upgrade to Shop</a>
    <a class="tray-btn tray-btn--link" href="/plans">Compare plans</a>
  </div>
</div>
```
| Form | Use |
| --- | --- |
| `tray-card tray-upsell` | In place of a whole section the plan lacks. |
| `tray-alert tray-alert--accent` | One line inside a page, when a limit was reached. It is the Alert. |
| `tray-locked` | Over a preview of the feature: `tray-locked__content` is dimmed and takes `inert`; `tray-locked__prompt tray-raised tray-upsell` floats on it. |

The dimmed preview must be `inert` and `aria-hidden="true"`: it is a picture of the feature, not the feature.

## Do and don't
- Do name the plan and say what the person gets, in their words.
- Do offer a way to compare plans beside the button.
- Don't show the prompt where the person cannot upgrade. Tell a team member to ask the owner instead.
- Don't interrupt a task with it. It waits where the feature lives.
