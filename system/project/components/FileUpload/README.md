# File Upload

File upload is a tray with a dashed edge that takes files dropped on it or chosen from the device, and lists them underneath.

## Markup
```html
<div class="tray-field">
  <span class="tray-label" id="up-label">Product photos</span>
  <div class="tray-drop" data-tray="dropzone" data-list="#up-list" data-max-mb="10">
    <span class="tray-drop__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-upload"/></svg></span>
    <p class="tray-drop__text"><b>Drop photos here or <u>choose files</u></b><small>PNG or JPG, up to 10 MB each</small></p>
    <input type="file" multiple accept="image/png, image/jpeg" aria-labelledby="up-label">
  </div>
  <div class="tray-attachments" id="up-list"></div>
</div>
```
## Behaviour
`data-tray="dropzone"`: files that are dropped or chosen are added to the element named in `data-list` as Attachment rows with the name, the size and a button that removes the row. A file over `data-max-mb` is listed with "Too large" (`data-too-large` sets that sentence, with `{max}` for the number). While files are held over it the edge turns solid ink. It fires `tray:change` with `{ files }`, the real `File` objects: start your upload there and show its progress in the row.

The file input covers the whole tray, so a click, a tap and the keyboard all open the picker. `tray-drop--row` is the short form for a narrow column.

## Accessibility
The tray holds the browser's own `<input type="file">`, stretched over it and named through `aria-labelledby` by the visible label. `Tab` reaches it, `Space` or `Enter` opens the picker, and the whole tray draws the 3px ink focus ring. Dropping needs a pointer, choosing does not. Each row in the list has a remove button named after its file ("Remove jar-50g-front.jpg"), and a file that is too large says so in words as well as in `danger`. Rows and progress are not announced: give each bar `role="progressbar"` and a name, as in the example, and say when an upload ends in a `role="status"` region.

## Do and don't
- Do say which kinds of file and how large, inside the tray.
- Do keep a failed file in the list with the reason and a way to try again.
- Don't upload on drop without showing progress.
- Don't make dropping the only way: "choose files" is always there.
