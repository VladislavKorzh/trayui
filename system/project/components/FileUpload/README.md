# File Upload

File upload is a tray with a dashed edge that takes files dropped on it or chosen from the device, and lists them underneath.

## Markup
```html
<div class="tray-field">
  <span class="tray-label" id="up-label">Product photos</span>
  <div class="tray-drop" data-tray="dropzone" data-list="#up-list" data-max-mb="10">
    <span class="tray-drop__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-upload"/></svg></span>
    <p class="tray-drop__text"><b>Drop photos here or <u>choose files</u></b><small id="up-note">PNG or JPG, up to 10 MB each</small></p>
    <input type="file" multiple accept="image/png, image/jpeg" aria-labelledby="up-label" aria-describedby="up-note">
  </div>
  <div class="tray-attachments" id="up-list">
    <div class="tray-attachment">
      …image icon…
      <span class="tray-attachment__body">
        <span class="tray-attachment__name">jar-50g-open.jpg</span><span class="tray-attachment__meta">Uploading, 64%</span>
        <span class="tray-progress__bar" role="progressbar" aria-label="Uploading jar-50g-open.jpg" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64" style="--tray-v: 64"></span>
      </span>
      <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" aria-label="Cancel the upload of jar-50g-open.jpg">…x…</button>
    </div>
  </div>
</div>
```
## Behaviour
`data-tray="dropzone"`: files that are dropped or chosen are added to the element named in `data-list` as Attachment rows with the name, the size and a button that removes the row. A file over `data-max-mb` is listed with "Too large" (`data-too-large` sets that sentence, with `{max}` for the number). While files are held over it the edge turns solid ink. It fires `tray:change` with `{ files }`, the real `File` objects: start your upload there and show its progress in the row.

The file input covers the whole tray, so a click, a tap and the keyboard all open the picker. `tray-drop--row` is the short form for a narrow column.

## Accessibility
The tray holds the browser's own `<input type="file">`, stretched over it and named through `aria-labelledby` by the visible label. `Tab` reaches it, `Space` or `Enter` opens the picker, and the whole tray draws the 3px ink focus ring. Dropping needs a pointer, choosing does not. Each row in the list has a remove button named after its file ("Remove jar-50g-front.jpg"), and a file that is too large says so in words as well as in `danger`. When a row is removed, focus moves to the next file's remove button, or the one before, or back to the tray once the list is empty. Tie the line of types and sizes to the input with `aria-describedby`, as the example does, so it is read with the label. Rows and progress are not announced: give each bar `role="progressbar"` and a name, as in the example, and say when an upload ends in a `role="status"` region.

## Do and don't
- Do say which kinds of file and how large, inside the tray.
- Do keep a failed file in the list with the reason and a way to try again.
- Don't upload on drop without showing progress.
- Don't make dropping the only way: "choose files" is always there.
