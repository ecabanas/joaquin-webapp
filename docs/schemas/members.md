# Schema: members

This collection stores a record for each user who has access to the workspace. This is useful for listing members and for writing security rules.

**Collection Path:** `/workspaces/{workspaceId}/members`

## Document ID

The Document ID is the `userId` (the Firebase Auth UID) of the member.

## Document Fields

| Field Name | Type   | Description                                     |
|------------|--------|-------------------------------------------------|
| `name`     | String | The display name of the user.                   |
| `role`     | String | The user's role in the workspace (e.g., "owner", "member"). |

## Security Rules

- **Read:** Any authenticated user who is a member of the workspace can read the list of other members.
- **Write:** Only a user with an "owner" or "admin" role should be able to add or remove members (This rule is not yet implemented in Phase 1).
