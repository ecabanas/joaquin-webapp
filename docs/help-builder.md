# Help Builder

This document describes each screen and key component in the Joaquin application, outlining its purpose, inputs, and core interactions.

## Screens

### `/list` (Grocery List Page)
- **Purpose:** The primary screen of the app. It displays the current, active shopping list for the workspace.
- **Inputs:** Real-time data from the `workspaces/{workspaceId}/listItems` Firestore collection.
- **Key Interactions:**
    - Adding new items to the list via the global search bar.
    - Checking/unchecking items.
    - Incrementing/decrementing item quantities.
    - Deleting items.
    - Clicking "Finish Shopping" to archive the list.

### `/history` (Purchase History Page)
- **Purpose:** To view past shopping trips.
- **Inputs:** Data from the `workspaces/{workspaceId}/purchaseHistory` collection.
- **Key Interactions:**
    - Viewing a list of all past purchases, collapsed by default.
    - Expanding a purchase to see the items, quantities, and prices.
    - Searching for a specific purchase by store, item, or user.
    - Initiating the AI receipt analysis for a purchase that doesn't have price data.

### `/analytics` (Analytics Dashboard Page)
- **Purpose:** To visualize shopping data and provide insights into habits.
- **Inputs:** Aggregated data from the `purchaseHistory` collection.
- **Key Interactions:**
    - Filtering spending data by a time frame (3, 6, 12 months).
    - Tracking the price of a specific item over time.
    - Viewing tabs for Top Shoppers, Most Forgotten Items, and Top Impulse Buys.

### `/settings` (Settings Page)
- **Purpose:** To manage user profile, preferences, and workspace sharing.
- **Inputs:** User profile data from the `users/{userId}` document.
- **Key Interactions:**
    - Viewing and updating user name.
    - Changing the preferred currency.
    - Managing notifications (future feature).
    - Inviting other users to the workspace (future feature).

## Key Components

### `ReceiptAnalyzer`
- **Purpose:** A dialog component that manages the AI receipt scanning workflow.
- **Inputs:** An image file (the receipt) and the original purchase object.
- **Key Interactions:**
    - Previews the uploaded receipt photo.
    - Sends the photo to the Genkit AI flow for analysis.
    - Displays the extracted results (store name, items, prices) in an editable table.
    - Allows the user to correct any data before saving it back to the purchase history record in Firestore.
