import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { Alert } from './Alert';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { InputGroup } from './InputGroup';
import { Separator } from './Separator';

export type AuthFormMode = 'signin' | 'signup';

export interface AuthFormValues {
  /** The farm or shop name, when the form asks for it (`nameLabel` in sign-up). */
  name?: string;
  /** The email. */
  email: string;
  /** The password. */
  password: string;
}

/** One message per field: what to do about it. `true` marks the field wrong with no line under it, when the form's `error` already says why. */
export type AuthFormFieldErrors = Partial<Record<'name' | 'email' | 'password', React.ReactNode | true>>;

export interface AuthFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'title' | 'onSubmit'> {
  /** 'signin' asks for an email and the current password, with "Forgot it?" and a reveal button (the default). 'signup' asks for an email and a new password. */
  mode?: AuthFormMode;
  /** The heading. Default "Sign in", or "Create an account". */
  title?: React.ReactNode;
  /** One line under it: "Welcome back to Perly Farm.", "Free for 14 days. No card needed." */
  description?: React.ReactNode;
  /** The product's wordmark at the top, as text: "Counter". Write the name; never draw a logo you have no right to use. */
  wordmark?: React.ReactNode;
  /** Where the wordmark goes. Default "/". */
  wordmarkHref?: string;
  /** The heading level: 1 when the form is the page (the default), 2 when it shares the page. */
  headingLevel?: 1 | 2;
  /** Offers "Continue with a passkey" above the fields, then a line with "or". A string changes the button's words. */
  passkey?: boolean | string;
  /** Called when the passkey button is pressed. */
  onPasskey?: (event: React.MouseEvent<HTMLElement>) => void;
  /** An error for the whole form, as the title of a danger Alert between the head and the first field: "That email already has an account". Never clear the form with it. */
  error?: React.ReactNode;
  /** What to do about `error`, under its title: "<a>Sign in</a> or use another email." */
  errorText?: React.ReactNode;
  /** An error under one field. */
  fieldErrors?: AuthFormFieldErrors;
  /** In sign-up: the label of a first field for the farm or shop name, such as "Farm or shop name". Left out, sign-up asks only for an email and a password. */
  nameLabel?: string;
  /** The label of the email field. Default "Email". */
  emailLabel?: string;
  /** The label of the password field. Default "Password". */
  passwordLabel?: string;
  /** One line of help under the password: in sign-up, the rule it must meet, "At least 12 characters." */
  passwordHint?: React.ReactNode;
  /** In sign-in: where "Forgot it?" goes, beside the password label. Left out, there is no link. */
  forgotHref?: string;
  /** The words of that link. Default "Forgot it?". */
  forgotLabel?: string;
  /** What the fields hold at first, so a failed attempt keeps what was typed. */
  defaultValues?: Partial<AuthFormValues>;
  /** The yellow button's words. Default "Sign in", or "Create the account". */
  submitLabel?: string;
  /** Shows a spinner on the button while the form is sent. */
  busy?: boolean;
  /** One line at the foot, centred: "New here? <a>Create an account</a>", or the terms in sign-up. */
  footer?: React.ReactNode;
  /** Extra fields after the built-in ones, such as a one-time code. */
  children?: React.ReactNode;
  /** Called with what was typed when the form is sent; the page does not reload. Leave it out to let the form post `name`, `email` and `password`. */
  onSubmit?: (values: AuthFormValues, event: React.FormEvent<HTMLFormElement>) => void;
}

function wrong(e: React.ReactNode | true | undefined): { error?: React.ReactNode; invalid?: boolean } {
  if (e === true) return { invalid: true };
  return e != null && e !== false ? { error: e } : {};
}

/**
 * The auth form is the card a person meets before the product: sign in or create an account. One column, one yellow button.
 * It is built from Field, Input, Input Group (the password reveal), Button, the labelled Separator and an Alert for an error of the whole form.
 */
export const AuthForm = React.forwardRef<HTMLFormElement, AuthFormProps>(function AuthForm(
  {
    mode = 'signin',
    title,
    description,
    wordmark,
    wordmarkHref = '/',
    headingLevel = 1,
    passkey,
    onPasskey,
    error,
    errorText,
    fieldErrors = {},
    nameLabel,
    emailLabel = 'Email',
    passwordLabel = 'Password',
    passwordHint,
    forgotHref,
    forgotLabel = 'Forgot it?',
    defaultValues = {},
    submitLabel,
    busy,
    footer,
    children,
    onSubmit,
    className,
    ...rest
  },
  ref,
) {
  const id = useUid('auth');
  const signup = mode === 'signup';
  const H = `h${headingLevel}` as 'h1' | 'h2';
  const name = wrong(fieldErrors.name);
  const email = wrong(fieldErrors.email);
  const pass = wrong(fieldErrors.password);
  const passId = `${id}-password`;
  const passMsg = pass.error != null ? { cls: 'tray-field__error', text: pass.error } : passwordHint != null ? { cls: 'tray-field__hint', text: passwordHint } : null;

  const password =
    !signup && forgotHref != null ? (
      // The label shares its row with "Forgot it?", so this field is drawn by hand: the Field puts its label alone.
      <div className="tray-field">
        <div className="tray-auth__row">
          <label className="tray-label" htmlFor={passId} id={`${passId}-label`}>
            {passwordLabel}
          </label>
          <a href={forgotHref} style={{ marginBlockEnd: 'var(--space-2)', fontSize: '.9375rem' }}>
            {forgotLabel}
          </a>
        </div>
        <InputGroup
          reveal
          id={passId}
          name="password"
          autoComplete="current-password"
          required
          defaultValue={defaultValues.password}
          invalid={pass.invalid || pass.error != null || undefined}
          aria-describedby={passMsg ? `${passId}-msg` : undefined}
        />
        {passMsg ? (
          <p className={passMsg.cls} id={`${passId}-msg`}>
            {passMsg.text}
          </p>
        ) : null}
      </div>
    ) : (
      <Field label={passwordLabel} controlId={passId} hint={passwordHint} error={pass.error}>
        {signup ? (
          <Input type="password" name="password" autoComplete="new-password" required defaultValue={defaultValues.password} invalid={pass.invalid} />
        ) : (
          <InputGroup reveal name="password" autoComplete="current-password" required defaultValue={defaultValues.password} invalid={pass.invalid} />
        )}
      </Field>
    );

  return (
    <form
      ref={ref}
      className={cx('tray-card tray-auth', className)}
      onSubmit={
        onSubmit
          ? (e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const text = (k: string) => (typeof data.get(k) === 'string' ? (data.get(k) as string) : '');
              onSubmit({ ...(signup && nameLabel != null ? { name: text('name') } : {}), email: text('email'), password: text('password') }, e);
            }
          : undefined
      }
      {...rest}
    >
      {wordmark != null ? (
        <a className="tray-wordmark" href={wordmarkHref}>
          {wordmark}
        </a>
      ) : null}
      <div className="tray-auth__head">
        <H className="title">{title ?? (signup ? 'Create an account' : 'Sign in')}</H>
        {description != null ? <p>{description}</p> : null}
      </div>
      {passkey ? (
        <>
          <Button variant="quiet" size="md" block icon="key" onClick={onPasskey}>
            {typeof passkey === 'string' ? passkey : 'Continue with a passkey'}
          </Button>
          <Separator label="or" />
        </>
      ) : null}
      {error != null ? (
        <Alert tone="danger" title={error}>
          {errorText}
        </Alert>
      ) : null}
      <div className="tray-stack">
        {signup && nameLabel != null ? (
          <Field label={nameLabel} controlId={`${id}-name`} error={name.error}>
            <Input name="name" autoComplete="organization" defaultValue={defaultValues.name} invalid={name.invalid} />
          </Field>
        ) : null}
        <Field label={emailLabel} controlId={`${id}-email`} error={email.error}>
          <Input type="email" name="email" autoComplete="username" required defaultValue={defaultValues.email} invalid={email.invalid} />
        </Field>
        {password}
        {children}
      </div>
      <Button block type="submit" busy={busy}>
        {submitLabel ?? (signup ? 'Create the account' : 'Sign in')}
      </Button>
      {footer != null ? <p className="tray-auth__foot">{footer}</p> : null}
    </form>
  );
});
AuthForm.displayName = 'AuthForm';
