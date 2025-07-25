# Schema: listItems

This collection holds the documents for the **current, active grocery list**. Storing each item as a separate document is crucial for real-time collaboration and avoids hitting document size limits.

**Collection Path:** `/workspaces/{workspaceId}/listItems`

## Document Fields

| Field Name | Type    | Description                                     |
|------------|---------|-------------------------------------------------|
| `name`     | String  | The name of the item (e.g., "Milk").            |
| `quantity` | Number  | The quantity of the item to be purchased.       |
| `checked`  | Boolean | `true` if the item has been purchased/is in the cart, `false` otherwise. |
| `notes`    | String  | (Optional) Any additional notes for the item.   |

## Indexes

- An ascending index on the `name` field is used to display the list in alphabetical order.

## Security Rules

- **Read:** Any authenticated user who is a member of the workspace can read the list items.
- **Write:** Any authenticated user who is a member of theworkspace can add, update, or delete list items.
