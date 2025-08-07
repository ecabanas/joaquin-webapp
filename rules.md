# Joaquin Project Development Agent Rules

---

## 1. Agent Role & Scope
You are the project’s AI development agent. Prioritize modularity, performance, maintainability, and scalability for this Next.js + Firebase SaaS.

---

## 2. Firebase-First Principle
- Use the Firebase Client SDK for all client-side operations.
- Only use the Admin SDK or Cloud Functions when client operations are not secure or possible.
- Always enforce security rules and use correct environment configuration.

---

## 3. Authentication & RBAC
- Handle authentication with Firebase Auth and AuthContext.
- Implement Role-Based Access Control in Firestore with permissions in the form `perm:<resource>:<action>`.
- Protect pages/components according to user permissions.

---

## 4. Data and Fetching
- Ensure user authentication before Firestore operations.
- Provide loading and error states for all async logic.
- Use real-time listeners only when needed; paginate/limit all queries.

---

## 5. Code & Folder Organization
- Follow DRY and SOLID principles.
- Structure logic into reusable hooks, services, and components.
- Define strong TypeScript types; avoid `any`.

---

## 6. Schemas & Validation
- Keep all data model definitions in `docs/schemas/`, linked from `docs/schemas/index.md`.
- Always review/update schemas before structural changes.
- Use Zod (or equivalent) for runtime validation of inputs/outputs.

---

## 7. Documentation
- `/docs` is the authoritative source of truth. Maintain and update:
  - `changelog.md`
  - `schemas/index.md` and schema subfiles
  - `future-developments.md`
  - `blueprint.md`
  - `help-builder.md`
  - `rbac.md`
  - `formulas.md`
- Summarize any significant decision or update from external discussions or tickets in `/docs`.

---

## 8. Markdown & File Hygiene
- Keep Markdown files focused; split large docs as needed.
- Ensure new/updated docs are always properly saved and included.

---

## 9. Translations & SCSS
- Keep localization files in `locales/` or `src/i18n/`, updating with UI changes.
- Manage SCSS partials in `styles/`, imported into `main.scss`.

---

## 10. Indexes & Rules Maintenance
- Sync `firestore.indexes.json`, `firestore.rules`, and `storage.rules` with documented schemas.
- Note all new indexes in `docs/schemas/indexes.md`.

---

## 11. Architecture Review
- Always review folder structure, dependencies, and modules before proposing/implementing changes.

---

## 12. Implementation Checklist
> Before starting work, always review:
> - Project structure
> - All relevant schemas in `docs/schemas/`
> - Pending items in `future-developments.md`
> - Notes in `blueprint.md`
> - RBAC plan and changelog

---

## 13. Agent Commit & Changelog Rules

**For the agent:**
- Use clear, descriptive commit messages following Conventional Commits format:
  - Example: `feat: add role-based access checks (see docs/rbac.md)`
- Reference any `/docs` file modified or informing the change in the commit message.
- For major changes, update `docs/changelog.md` with a brief summary.
- Tag significant, stable releases using semantic versioning (e.g., `v1.2.0`).

---

*Keep `/docs` current—this is essential for AI and human contributors. Consistent commit messages and changelog updates ensure full traceability for scalable, agent-driven SaaS development.*
