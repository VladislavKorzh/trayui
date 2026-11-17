import { AuthForm } from 'trayui-react';

export function SignIn() {
  return (
    <AuthForm
      wordmark="Counter"
      wordmarkHref="#"
      description="Welcome back to Perly Farm."
      passkey
      forgotHref="#"
      defaultValues={{ email: 'oksana@perly.example', password: 'example-password' }}
      footer={<>New here? <a href="#">Create an account</a></>}
      onSubmit={() => {}}
    />
  );
}

export function CreateAccount() {
  return (
    <AuthForm
      mode="signup"
      headingLevel={2}
      description="Free for 14 days. No card needed."
      error="That email already has an account"
      errorText={<><a href="#">Sign in</a> or use another email.</>}
      emailLabel="Work email"
      passwordHint="At least 12 characters."
      fieldErrors={{ email: true }}
      defaultValues={{ email: 'oksana@perly.example' }}
      footer={<>By creating an account you accept the <a href="#">terms</a>.</>}
      onSubmit={() => {}}
    />
  );
}
