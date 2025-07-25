# Schema: users

This collection stores individual user profile data.

**Collection Path:** `/users`

## Document ID

The Document ID is the Firebase Authentication `uid` for the user.

## Document Fields

| Field Name    | Type   | Description                                                                    |
|---------------|--------|--------------------------------------------------------------------------------|
| `name`        | String | The user's display name.                                                       |
| `photoURL`    | String | A URL to the user's profile picture.                                           |
| `workspaceId` | String | The ID of the `workspace` document this user belongs to. This is the critical link for data scoping. |
| `currency`    | String | The user's preferred currency code (e.g., "USD", "EUR").                         |

## Security Rules

- **Read:** A user can only read their own document (`allow read: if request.auth.uid == userId;`).
- **Write:** A user can only update their own document (`allow write: if request.auth.uid == userId;`).
