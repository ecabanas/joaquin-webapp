# Schema: itemCatalog

This collection stores all unique item names for a workspace, which powers the search suggestions in the app. Each item is its own document to ensure the catalog can scale indefinitely.

**Collection Path:** `/workspaces/{workspaceId}/itemCatalog`

## Document Fields

| Field Name | Type   | Description                                     |
|------------|--------|-------------------------------------------------|
| `name`     | String | The name of the grocery item (e.g., "Milk", "Bread"). |

## Indexes

- An ascending index on the `name` field is required to allow for ordered querying, which populates the search suggestions.

## Security Rules

- **Read:** Any authenticated user who is a member of the workspace can read the item catalog.
- **Write:** Any authenticated user who is a member of the workspace can add new items to the catalog. This happens automatically when a new, unique item is added to the shopping list.
