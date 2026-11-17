import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useFieldControl } from '../lib/field';
import { cx, useTrayEvent, useBehaviour, useControlled, useForwardedRef } from '../lib/util';
import { fileSize } from '../lib/account';
import { Attachment } from './Attachment';
import { Icon } from './Icon';

export interface FileUploadItem {
  /** Tells the rows apart. Default: the file name. Files taken by the tray get an id of their own. */
  id?: string;
  /** The file name, with its extension: "jar-50g-front.jpg". */
  name: string;
  /** One line about the file, usually its size: "1.4 MB". Files taken by the tray get their size here. */
  meta?: React.ReactNode;
  /** Upload progress, 0 to 100: a thin bar and "Uploading, N%" in place of the meta line. The row's button then cancels the upload. Leave it out once the file is sent. */
  progress?: number;
  /** Why the file cannot be sent, said plainly: "Too large. The limit is 10 MB." It replaces the meta line in danger. */
  error?: React.ReactNode;
  /** With `error`: the row's button tries again (calls `onRetry`) instead of removing the row. */
  retry?: boolean;
  /** The icon in the tile. Default 'image' for a picture, otherwise 'file'. */
  icon?: IconSource;
  /** The real File this row stands for, when it came from the tray: upload it, or read it. */
  file?: File;
}

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'title' | 'value' | 'defaultValue' | 'onChange' | 'list'> {
  /**
   * The bold line in the tray. Put the words that open the picker in `<u>`: `<>Drop photos here or <u>choose files</u></>`.
   * Default: "Drop files here or choose files".
   */
  title?: React.ReactNode;
  /** The second line: which kinds of file and how large. "PNG or JPG, up to 10 MB each". */
  description?: React.ReactNode;
  /** The icon in the tile. Default 'upload'; 'file' suits the short row form. */
  icon?: IconSource;
  /** 'block' is the tall tray with the tile above the text (the default). 'row' is the short form, tile beside the text, for a narrow column. */
  layout?: 'block' | 'row';
  /** The largest file it takes, in MB. A larger file is still listed, with the `tooLarge` sentence in danger, and is not passed to `onFiles`. */
  maxMb?: number;
  /** The sentence for a file over `maxMb`; `{max}` stands for the number. Default "Too large. The limit is {max} MB." */
  tooLarge?: string;
  /** The rows under the tray, for a controlled list: pass it with `onItemsChange` to show each upload's progress. */
  items?: FileUploadItem[];
  /** The rows shown at first, for an uncontrolled list. Default none. */
  defaultItems?: FileUploadItem[];
  /** Called with the whole new list when files are taken or a row is removed. */
  onItemsChange?: (items: FileUploadItem[]) => void;
  /** Called with the real File objects each time files are dropped or chosen, those over `maxMb` left out: start the upload here. */
  onFiles?: (files: File[]) => void;
  /** Called when a row's button removes it, or cancels its upload. The row leaves the list. */
  onRemove?: (item: FileUploadItem) => void;
  /** Called when the button of a row with `retry` is pressed. */
  onRetry?: (item: FileUploadItem) => void;
  /** Lists the rows under the tray. Default true; false when the files are shown somewhere else. */
  list?: boolean;
  /** Shows the tray as it looks while files are held over it: a solid ink edge. For pictures of that moment; the tray then takes no files. */
  over?: boolean;
  /** Marks the field as wrong (for example a required file is missing): it is announced on the file input. Inside a Field, pass `error` to the Field. */
  invalid?: boolean;
  /** Classes for the tray, for width and layout. Other props (`accept`, `multiple`, `name`, `aria-*`) go to the file `<input>`, which covers the tray. */
  className?: string;
  /** Styles for the tray. */
  style?: React.CSSProperties;
}

let seq = 0;

/**
 * File upload is a tray with a dashed edge that takes files dropped on it or chosen from the device, and lists them underneath.
 * Put it in a Field, which names it. Say inside the tray which kinds of file it takes and how large; start the upload in `onFiles`
 * and show its progress in the row. `ref` and the native props go to the file input; `className` and `style` to the tray.
 */
export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    title = (
      <>
        Drop files here or <u>choose files</u>
      </>
    ),
    description,
    icon = 'upload',
    layout = 'block',
    maxMb,
    tooLarge = 'Too large. The limit is {max} MB.',
    items,
    defaultItems = [],
    onItemsChange,
    onFiles,
    onRemove,
    onRetry,
    list = true,
    over,
    invalid,
    className,
    style,
    id,
    disabled,
    ...rest
  },
  ref,
) {
  const input = useForwardedRef(ref);
  const tray = React.useRef<HTMLDivElement | null>(null);
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  const [rows, setRows] = useControlled(items, defaultItems, onItemsChange);
  const latest = React.useRef(rows);
  latest.current = rows;

  // The dropzone behaviour handles the drag (data-over), the drop and the picker, and reports the files; the rows are drawn here.
  useTrayEvent(
    tray,
    'change',
    (detail: { files?: File[] }) => {
      const files = detail.files ?? [];
      if (!files.length) return;
      const limit = maxMb ? maxMb * 1048576 : Infinity;
      const added = files.map<FileUploadItem>((f) => {
        seq += 1;
        const big = f.size > limit;
        return {
          id: `${f.name}-${seq}`,
          name: f.name,
          meta: big ? undefined : fileSize(f.size),
          error: big ? tooLarge.replace('{max}', String(maxMb)) : undefined,
          icon: /^image\//.test(f.type) ? 'image' : 'file',
          file: f,
        };
      });
      if (list) {
        latest.current = [...latest.current, ...added];
        setRows(latest.current);
      }
      const fit = files.filter((f) => f.size <= limit);
      if (fit.length) onFiles?.(fit);
    },
    { own: true },
  );
  useBehaviour(tray, [over]);

  const drop = (item: FileUploadItem, i: number) => {
    latest.current = latest.current.filter((r, j) => (item.id != null ? r.id !== item.id : j !== i));
    setRows(latest.current);
    onRemove?.(item);
  };

  const row = layout === 'row';
  return (
    <>
      <div
        ref={tray}
        className={cx('tray-drop', row && 'tray-drop--row', className)}
        style={style}
        data-tray={over ? undefined : 'dropzone'}
        data-over={over ? '' : undefined}
      >
        <span className="tray-drop__icon">
          <Icon name={icon} />
        </span>
        <p className="tray-drop__text">
          <b>{title}</b>
          {description != null ? <small>{description}</small> : null}
        </p>
        {over ? null : <input ref={input} type="file" {...rest} {...field} />}
      </div>
      {list && rows.length ? (
        <div className="tray-attachments" style={{ marginBlockStart: 'var(--space-3)' }}>
          {rows.map((item, i) => {
            const uploading = item.progress !== undefined && item.error == null;
            const action = item.error != null && item.retry ? 'retry' : uploading ? 'cancel' : 'remove';
            return (
              <Attachment
                key={item.id ?? item.name}
                name={item.name}
                meta={uploading ? undefined : item.meta}
                progress={item.progress}
                error={item.error}
                icon={item.icon ?? (/\.(png|jpe?g|gif|webp|avif|heic)$/i.test(item.name) ? 'image' : 'file')}
                action={action}
                onAction={() => (action === 'retry' ? onRetry?.(item) : drop(item, i))}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
});
FileUpload.displayName = 'FileUpload';
