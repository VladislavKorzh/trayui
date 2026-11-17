import * as React from 'react';
import { FieldContext, useFieldControl } from '../lib/field';
import { cx, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { useRepaint } from '../lib/forms';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** The visible lines, matched to the expected answer: 2 for a courier note, 6 for a review. Default 4. It grows by the corner handle, vertically only. */
  rows?: number;
  /** The most characters it takes. Pair it with `showCount`, so typing never stops without the person seeing why. */
  maxLength?: number;
  /** Shows the count, "39 / 140", at the end of the line under the field, as the person types. Use it with `maxLength`. */
  showCount?: boolean;
  /**
   * With `showCount`: one line of help at the start of the count's line. Give the hint here rather than to the Field, so the hint and the count share a line.
   * It gives way to the Field's `error`.
   */
  hint?: React.ReactNode;
  /** Marks the value as wrong: a 2px danger ring inside the field. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
}

/**
 * A textarea takes several lines of text, in the same fill and corners as an input.
 * Put it in a Field for its label and help; use it only where one line is not enough.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { rows = 4, maxLength, showCount, hint, invalid, className, id, disabled, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  const around = React.useContext(FieldContext);
  const hintId = useUid('textarea-hint');
  const counting = !!showCount;
  const showHint = counting && hint != null && !around?.invalid;
  const field = useFieldControl({
    id,
    disabled,
    invalid,
    'aria-describedby': cx(rest['aria-describedby'], showHint && hintId),
    'aria-invalid': rest['aria-invalid'],
  });
  // The count behaviour writes "39 / 140" into the field's tray-field__count as the person types.
  useBehaviour(own, [counting]);
  useRepaint(own, counting ? rest.value : undefined);

  const area = (
    <textarea
      ref={own as React.RefObject<HTMLTextAreaElement>}
      className={cx('tray-textarea', className)}
      rows={rows}
      maxLength={maxLength}
      data-tray={counting ? 'count' : undefined}
      {...rest}
      {...field}
    />
  );
  if (!counting) return area;
  const foot = (
    <div className="tray-field__foot">
      {showHint ? (
        <p className="tray-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <span className="tray-field__count" />
    </div>
  );
  // The count behaviour looks for its counter inside the nearest tray-field: outside a Field, the textarea brings one.
  return around ? (
    <>
      {area}
      {foot}
    </>
  ) : (
    <div className="tray-field">
      {area}
      {foot}
    </div>
  );
});
Textarea.displayName = 'Textarea';
