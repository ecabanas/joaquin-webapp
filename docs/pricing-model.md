# Joaquin - Pricing & Monetization Strategy

This document outlines the proposed pricing model for the Joaquin application. The goal is to create a simple, value-driven model that encourages user adoption while providing a clear path to revenue for long-term sustainability.

## Guiding Principle: The "Freemium" Model

A Freemium model is the best fit for Joaquin. It allows users to experience the core value of the app for free, which is crucial for word-of-mouth growth. A paid "Pro" tier can then be offered to users who want to unlock more powerful, advanced features.

-   **Low Barrier to Entry:** Anyone can start using the app without a credit card.
-   **Value-Driven Upsell:** Users only pay when they see the value and want more.
-   **Natural Growth Loop:** Free users can invite others, expanding the user base and creating potential future "Pro" customers.

---

## Proposed Pricing Tiers

### Joaquin Free (The "Household" Plan)

-   **Price:** $0
-   **Target Audience:** A small family, a couple, or roommates.
-   **Features:**
    -   **Unlimited Grocery Lists:** The core experience remains free.
    -   **Real-time Syncing:** The primary collaborative feature is included.
    -   **Shared Workspace:** Up to **3 members** per workspace.
    -   **Purchase History:** Access to the last 10 shopping trips.
    -   **AI Receipt Analysis:** A limited number of scans per month (e.g., **5 scans/month**). This gives users a powerful taste of the AI magic.
    -   **Basic Analytics:** Access to the spending overview and top shoppers.

### Joaquin Pro (The "Super Organizer" Plan)

-   **Price:** $4.99/month or $49/year (example pricing).
-   **Target Audience:** Power users, larger families, or anyone who wants to maximize their efficiency and insights.
-   **Features:** Everything in Free, plus:
    -   **Unlimited Workspace Members:** Invite as many people as you need.
    -   **Unlimited Purchase History:** Access your entire shopping history forever.
    -   **Unlimited AI Receipt Analysis:** Scan every receipt without limitations.
    -   **Advanced Analytics & Insights:** Unlock detailed reports on forgotten items, impulse buys, and category spending.
    -   **Smart Sorting:** The intelligent list sorting to make shopping trips faster.
    -   **Meal Planning & Recipe Integration:** The future meal planning feature would be a Pro exclusive.
    -   **Priority Support.**

---

## Implementation Strategy: Stripe Integration

The implementation will be handled using the official **"Run Payments with Stripe" Firebase Extension**.

1.  **Stripe Setup:** A "Joaquin Pro" product with monthly and annual pricing will be created in the Stripe dashboard.
2.  **Firebase Extension:** The extension will be installed and configured. It will listen for successful payments and automatically update a user's document in Firestore.
3.  **App Logic:**
    -   A new field (e.g., `subscriptionTier: 'pro'`) will be added to the user's profile in Firestore upon successful subscription.
    -   The application's UI will conditionally render features based on the value of this field.
    -   A secure customer portal, hosted by Stripe, will be linked from the app's settings page for users to manage their subscription.

This approach is secure, relies on trusted third-party services, and minimizes the amount of payment-related logic we need to build and maintain ourselves.
