---
category: Actions
keywords: [toggle, toggle button, pressed, pin, bold, mute, theme switch, toolbar button]
---
# Toggle

A toggle is one button that stays pressed: on is solid ink, off is the resting fill.

## Use
```tsx
<Toggle icon="bold" aria-label="Bold" pressed={bold} onPressedChange={setBold} />   {/* icon only: always an aria-label */}
<Toggle icon="bookmark">Pin</Toggle>
<Toggle icon="bell" defaultPressed>Notify me</Toggle>
<Toggle icon="moon" iconPressed="sun" aria-label="Dark theme" />                    {/* the icon swaps with the state */}
<Toggle size="xs" icon="star">Favourite</Toggle>                                    {/* 40px, for dense toolbars */}
```

## Behaviour
A press flips `aria-pressed` and calls `onPressedChange` with the new state; apply the change at once. Use `pressed` for a controlled toggle and `defaultPressed` for one that keeps its own state. With `iconPressed`, the toggle shows `icon` while released and `iconPressed` while pressed: the theme switch shows the moon while light and the sun while dark.

## Toggle, Switch or Toggle Group
A toggle is a single on/off setting in a toolbar: bold, pin, mute, show the grid, the theme. For a setting in a form or a list of settings, use Switch. For a choice among several options, use Toggle Group.

## Do and don't
- Do keep the label the same in both states ("Pin", not "Pin" and "Unpin"); `aria-pressed` carries the state.
- Don't use yellow for the pressed state. Selected is always solid ink.
