---
category: Forms
keywords: [file upload, dropzone, drop zone, drag and drop, file picker, attach files, upload photos, import csv]
---
# File Upload

File upload is a tray with a dashed edge that takes files dropped on it or chosen from the device, and lists them underneath.

## Use
```tsx
<Field label="Product photos">
  <FileUpload
    multiple
    accept="image/png, image/jpeg"
    maxMb={10}
    title={<>Drop photos here or <u>choose files</u></>}
    description="PNG or JPG, up to 10 MB each"
    onFiles={(files) => files.forEach(startUpload)}   /* the real File objects */
  />
</Field>

<Field label="Price list">                              {/* the short form, for a narrow column */}
  <FileUpload layout="row" icon="file" accept=".csv" title={<><u>Choose a file</u> or drop it</>} description="CSV, one product per line" />
</Field>
```

## Behaviour
The file input covers the whole tray, so a click, a tap and the keyboard all open the picker. While files are held over it the edge turns solid ink. Files that are dropped or chosen are listed under the tray as Attachment rows with the name, the size and a button that removes the row. A file over `maxMb` is listed with the `tooLarge` sentence in danger and is not passed on.

`onFiles` gets the real `File` objects that fit, each time some are added: start the upload there. The tray uploads nothing by itself, and the files are not sent with a form.

## Showing progress
Pass `items` with `onItemsChange` to hold the list yourself. Rows the tray adds carry their `file`, so you can find them again and set `progress` (0 to 100): the row then shows a thin bar and "Uploading, 42%", and its button cancels. Remove `progress` when the file is sent and the size comes back. For a failed upload set `error` to the reason and `retry: true`: the button then calls `onRetry`.

```tsx
const [items, setItems] = useState<FileUploadItem[]>([]);
<FileUpload items={items} onItemsChange={setItems}
  onFiles={(files) => files.forEach((f) => upload(f, (pct) =>
    setItems((all) => all.map((x) => (x.file === f ? { ...x, progress: pct < 100 ? pct : undefined } : x)))))}
  onRemove={(item) => cancelUpload(item.file)} />
```

`over` pictures the tray while files are held over it, for documentation; such a tray takes no files.

## Do and don't
- Do say which kinds of file and how large, inside the tray.
- Do keep a failed file in the list with the reason and a way to try again.
- Don't upload on drop without showing progress.
- Don't make dropping the only way: "choose files" is always there.
