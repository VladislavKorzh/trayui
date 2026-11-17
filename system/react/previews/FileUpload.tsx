import * as React from 'react';
import { Card, Field, FileUpload, type FileUploadItem } from 'trayui-react';

export function Photos() {
  return (
    <div className="tray-bento" style={{ alignItems: 'start' }}>
      <Field className="tray-span-6" label="Product photos">
        <FileUpload
          multiple
          accept="image/png, image/jpeg"
          maxMb={10}
          title={<>Drop photos here or <u>choose files</u></>}
          description="PNG or JPG, up to 10 MB each"
          defaultItems={[
            { name: 'jar-50g-front.jpg', meta: '1.4 MB' },
            { name: 'jar-50g-open.jpg', progress: 64 },
          ]}
        />
      </Field>
      <div className="tray-stack tray-span-6">
        <p className="tray-demo-note">While files are held over it</p>
        <FileUpload over title="Let go to add 3 photos" />
        <Card style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-panel)' }}>
          <Field label="Price list">
            <FileUpload layout="row" icon="file" accept=".csv" title={<><u>Choose a file</u> or drop it</>} description="CSV, one product per line" />
          </Field>
        </Card>
      </div>
    </div>
  );
}

export function UploadWithProgress() {
  const [items, setItems] = React.useState<FileUploadItem[]>([
    { id: 'lid', name: 'jar-30g-lid.jpg', meta: '860 KB' },
    { id: 'beds', name: 'farm-beds-autumn.jpg', meta: '2.1 MB', error: 'The upload stopped. Try again.', retry: true },
  ]);
  // A pretend upload: the row counts up to 100%, then shows the size again.
  const upload = (match: (item: FileUploadItem) => boolean) => {
    let pct = 0;
    const timer = setInterval(() => {
      pct += 25;
      setItems((all) => all.map((x) => (match(x) ? { ...x, error: undefined, retry: false, progress: pct < 100 ? pct : undefined } : x)));
      if (pct >= 100) clearInterval(timer);
    }, 500);
  };
  return (
    <div style={{ maxWidth: 520 }}>
      <Field label="Photos for the autumn batch">
        <FileUpload
          multiple
          accept="image/png, image/jpeg"
          maxMb={10}
          title={<>Drop photos here or <u>choose files</u></>}
          description="PNG or JPG, up to 10 MB each. Each one uploads as soon as it is added."
          items={items}
          onItemsChange={setItems}
          onFiles={(files) => files.forEach((f) => upload((x) => x.file === f))}
          onRetry={(item) => upload((x) => x.id === item.id)}
        />
      </Field>
    </div>
  );
}
