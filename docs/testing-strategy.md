# Joaquin - Testing Strategy

This document outlines the testing strategy for the Joaquin application. Our goal is to maintain a high level of quality, prevent regressions, and ensure a stable and reliable experience for our users. We achieve this through a multi-layered testing approach, commonly known as the "Testing Pyramid."

## The Testing Pyramid

The testing pyramid is a framework that guides how we balance different types of automated tests.

```
      /----------\
     /   E2E      \  (Fewest)
    /--------------\
   /  Integration   \
  /------------------\
 /       Unit         \ (Most)
/----------------------\
```

### 1. Unit Tests (The Foundation)

-   **What they are:** Small, fast tests that check an individual "unit" of code in isolation, such as a single function or React component. They do not involve databases, network requests, or other external systems.
-   **Purpose:** To verify that the fundamental building blocks of our application work as expected. They are cheap to write and run quickly, providing immediate feedback during development.
-   **Tools:** We will use a framework like **Jest** or **Vitest** with **React Testing Library**.
-   **Examples:**
    -   Does the `getAuthErrorMessage` utility function return the correct string for a given error code?
    -   Does the `useCurrency` hook format a number into the correct currency string?
    -   Does a UI component render correctly when given specific props?

### 2. Integration Tests (The Middle Layer)

-   **What they are:** Tests that verify that several units work together correctly. They are more focused on the interactions *between* components.
-   **Purpose:** To ensure that different parts of our application are integrated correctly. They provide more confidence than unit tests but are slower to run.
-   **Tools:** **React Testing Library** combined with our testing framework.
-   **Examples:**
    -   When a user clicks the "Add to List" button in a component, does it correctly call the `addListItem` function?
    -   Does the `GroceryListClient` component correctly display items passed down from its parent page?

### 3. End-to-End (E2E) Tests (The Peak)

-   **What they are:** High-level tests that simulate a complete user journey through the application in a real browser environment. They interact with the application just as a user would, from the UI to the database.
-   **Purpose:** To verify that critical user flows work from start to finish. They provide the highest level of confidence but are the most expensive and slowest to run. They are our ultimate safety net against regressions.
-   **Tools:** **Cypress**.
-   **Current Implemented Flows:**
    -   **Signup:** A new user can create an account and is redirected to the list page.
    -   **Login/Logout:** A registered user can log in to the app and subsequently log out.
    -   **Add Item:** An authenticated user can add an item to their grocery list and see it appear.

## Continuous Integration (CI)

All our E2E tests are automatically executed via **GitHub Actions** on every push to the `main` branch. This ensures that no code that breaks our critical user flows can be integrated into the main line of development without our knowledge.

This CI pipeline acts as a quality gate, giving us the confidence to develop and deploy features quickly and safely.
