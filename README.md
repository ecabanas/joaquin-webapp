# Aisle Together - Shared Grocery List App

Thisss is a Next.js application built with Firebase Studio that functions as a collaborative grocery list manager. It allows users to manage a shared shopping list, track purchase history, and analyze receipts using generative AI.

## Tech Stack

This project is built with a modern, full-stack TypeScript setup:

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for pre-built, accessible components.
-   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI) for server-side AI flows.
-   **UI:** [React](https://reactjs.org/), TypeScript
-   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
-   **Fuzzy Search:** [Fuse.js](https://fusejs.io/) for intelligent item searching.

## Core Features

### 1. Grocery List (`/list`)

-   **Add Items:** A smart search bar allows users to quickly add items to the list. It provides suggestions based on popular items and existing list items.
-   **Real-time Updates:** The list is designed to be shared, with state managed in the client for real-time interaction.
-   **Item Management:** Users can check/uncheck items, change quantities, or delete items.
-   **Progress Bar:** A dynamic progress bar shows the completion status of the shopping list, with a celebratory "shimmer" animation upon completion.

### 2. Purchase History (`/history`)

-   **Past Purchases:** Displays a log of past shopping trips, showing the store, date, and a breakdown of items with their prices.
-   **Receipt Analyzer (AI Feature):** Users can upload a photo of a grocery receipt. A Genkit AI flow analyzes the image to extract all items, quantities, and prices, allowing for easy import into the purchase history.

### 3. Settings (`/settings`)

-   **Profile Management:** A dedicated page for users to update their profile information.
-   **Notification Preferences:** Toggles to control different types of app notifications.
-   **List Sharing:** UI for managing who has access to the shared grocery list.

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
│   │   ├── list/page.tsx       # Grocery list page
│   │   └── settings/page.tsx   # Settings page
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
    ├── types.ts                # TypeScript type definitions
    └── utils.ts                # Utility functions (e.g., cn for classnames)
```

### AI Functionality (`src/ai`)

The application's AI capabilities are powered by **Genkit**. The core flow is `analyzeReceipt`, defined in `src/ai/flows/analyze-receipt.ts`.

-   **Input:** A base64-encoded data URI of a receipt image.
-   **Process:** The Genkit flow sends the image to a Google AI model with a prompt instructing it to act as a receipt analyzer.
-   **Output:** A structured JSON object containing an array of items with their name, quantity, and price. This JSON is then used to populate the UI.

## Getting Started

To run the application locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

### Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Creates a production build of the application.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Lints the codebase.
```