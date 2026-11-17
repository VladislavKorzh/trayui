import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { EMAIL, SectionHead } from '../lib/account';
import { Button } from './Button';
import { Field } from './Field';
import { NativeSelect, type NativeSelectOption } from './NativeSelect';
import { TagInput } from './TagInput';

export interface InviteFormValue {
  /** The addresses typed, wrong ones included. */
  emails: string[];
  /** The chosen role. */
  role: string;
  /** False while a typed address is not an email: answer the submit with the error, do not send. */
  valid: boolean;
}

export interface InviteFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'title' | 'onSubmit'> {
  /** The title above the form: "Invite people". */
  title?: React.ReactNode;
  /** One line under the title: "They get an email with a link that works for 7 days." */
  description?: React.ReactNode;
  /** Sets the form on a grey card, as on a team page. Default false. */
  card?: boolean;
  /** The label of the emails field. Default "Emails". */
  emailsLabel?: string;
  /** The placeholder in the emails field. Default "name@farm.example"; "Add another" reads well once there are chips. */
  placeholder?: string;
  /** The free seats: no more addresses than this are taken. Say the number in `hint` too. Default: no limit. */
  seats?: number;
  /** The addresses, for a controlled field. Set it to `[]` after the invitations are sent. Pass it with `onEmailsChange`. */
  emails?: string[];
  /** The addresses shown at first, for an uncontrolled field. */
  defaultEmails?: string[];
  /** Called with the addresses and whether all are emails, each time one is added or removed. */
  onEmailsChange?: (emails: string[], valid: boolean) => void;
  /** One line under the emails field, said before the person types: how to add an address, and how many seats are free. */
  hint?: React.ReactNode;
  /**
   * What is wrong with the addresses. Left out, the form names the first wrong address by itself:
   * "“marta@perly” is not a full email address." Pass `null` to show no error at all.
   */
  error?: React.ReactNode;
  /** The label of the role menu. Default "Role". */
  roleLabel?: string;
  /** The roles that can be given. Default Packer, Manager, Viewer. */
  roles?: Array<string | NativeSelectOption>;
  /** The chosen role, for a controlled menu. Pass it with `onRoleChange`. */
  role?: string;
  /** The role chosen at first. Default: the first role. */
  defaultRole?: string;
  /** Called with the new role when the menu changes. */
  onRoleChange?: (role: string) => void;
  /** One line under the row that explains the chosen role: "A packer sees today's orders and marks them packed." */
  roleHint?: React.ReactNode;
  /** The button's words. Default "Send invitations". */
  submitLabel?: string;
  /** Shows a spinner on the button while the invitations are sent. */
  busy?: boolean;
  /**
   * Called with the addresses, the role and whether all addresses are right when the button is pressed; the page does not reload.
   * Keep the button enabled and answer a wrong submit with the error. Leave it out to let the form post its `emails` and `role` fields.
   */
  onSubmit?: (value: InviteFormValue, event: React.FormEvent<HTMLFormElement>) => void;
}

function firstWrong(emails: string[]): string | undefined {
  return emails.find((e) => !EMAIL.test(e));
}

function roleValue(r: string | NativeSelectOption): string {
  return typeof r === 'string' ? r : r.value;
}

/**
 * The invite form takes several emails at once, a role for all of them, and sends the invitations.
 * The emails are a Tag Input that turns a wrong address into a danger chip; beside it go the role and the button, and below 40rem the three stack.
 */
export const InviteForm = React.forwardRef<HTMLFormElement, InviteFormProps>(function InviteForm(
  {
    title,
    description,
    card,
    emailsLabel = 'Emails',
    placeholder = 'name@farm.example',
    seats,
    emails,
    defaultEmails,
    onEmailsChange,
    hint,
    error,
    roleLabel = 'Role',
    roles = ['Packer', 'Manager', 'Viewer'],
    role,
    defaultRole,
    onRoleChange,
    roleHint,
    submitLabel = 'Send invitations',
    busy,
    onSubmit,
    className,
    style,
    ...rest
  },
  ref,
) {
  const id = useUid('invite');
  const [typed, setTyped] = React.useState<string[]>(() => emails ?? defaultEmails ?? []);
  const shown = emails ?? typed;
  const [chosen, setChosen] = React.useState(() => role ?? defaultRole ?? (roles.length ? roleValue(roles[0]!) : ''));
  const wrong = firstWrong(shown);
  const message = error !== undefined ? error : wrong != null ? <>&ldquo;{wrong}&rdquo; is not a full email address.</> : undefined;

  return (
    <form
      ref={ref}
      className={cx(card && 'tray-card', 'tray-stack', className)}
      style={card ? { padding: 'var(--space-8)', ...style } : style}
      onSubmit={
        onSubmit
          ? (e) => {
              e.preventDefault();
              onSubmit({ emails: shown, role: role ?? chosen, valid: !wrong }, e);
            }
          : undefined
      }
      {...rest}
    >
      <SectionHead title={title} description={description} />
      <div className="tray-invite">
        <Field label={emailsLabel} controlId={`${id}-emails`} hint={hint} error={message ?? undefined}>
          <TagInput
            pattern="email"
            max={seats}
            name="emails"
            placeholder={placeholder}
            value={emails}
            defaultValue={defaultEmails}
            onChange={(values, valid) => {
              setTyped(values);
              onEmailsChange?.(values, valid);
            }}
          />
        </Field>
        <Field label={roleLabel} controlId={`${id}-role`}>
          <NativeSelect
            name="role"
            options={roles}
            value={role}
            defaultValue={role === undefined ? chosen : undefined}
            onChange={(e) => {
              setChosen(e.target.value);
              onRoleChange?.(e.target.value);
            }}
          />
        </Field>
        <Button size="md" type="submit" busy={busy} style={{ marginBlockStart: 27 }}>
          {submitLabel}
        </Button>
      </div>
      {roleHint != null ? (
        <p className="tray-field__hint" style={{ margin: 0 }}>
          {roleHint}
        </p>
      ) : null}
    </form>
  );
});
InviteForm.displayName = 'InviteForm';
