# Firestore Schema Definitions

This directory contains the schema definitions for all Firestore collections used in the Joaquin application.

## Top-Level Collections

-   **[users](./users.md)**: Stores individual user profile data.
-   **[workspaces](./workspaces.md)**: The container for all shared data for a group.

## Sub-Collections

The `workspaces` collection contains the following sub-collections:

-   **[members](./members.md)**: A list of users who belong to the workspace.
-   **[invites](./invites.md)**: Stores pending invitations for users to join the workspace.
-   **[listItems](./listItems.md)**: The current, active grocery list.
-   **[purchaseHistory](./purchaseHistory.md)**: Archived records of completed shopping trips.
-   **[itemCatalog](./itemCatalog.md)**: The workspace's shared dictionary of all known grocery items.
