# Separator

A separator is the one rule in the system: a 1px line in `hairline`. Also called a divider or a horizontal rule.

## Markup
`<hr class="tray-rule">` between blocks. `tray-rule--v` is the vertical form inside a row (it stretches to the row's height; give it `role="separator" aria-orientation="vertical"` when it is a `<span>`). `tray-rule--label` puts a few words in the middle of the line, for "or" between two ways to sign in, or a date between messages: `<p class="tray-rule tray-rule--label">or</p>`.

## When to use it
Surfaces are told apart by fill, so most layouts need no rules at all. Use a separator inside a surface: between rows of a list or a table, between sections of a form, above a form's footer.

## Accessibility
An `<hr>` is a separator to a screen reader, and so is a `<span class="tray-rule tray-rule--v">` once it has `role="separator"` and `aria-orientation="vertical"`. It has no name and takes no focus, so a rule never stands in for a heading: the sections on either side still need their own. A labelled rule is a plain `<p>`, read as its words; don't give it `role="separator"`, whose content is not read, so the "or" or the date would be lost. Its lines are drawn by CSS and are not announced. With forced colours the line is drawn in the text colour, so it still shows.

## Do and don't
- Do prefer space, then fill, then a rule.
- Don't draw a rule around anything; nothing is outlined (the No-Outline Rule).
- Don't use `rule-strong` here; it is the baseline of a chart.
