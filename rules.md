# Joaquin Project Development Agent Rules

---

## 1. Agent Role & Scope
You (the agent) are responsible for maintaining and evolving this Next.js, TypeScript, and Firebase-based SaaS. Every action should prioritize modularity, performance, maintainability, and long-term scalability.

---

## 2. Firebase-First Principle
- Use the **Firebase Client SDK** for all authentication (login, logout), Firestore, and Storage operations.  
- Use the Admin SDK or Cloud Functions only when strictly necessary and securely.
- Always apply security rules and proper environment configs.

---

## 3. Authentication & Role-Based Access Control (RBAC)
- Use Firebase Auth and manage state via an AuthContext.
- Implement RBAC using Firestore permissions structured as `perm:<resource>:<action>`.
- Protect pages with `withAuthProtection` and render UI based on user permissions.

---

## 4. Data Access & Loading Patterns
- Always check authentication before Firestore access.
- Implement strong loading and error states for all async flows.
- Use real-time Firestore listeners only when needed, always paginate/limit queries.

---

## 5. Code Organization & Standards
- Apply DRY and SOLID principles throughout.
- Structure code into reusable hooks, services, and components.
- Use explicit TypeScript types everywhere; avoid `any`.

---

## 6. Schemas & Validation
- Store all data models in `docs/schemas/`, linking back to `docs/schemas/index.md`.
- Change schemas only after reviewing docs and updating all definitions.
- Use Zod (or similar) for runtime validation in all entry points.

---

## 7. Documentation: /docs is the Source of Truth
- **changelog.md**: Versioned list of every change, split if too large.
- **schemas/index.md** (+ sub-schema files): Document collections, fields, indexes, and security.
- **future-developments.md**: Ideas, mockups, pending features. Move completed to `===Completed===`.
- **blueprint.md**: UX/UI standards (colors, layouts).
- **help-builder.md**: Purpose/inputs/logic for all components/screens.
- **rbac.md**: RBAC plan and history.
- **formulas.md**: Business logic formulas.

**Keep documentation current, granular, and actionable.**

---

## 8. Markdown & Doc Management
- Split large files to maintain AI and human usability.
- New/updated docs must be saved and reviewed—no lost sections.
- Summarize/extract any important architectural/product info from tickets, PRs, and chat into relevant `/docs` files.

---

## 9. Translations & Styles
- Store i18n files in `locales/` or `src/i18n/`; always update alongside UI.
- Place SCSS partials in `styles/`, naming consistently and importing to `main.scss`.

---

## 10. Firestore & Storage Index/Rules
- Keep `firestore.indexes.json`, `firestore.rules`, and `storage.rules` in sync with docs and schemas.
- Document new indexes in `docs/schemas/indexes.md`.

---

## 11. Architecture Review Before Change
- Always review the current folder structure, dependencies, modules, and schemas before implementing changes or proposing major new features.

---

## 12. Pre-Implementation Checklist
> Before starting any work, **always review and reference**:  
> 1. The app structure (as implemented).  
> 2. All relevant schemas (`docs/schemas/`).  
> 3. `future-developments.md` for pending ideas/features.  
> 4. `blueprint.md` for UI/UX patterns.  
>  5. RBAC plan and changelog for security/flow.

---

## 13. AI Agent Collaboration
- **Any code or document suggestion by agents (AI or human) should cite the relevant doc sections/definitions used.**
- **If an external project management tool is ever used, its relevant documentation/decisions must be echoed into `/docs` within the codebase.**
- **Agents should proactively update diagrams, docs, and changelogs following accepted changes.**

---

*Maintaining detailed, actionable `/docs` is crucial for both AI and human contributors. This enables Gemini, Comet, or future assistants to always have the full project context and history, ensuring reliable, scalable SaaS development.*