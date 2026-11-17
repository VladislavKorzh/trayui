import * as React from 'react';

/** What a Field tells the control inside it: its id, the ids that describe it, and whether its value is wrong. */
interface FieldControl {
  id: string;
  /** The id of the Field's label, for a control made of several elements that names its group with aria-labelledby. */
  labelId?: string;
  describedBy?: string;
  invalid: boolean;
  disabled?: boolean;
}

export const FieldContext = React.createContext<FieldControl | null>(null);

interface OwnControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  disabled?: boolean;
  invalid?: boolean;
}

/**
 * For a control (Input, Textarea, Select...): the id, aria-describedby, aria-invalid and disabled it should carry,
 * from the Field around it and its own props. Its own props win.
 */
export function useFieldControl(own: OwnControlProps): { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: true; disabled?: boolean } {
  const field = React.useContext(FieldContext);
  const invalid = own.invalid ?? (own['aria-invalid'] === true || own['aria-invalid'] === 'true' ? true : field?.invalid);
  const describedBy = [field?.describedBy, own['aria-describedby']].filter(Boolean).join(' ') || undefined;
  return {
    id: own.id ?? field?.id,
    'aria-describedby': describedBy,
    'aria-invalid': invalid ? true : undefined,
    disabled: own.disabled ?? field?.disabled,
  };
}
