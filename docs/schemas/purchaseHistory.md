# Schema: purchaseHistory

This collection contains records of all completed shopping trips. Each document represents one archived list.

**Collection Path:** `/workspaces/{workspaceId}/purchaseHistory`

## Document Fields

| Field Name      | Type      | Description                                                                                                   |
|-----------------|-----------|---------------------------------------------------------------------------------------------------------------|
| `date`          | Timestamp | The date and time the shopping trip was completed.                                                            |
| `store`         | String    | The name of the store where the purchase was made. Extracted by AI from the receipt.                          |
| `completedBy`   | String    | The name of the user who marked the list as "finished."                                                       |
| `items`         | Array     | An array of maps, where each map represents a purchased item. `{ name: string, quantity: number, price: number }` |
| `originalItems` | Array     | An array of maps of the items as they were on the original list. `{ name: string, quantity: number }`           |
| `comparison`    | Map       | An object containing the results of the AI receipt analysis. `{ forgottenItems: [], impulseBuys: [] }`          |

## Indexes

- A descending index on the `date` field is required to show the most recent purchases first in the history view.

## Security Rules

- **Read:** Any authenticated user who is a member of the workspace can read the purchase history.
- **Write:**
    - **Create:** New documents are created by the `finishShopping` function.
    - **Update:** Any member can update a document, primarily to add the AI analysis data.
    - **Delete:** Only owners/admins should be able to delete history records (future implementation).
