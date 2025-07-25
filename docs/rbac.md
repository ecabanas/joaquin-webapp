# Role-Based Access Control (RBAC) Plan

This document outlines the RBAC plan for the Joaquin application.

## Current Implementation (Phase 1)

The current RBAC model is simple and implicit, designed for a small, trusted group (like a family).

- **Authentication:** All access to the application's core features requires a user to be authenticated via Firebase Authentication.
- **Workspace Scoping:** All data (`listItems`, `purchaseHistory`, etc.) is stored within a `workspace` document in Firestore. A user only has access to the `workspaceId` associated with their user profile. This is the primary security boundary.
- **Roles:**
    - **Owner:** The user who created the workspace. They have full control. (This is determined by who created the workspace, but not explicitly enforced with different rules yet).
    - **Member:** Any user who is part of the workspace. Currently, all members have the same permissions.

## Future Phases

### Phase 2: Granular Permissions
- **Goal:** Introduce more defined roles and permissions.
- **Potential Roles:**
    - `admin`: Can manage members and workspace settings.
    - `editor`: Can add/edit/complete lists (current default behavior).
    - `viewer`: Can only view lists and history, cannot make changes.
- **Implementation:**
    1.  Add a `role` field to each user's document in the `workspaces/{workspaceId}/members` sub-collection.
    2.  Update Firestore Security Rules to check this `role` field before allowing write operations. For example:
        ```
        match /workspaces/{workspaceId}/listItems/{itemId} {
          allow write: if get(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid)).data.role in ['owner', 'admin', 'editor'];
        }
        ```

### Phase 3: Explicit Invitations
- **Goal:** Implement a secure invitation system.
- **Implementation:**
    1.  Create a new `invites` sub-collection in the workspace.
    2.  When an admin invites a new user by email, a document is created in `invites` with a unique token and the user's email.
    3.  When the invited user signs up, a Cloud Function could be triggered to verify the token, add the user to the `members` sub-collection, and delete the invite.
