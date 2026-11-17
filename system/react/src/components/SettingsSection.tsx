import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { InputGroup } from './InputGroup';
import { NativeSelect } from './NativeSelect';
import { Switch } from './Switch';

export interface SettingRow {
  /** Tells the rows apart. Default: the row's position. */
  key?: string;
  /** The setting, in bold: named by what happens when it is on. "Print a label for every order". */
  title: React.ReactNode;
  /** One line under the name with the setting's effect or its current value: "On the printer by the packing table." Never hide it in a tooltip. */
  description?: React.ReactNode;
  /**
   * The control at the end of the row: a Switch, a small NativeSelect (`size="sm"`), a small Input, or a quiet `xs` Button that opens a Dialog.
   * A Switch, NativeSelect, Input or InputGroup is named by the row's title by itself; give anything else its own words or aria-label.
   */
  control?: React.ReactNode;
}

export interface SettingsSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The topic, in the narrow column at the start: "Orders". For a section that deletes or transfers things, say what is lost: "Delete the workspace". */
  title: React.ReactNode;
  /** One line under the title on what the section covers, and whether its changes save at once. */
  description?: React.ReactNode;
  /** The rows of the card: one setting each, at most seven. Use `children` instead for a form of Fields. */
  rows?: SettingRow[];
  /** Free content for the card, in place of `rows`: a `<div className="tray-fields">` of Fields, for a section that is a form. */
  children?: React.ReactNode;
  /**
   * The foot under the card, for a section that is a form. `true` draws the standard one: the `note`, then "Discard" (a reset button)
   * and "Save" (a submit button), so wrap the sections in a `<form>` or use `onSave` and `onDiscard`. Or pass your own buttons.
   * A card of switches that save by themselves needs no foot.
   */
  footer?: React.ReactNode | true;
  /** Words at the start of the foot, in muted type: "Unsaved changes", "Saved at 14:02". */
  note?: React.ReactNode;
  /** The save button's words. Default "Save". */
  saveLabel?: string;
  /** The discard button's words. Default "Discard". */
  discardLabel?: string;
  /** Called when "Save" is pressed. It stays a submit button, so call `event.preventDefault()` when there is no form to send. */
  onSave?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Called when "Discard" is pressed. It stays a reset button, which puts a form's fields back as they were. */
  onDiscard?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Shows a spinner on "Save" while the change is sent. */
  saving?: boolean;
  /** The heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
}

const named: unknown[] = [Switch, NativeSelect, Input, InputGroup];
// A button keeps its own words as its name, and is described by the row like the others.
const described: unknown[] = [...named, Button];

function Setting({ row }: { row: SettingRow }) {
  const titleId = useUid('setting');
  const descId = `${titleId}-text`;
  const { control } = row;
  const element = React.isValidElement<Record<string, unknown>>(control) ? control : null;
  // The row's title names a control that has no words of its own, and the line under it describes the control,
  // so the effect is read when the control takes focus.
  const extra: Record<string, string> = {};
  if (element && named.includes(element.type) && element.props['aria-label'] == null && element.props['aria-labelledby'] == null && element.props.label == null)
    extra['aria-labelledby'] = titleId;
  if (element && described.includes(element.type) && row.description != null && element.props['aria-describedby'] == null) extra['aria-describedby'] = descId;
  const labelled = element && Object.keys(extra).length ? React.cloneElement(element, extra) : control;
  return (
    <div className="tray-setting">
      <div className="tray-setting__text">
        <b id={titleId}>{row.title}</b>
        {row.description != null ? <small id={descId}>{row.description}</small> : null}
      </div>
      {control != null ? <div className="tray-setting__control">{labelled}</div> : null}
    </div>
  );
}

/**
 * A settings section is one topic of a settings page: its name and a line of explanation in a narrow column at the start edge,
 * its controls on a card beside it. Two columns from 56rem up, one below; sections that follow each other get a hairline between them.
 */
export const SettingsSection = React.forwardRef<HTMLElement, SettingsSectionProps>(function SettingsSection(
  {
    title,
    description,
    rows,
    children,
    footer,
    note,
    saveLabel = 'Save',
    discardLabel = 'Discard',
    onSave,
    onDiscard,
    saving,
    headingLevel = 2,
    className,
    ...rest
  },
  ref,
) {
  const titleId = useUid('settings');
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const foot =
    footer === true ? (
      <>
        {note != null ? <span className="tray-settings__note">{note}</span> : null}
        <Button variant="ghost" size="sm" type="reset" onClick={onDiscard}>
          {discardLabel}
        </Button>
        <Button size="sm" type="submit" busy={saving} onClick={onSave}>
          {saveLabel}
        </Button>
      </>
    ) : footer != null ? (
      <>
        {note != null ? <span className="tray-settings__note">{note}</span> : null}
        {footer}
      </>
    ) : null;
  return (
    <section ref={ref} className={cx('tray-settings', className)} aria-labelledby={titleId} {...rest}>
      <div className="tray-settings__intro">
        <H className="subtitle" id={titleId}>
          {title}
        </H>
        {description != null ? <p>{description}</p> : null}
      </div>
      <div className="tray-settings__body">
        <Card style={{ padding: 'var(--space-6)' }}>
          {rows ? rows.map((row, i) => <Setting key={row.key ?? i} row={row} />) : null}
          {children}
        </Card>
        {foot != null ? <div className="tray-settings__foot">{foot}</div> : null}
      </div>
    </section>
  );
});
SettingsSection.displayName = 'SettingsSection';
