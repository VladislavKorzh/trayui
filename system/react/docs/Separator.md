---
category: Layout
keywords: [separator, divider, rule, hr]
---
# Separator

A separator is the one rule in the system: a 1px line in `hairline`.

## Use
```tsx
<Separator />                              {/* between blocks inside a surface */}
<Separator label="or" />                   {/* a few words in the middle of the line */}
<div className="tray-row"><span>12 orders</span><Separator orientation="vertical" /><span>$2,470</span></div>
```

## Do and don't
- Do prefer space, then fill, then a rule: surfaces are told apart by fill.
- Do use rules between rows of a list or a table, between sections of a form, above a form's footer.
- Don't draw a rule around anything; nothing is outlined.
