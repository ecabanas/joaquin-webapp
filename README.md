# Joaquin - Shared List App

This is a Next.js application built with Firebase Studio that functions as a collaborative list manager. It allows users to manage a shared list, track purchase history, analyze receipts using generative AI, and view insightful analytics about their shopping habits.

> For a detailed technical overview of the application's architecture, data flow, and core concepts, please see the **[Technical README](./src/README.md)**.
> 
> To understand our commitment to quality, please see our **[Testing Strategy](./docs/testing-strategy.md)**.

## Tech Stack

This project is built with a modern, full-stack TypeScript setup:

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for pre-built, accessible components.
-   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI) for server-side AI flows.
-   **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore) for real-time data synchronization.
-   **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth) for user management.
-   **UI:** [React](https://reactjs.org/), TypeScript
-   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
-   **Fuzzy Search:** [Fuse.js](https://fusejs.io/) for intelligent item searching.
-   **Data Visualization:** [Recharts](https://recharts.org/) for analytics dashboards.
-   **Testing:** [Cypress](https://www.cypress.io/) for End-to-End (E2E) testing.

## Core Features

-   **Continuous, Collaborative List:** A real-time, shared grocery list for a workspace. Instead of creating new lists, the app uses a never-ending lifecycle. When one shopping trip is completed, it's archived, and a new list is automatically created with any unfinished items carried over.
-   **AI Receipt Scanner:** Automatically extract store name, items, quantities, and prices from a receipt photo. The AI also compares the receipt to the original shopping list to identify **forgotten items** and **impulse buys**, providing valuable insights into shopping habits.
-   **Purchase History:** View past shopping trips, including store, date, total cost, and the specific items purchased.
-   **Analytics Dashboard:** A dedicated page to visualize shopping data. It includes insights on:
    -   Monthly spending trends and habits.
    -   Price tracking for individual items over time.
    -   A leaderboard of the top shoppers in the workspace.
    -   The most frequently forgotten items and top impulse buys.

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
-   `npm run e2e`: Runs all Cypress E2E tests in a headless browser.

