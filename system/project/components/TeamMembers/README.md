# Team Members

Team members is the table of people in a workspace: who they are, their role, whether they have joined, and when they were last seen.

## Markup
```html
<table class="tray-table">
  <thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Status</th>
    <th scope="col">Last seen</th><th scope="col"><span class="tray-vh">Remove</span></th></tr></thead>
  <tbody><tr>
    <th scope="row"><span class="tray-person">
      <span class="tray-avatar tray-avatar--sm" aria-hidden="true">BS</span>
      <span class="tray-person__text"><b>Bohdan Savchuk</b><small>bohdan@perly.example</small></span>
    </span></th>
    <td><span class="tray-select tray-select--sm"><select aria-label="Role of Bohdan Savchuk">…</select></span></td>
    <td><span class="tray-badge">Active</span></td>
    <td>Today, 08:30</td>
    <td data-num><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" aria-label="Remove Bohdan Savchuk">…</button></td>
  </tr></tbody>
</table>
```
It is a Table whose first cell is `tray-person`: a small Avatar, the name in bold and the email under it. The role is a small Native Select, named with the person in its `aria-label`. An invitation that has not been accepted shows "Invited" and offers "Send again" instead of a last-seen time.

Above the table go the count of seats in words and the button that opens the Invite Form. Removing a person asks first, in an Alert Dialog.

## Do and don't
- Do mark the signed-in person with "(you)" and show the owner's role as text: it cannot be changed here.
- Do save a role change at once and confirm it with a Toast.
- Don't let the last owner be removed or demoted.
- Don't show avatars without names.
