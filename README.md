# Aisle Together - Shared List App

This is a Next.js application built with Firebase Studio that functions as a collaborative list manager. It allows users to manage a shared list, track purchase history, and analyze receipts using generative AI.

> For a detailed technical overview of the application's architecture, data flow, and core concepts, please see the **[Technical README](./src/README.md)**.

## Tech Stack

This project is built with a modern, full-stack TypeScript setup:

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for pre-built, accessible components.
-   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI) for server-side AI flows.
-   **UI:** [React](https://reactjs.org/), TypeScript
-   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
-   **Fuzzy Search:** [Fuse.js](https://fusejs.io/) for intelligent item searching.

## Core Features

-   **Collaborative List:** A real-time, shared grocery list for a workspace.
-   **Continuous Lifecycle:** Lists are never-ending. When one is completed, it's archived, and a new one is automatically created with any unfinished items carried over.
-   **Purchase History:** View past shopping trips, including store, date, and items.
-   **AI Receipt Scanner:** Automatically extract items from a receipt photo to log a purchase.

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
