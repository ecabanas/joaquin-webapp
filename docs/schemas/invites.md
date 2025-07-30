# Schema: invites

This collection stores pending invitations for users to join a specific workspace. When an invite is accepted, the document is deleted.

**Collection Path:** `/workspaces/{workspaceId}/invites`

## Document Fields

| Field Name  | Type      | Description                                                  |
|-------------|-----------|--------------------------------------------------------------|
| `email`     | String    | The email address of the user being invited.                 |
| `token`     | String    | A unique, single-use token that identifies the invitation.   |
| `createdAt` | Timestamp | The date and time the invitation was created.                |

## Indexes

- An index on `email` is required to check for existing invites.
- An index on `token` is required to look up an invite when a new user signs up.

## Security Rules

- **Read:** Only members of the workspace can see the pending invitations.
- **Write:** Only users with an "owner" or "admin" role can create or delete invitations.
- **Acceptance:** The logic for accepting an invite is handled in a secure transaction within `lib/firestore.ts`, which verifies the token and user email before making changes.
