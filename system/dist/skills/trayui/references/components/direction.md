# Direction

Direction is how the system follows the reading direction of the language: set `dir="rtl"` and every component mirrors. Also called RTL support or bidirectional layout.

## How it works
There is no component to add. Put `dir="rtl"` on `<html>` (or on a region), with the right `lang`, and the layout flips, because the styles use logical properties throughout: `inline-start` and `inline-end`, never left and right.

What mirrors by itself: text alignment, the order of rows, paddings, the side a switch knob travels to, the check at the end of a menu item, the chevron of a select, the range band of a calendar, the fill of a slider.

What you mark: an icon that points along the reading direction (back and forward arrows, chevrons in breadcrumbs and pagination) takes `tray-icon--flip`. Icons that show a real object or a clock do not flip.

Mirrored with the page as well, as people who read right to left expect: the time axis of a bar, line or area Chart (the first month at the start edge), and the bar of the Video Player with its seek bar.

What never mirrors: numbers, the cells of an Input OTP (a code keeps its order), a radar or round chart, and the code in a code block.

## You provide
`dir` and `lang` on the document, and for mixed content `dir="auto"` on user-written text so a Latin name inside an Arabic page reads correctly.

## Accessibility
Set `lang` along with `dir`: a screen reader takes its voice and pronunciation from `lang`, and `dir` says nothing about the language. Reading order and `Tab` order follow the source, so a mirrored page is read in the same order as before. In a right-to-left page `ArrowLeft` and `ArrowRight` swap in Tabs, the Menubar and submenus, the Calendar, the Carousel, the Resizable handle, the plot of a bar, line or area Chart, the Lightbox and the video's seek bar, so the arrow keys still point the way things move. In an Input OTP, whose cells do not mirror, they go to the cell on their side. Each follows the direction the part is laid out in, so a `dir="ltr"` region inside a right-to-left page keeps its left-to-right keys.

## Do and don't
- Do test one real screen in a right-to-left language before shipping there.
- Don't use physical properties (`margin-left`, `text-align: right`) in product styles built on this system.
- Don't flip the brand mark or a product drawing.
