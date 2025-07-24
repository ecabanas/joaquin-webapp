# Joaquin - App Architecture & Core Concepts

This document provides a detailed overview of the core architectural concepts, data structures, and logic flow for the Joaquin application. It is intended as a technical reference for developers.

## Core Concepts

The application is designed around a continuous, collaborative shopping experience for a group of users (e.g., a family, roommates) within a **Workspace**.

### 1. The Workspace

The entire application operates within the context of a shared workspace. All data, including lists, history, and items, is scoped to the user's workspace. This ensures that a group has its own private, collaborative environment.

### 2. The List Lifecycle

Instead of creating separate, disposable lists, the app uses a continuous lifecycle model with a single **"Active List"**. This process is designed to mirror the natural, recurring rhythm of household shopping.

```
+--------------------------------+
|         Active List            |
| (Users add/check items)        |
+--------------------------------+
             |
             | User completes the shopping trip
             | (e.g., clicks "Finish Shopping")
             v
+--------------------------------+
|      Archiving Process         |
| - List is saved to History     |
| - Includes store name & date   |
| - Log who completed the list   |
+--------------------------------+
             |
             |
             v
+--------------------------------+
|       New Active List          |
|  (A new, empty list is born)   |
|                                |
|  * Unchecked items from the    |
|    previous list are carried   |
|    over automatically.         |
+--------------------------------+
```

1.  **Active List:** There is always one, and only one, active grocery list for the workspace. All users in the workspace can view and add items to this list in real-time. This is the primary focus of the `/list` page.
2.  **Completing a List:** When a user has finished a shopping trip (e.g., at "Mercadona"), any user can "complete" the current active list. This action triggers the archiving process. We log which user completed the list for accountability.
3.  **Archiving to History:** The completed list (including items, quantities, store name, and who completed it) is saved as an immutable record in the **Purchase History**. This history is viewable on the `/history` page.
4.  **Rebirth of the Active List:** A new, empty "active" list is immediately generated. Any items that were **left unchecked** on the previous list are **automatically carried over** to this new list, ensuring they are not forgotten on the next trip.

### 3. The Item Catalog

To ensure data consistency (e.g., avoiding duplicates like "Milk" and "milk"), each workspace has its own **Item Catalog**.

*   **Default Catalog:** Workspaces start with a pre-populated list of common grocery items to provide initial search suggestions.
*   **Custom Catalog:** When a user adds an item that doesn't exist in the catalog (e.g., "Kombucha"), they are prompted to add it. If they agree, the new item is saved to the workspace's shared catalog, making it easily searchable for all members in the future.
*   **User Management:** Users can manage their workspace's custom catalog (e.g., edit typos, delete old items) through the settings page.

## Data & Persistence (Firestore Schema)

The application uses **Cloud Firestore** for data persistence and real-time synchronization. The schema is designed to be scalable, secure, and efficient. It revolves around two primary top-level collections: `users` and `workspaces`.

```
/users/{userId}/
    └── { a single user's document }
        ├── name: "Jane Doe"
        ├── email: "jane.doe@example.com"
        └── workspaceId: "workspace-abc"  <-- Links the user to their space

/workspaces/{workspaceId}/
    |
    ├── members/
    |   └── {userId}: { name: "Jane Doe", role: "owner" }
    |   └── {userId}: { name: "John Doe", role: "member" }
    |
    ├── listItems/
    |   └── {listItemId}: { name: "Milk", quantity: 1, checked: false }
    |
    ├── purchaseHistory/
    |   └── {purchaseId}: { date: "July 24, 2024", store: "Mercadona", items: [...] }
    |
    └── itemCatalog/
        └── {catalogEntryId}: { name: "Milk" }
```

### Collection Breakdown:

*   **/users/{userId}**:
    *   This collection stores individual user profiles.
    *   The document ID (`userId`) corresponds to the user's Firebase Authentication UID.
    *   The `workspaceId` field is a critical link that associates a user with their shared workspace. When a user logs in, the app first fetches their user document to find this ID, and then retrieves the corresponding workspace data.

*   **/workspaces/{workspaceId}**:
    *   This is the central container for all shared data for a specific group (e.g., a family). All data is scoped under a workspace to ensure privacy and efficient querying.
    *   It contains several important sub-collections:
        *   **`members`**: Stores a record for each user who has access to the workspace. This is useful for listing members and for writing security rules (e.g., "only members can read list data").
        *   **`listItems`**: Holds the documents for the **current, active grocery list**. Storing each item as a separate document is crucial for real-time collaboration and avoids hitting document size limits.
        *   **`purchaseHistory`**: Contains records of all completed shopping trips. Each document represents one archived list.
        *   **`itemCatalog`**: Stores all unique item names for that workspace, which powers the search suggestions. Each item is its own document to ensure the catalog can scale indefinitely and to make adding/deleting items efficient.

## Project Structure

The project follows the standard Next.js App Router structure.

```
/src
├── ai/
│   ├── flows/
│   │   └── analyze-receipt.ts  # Genkit flow for receipt OCR
│   └── genkit.ts               # Genkit initialization
├── app/
│   ├── (app)/                  # Main application route group
│   │   ├── history/page.tsx    # Purchase history page
│   │   ├── layout.tsx          # Layout for the main app (sidebar/nav)
│   │   ├── list/page.tsx       # "Active" grocery list page
│   │   └── settings/page.tsx   # Settings page (for profile & acct mgmt)
│   ├── globals.css             # Global styles and CSS variables for theming
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Root page (redirects to /list)
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── add-item-search.tsx     # Smart search bar with autocomplete
│   ├── grocery-list-client.tsx # Client component managing list state
│   ├── icons.tsx               # Custom SVG icons (e.g., Logo)
│   └── receipt-analyzer.tsx    # Dialog and logic for the AI receipt scanner
├── hooks/
│   └── use-toast.ts            # Hook for showing toast notifications
└── lib/
    ├── mock-data.ts            # Mock data for the UI
    ├── types.ts                # Core TypeScript type definitions
    └── utils.ts                # Utility functions (e.g., cn for classnames)
```

### AI Functionality (`src/ai`)

The application's AI capabilities are powered by **Genkit**. The core flow is `analyzeReceipt`, defined in `src/ai/flows/analyze-receipt.ts`.

-   **Input:** A base64-encoded data URI of a receipt image.
-   **Process:** The Genkit flow sends the image to a Google AI model with a prompt instructing it to act as a receipt analyzer.
-   **Output:** A structured JSON object containing an array of items with their name, quantity, and price. This JSON can then be used to populate a purchase history record.
