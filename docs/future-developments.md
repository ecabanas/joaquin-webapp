# Future Developments

This document tracks planned features, ideas, and improvements for the Joaquin application.

## Prioritized Roadmap

This roadmap is structured to focus on establishing the app's core identity and foundational features first, before moving on to major UX enhancements and long-term stability.

### Tier 1: Core Identity & Foundational Features

These features define what Joaquin *is*: an intelligent, accessible, and collaborative grocery app.

1.  **Internationalization (i18n):**
    *   **Goal:** Localize the application to Spanish, Catalan, and English, with a scalable architecture for future languages.
    *   **Implementation:** Use a library like `next-intl`. Create JSON files for each language (`en.json`, `es.json`, `ca.json`) for UI text. Develop separate default item catalogs for each language. Use middleware to detect the user's browser locale and serve the appropriate version.

2.  **Smart Sorting:**
    *   **Goal:** Sort the grocery list based on the typical layout of a supermarket to make shopping more efficient.
    *   **Implementation:** Start with a heuristic-based approach. Create a dictionary mapping grocery items to categories (e.g., "Produce", "Dairy", "Frozen"). Define a fixed sort order for these categories to apply to the list. This provides immediate value before a more complex machine-learning model is needed.

3.  **Implement Sharing & Invitations:**
    *   **Goal:** Allow users to securely invite others to their workspace.
    *   **Implementation:** Create a secure, email-based invitation flow. An invite generates a unique token stored in Firestore. When the new user signs up using the invite link, a Cloud Function will verify the token and add them to the workspace.

### Tier 2: Major UX Enhancements

With the core in place, we focus on delighting the user and making the app feel effortless.

4.  **Mobile Quick-Add Bar:**
    *   **Goal:** Drastically speed up the process of adding common items on mobile.
    *   **Implementation:** Add a horizontally scrolling bar below the search input. This bar will display intelligently predicted items based on purchase history, frequently forgotten items, etc. A single tap adds the item to the list.

5.  **Comprehensive Error Management:**
    *   **Goal:** Ensure the user receives clear, helpful feedback when an action cannot be completed.
    *   **Implementation:** Conduct a full review of the application to identify all potential points of failure (especially network-dependent Firestore operations). Implement user-friendly toast notifications for these cases (e.g., "You appear to be offline. Your changes will sync when you reconnect.").

### Tier 3: Long-term Stability & Personalization

These tasks ensure the app remains stable and continues to evolve.

6.  **Create and Implement a Testing Strategy:**
    *   **Goal:** Ensure code quality and prevent regressions as the app grows.
    *   **Implementation:** Adopt a multi-tiered testing strategy and integrate it into a CI/CD workflow (e.g., GitHub Actions):
        *   **Unit Tests (Jest/Vitest):** For utility functions and hooks.
        *   **Integration Tests (React Testing Library):** For testing how components work together.
        *   **E2E Tests (Cypress/Playwright):** For critical user flows like login and signup.

7.  **Profile Picture Upload:**
    *   **Goal:** Allow users to personalize their profile with a custom photo.
    *   **Implementation:** Use Firebase Storage to host uploaded images. Add client-side logic for file handling, previewing, and compression before uploading. Update the user's profile with the new photo URL.

---

## Other Ideas & Backlog

- Push Notifications: Implement push notifications for key events (e.g., when a partner adds an item to the list).
- Advanced Budgeting: Allow users to set a monthly budget and track spending against it. Add a "Deal Finder" to notify users of good prices.
- Recipe Integration: A dedicated section for planning weekly meals and automatically generating a grocery list from that plan.
- **Implement Analytics (GA4 & Clarity):** Integrate Google Analytics for quantitative event tracking (the "what") and Microsoft Clarity for qualitative session recordings and heatmaps (the "why"). This will enable data-driven product decisions.
- **User Feedback & Public Roadmap:** Create a simple in-app mechanism (e.g., a "Feedback" button) for users to submit bug reports and feature ideas. Consider making a public-facing version of this roadmap to show users what's being worked on.
- **Implement Pricing Model with Stripe:** Introduce a "Pro" tier to generate revenue. This will involve integrating the "Run Payments with Stripe" Firebase Extension to handle subscriptions and conditionally unlocking advanced features based on a user's subscription status in Firestore.

---

### ===Completed===

- **Set Up Multiple Environments (Dev/Prod):**
    *   **Goal:** To create separate, isolated environments for development and production to ensure production data is always safe.
    *   **Implementation:** Create a second Firebase project to serve as the `dev` environment. Use `.env.local` to store development Firebase config keys and use hosting provider environment variables for production keys. The app will dynamically use the correct configuration based on the environment it's running in.
