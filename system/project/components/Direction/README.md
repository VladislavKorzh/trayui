# Direction

Direction is how the system follows the reading direction of the language: set `dir="rtl"` and every component mirrors.

## How it works
There is no component to add. Put `dir="rtl"` on `<html>` (or on a region), with the right `lang`, and the layout flips, because the styles use logical properties throughout: `inline-start` and `inline-end`, never left and right.

What mirrors by itself: text alignment, the order of rows, paddings, the side a switch knob travels to, the check at the end of a menu item, the chevron of a select, the range band of a calendar, the fill of a slider.

What you mark: an icon that points along the reading direction (back and forward arrows, chevrons in breadcrumbs and pagination) takes `tray-icon--flip`. Icons that show a real object or a clock do not flip.

What never mirrors: numbers, charts' time axes, media controls, and the code in a code block.

## You provide
`dir` and `lang` on the document, and for mixed content `dir="auto"` on user-written text so a Latin name inside an Arabic page reads correctly.

## Do and don't
- Do test one real screen in a right-to-left language before shipping there.
- Don't use physical properties (`margin-left`, `text-align: right`) in product styles built on this system.
- Don't flip the brand mark or a product drawing.
