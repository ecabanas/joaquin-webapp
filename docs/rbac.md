# Role-Based Access Control (RBAC) Plan

This document outlines the RBAC plan for the Joaquin application.

## Current Implementation (Phase 1 & 2)

The current RBAC model is now explicit and secure, designed for a small, trusted group (like a family).

- **Authentication:** All access to the application's core features requires a user to be authenticated via Firebase Authentication.
- **Workspace Scoping:** All data (`listItems`, `purchaseHistory`, etc.) is stored within a `workspace` document in Firestore. A user only has access to the `workspaceId` associated with their user profile. This is the primary security boundary.
- **Roles:**
    - **Owner:** The user who created the workspace. They have full control.
    - **Member:** Any user who is part of the workspace. Currently, all members have the same permissions to add, edit, and complete lists.
- **Explicit Invitations:**
    - An invitation system is now implemented.
    - An `owner` or `admin` (once that role is defined) can invite new users by email from the settings page.
    - A unique, single-use token is generated and stored in an `invites` sub-collection.
    - When the invited user signs up with the correct email and token, they are added to the `members` sub-collection with the `member` role, and the invite is deleted.

## Future Phases

### Phase 3: Granular Permissions
- **Goal:** Introduce more defined roles and permissions for write access.
- **Potential Roles:**
    - `admin`: Can manage members and workspace settings (in addition to owner).
    - `editor`: Can add/edit/complete lists (current default behavior for all members).
    - `viewer`: Can only view lists and history, cannot make changes.
- **Implementation:**
    1.  Add a `role` field to each user's document in the `workspaces/{workspaceId}/members` sub-collection.
    2.  Update Firestore Security Rules to check this `role` field before allowing write operations. For example:
        ```
        match /workspaces/{workspaceId}/listItems/{itemId} {
          allow write: if get(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid)).data.role in ['owner', 'admin', 'editor'];
        }
        ```
