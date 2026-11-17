---
category: Account
keywords: [invite form, invite people, invitations, add members, team invite, email invite, seats]
---
# Invite Form

The invite form takes several emails at once, a role for all of them, and sends the invitations.

## Use
```tsx
<InviteForm
  card
  title="Invite people"
  description="They get an email with a link that works for 7 days."
  seats={1}                                              /* the free seats: no more addresses are taken */
  hint="Separate emails with a comma or Enter. One seat is free."
  roles={['Packer', 'Manager', 'Viewer']}
  roleHint="A packer sees today's orders and marks them packed."
  onSubmit={({ emails, role, valid }) => valid && send(emails, role)}
/>
```

## Parts
The emails are a Tag Input with the email pattern: an address that is not an email becomes a danger chip, and the field's error names it by itself ("“marta@perly” is not a full email address."). Pass your own `error` to say something else, or `null` for none. Beside the emails go a Native Select for the role and the button; below 40rem the three stack. `roleHint` is the line under the row that explains the chosen role.

## Behaviour
Nothing is sent until the button is pressed. `onSubmit` gets the addresses, the role and `valid`, which is false while a wrong address is in the field: keep the button enabled and answer a wrong submit with the error. To clear the field after a send, control it with `emails` and `onEmailsChange` and set `emails` to `[]`. Without `onSubmit`, the form posts `emails` (joined by commas) and `role`.

## Do and don't
- Do say how many seats are free before the person types.
- Do explain the chosen role in one line under the row.
- Don't send anything until the button is pressed.
- Don't drop a wrong address silently: keep it as a chip and name it.
