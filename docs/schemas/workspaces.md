# Schema: workspaces

This is the central container for all shared data for a specific group (e.g., a family). All data is scoped under a workspace document to ensure privacy and efficient querying. The document itself is often empty, serving primarily as a parent for its sub-collections.

**Collection Path:** `/workspaces`

## Document ID

The Document ID is a unique, auto-generated ID created when a new user signs up.

## Document Fields

This document currently has no fields. It serves as a parent for the sub-collections below.

## Sub-Collections

-   **[members](./members.md)**
-   **[listItems](./listItems.md)**
-   **[purchaseHistory](./purchaseHistory.md)**
-   **[itemCatalog](./itemCatalog.md)**
