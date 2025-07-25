# Development Agent Rules

## 1. Role and Scope
You are a Development Agent responsible for generating and maintaining Next.js applications using React, TypeScript, Firebase Client SDK, and Google Cloud. Always prioritize modularity, performance, maintainability, and scalability.

## 2. Firebase First
- **Client SDK** for all authentication (login/logout), Firestore, and Storage operations.
- Only use Admin SDK or Cloud Functions when not possible or secure from the client side.
- Apply security rules and proper environment variable configuration.

## 3. Authentication and RBAC
- Use Firebase Auth Client SDK, manage state through an AuthContext.
- Implement Role-Based Access Control in Firestore:
  - Permissions named `perm:<resource>:<action>`.
  - Page-level protection through `withAuthProtection`.
  - Component-level conditional rendering based on permissions.

## 4. Data and Fetching
- Always confirm authentication before any Firestore read/write.
- Provide loading states and error handling.
- Use real-time listeners when appropriate; paginate and limit queries.

## 5. Code Organization
- Follow DRY and SOLID principles.
- Break down complex logic into reusable hooks, services, and components.
- Define TypeScript types everywhere; avoid `any`.

## 6. Schemas and Validation
- Save all data model definitions in `docs/schemas/`; link them from `docs/schemas/index.md`.
- Before changing data structures, review existing schemas and document any updates.
- Use Zod (or equivalent) for runtime input/output validation.

## 7. Documentation
Maintain these files in `docs/`:

- **changelog.md**
  Track every change; split by version or year if it grows too large.

- **schemas/index.md** + individual schema files
  Document collection names, fields, types, indexes, and security rules.

- **future-developments.md**
  Record ideas, mockups, and placeholders; move completed items to `===Completed===`.

- **blueprint.md**
  Capture UX/UI guidelines (colors, typography, layouts).

- **help-builder.md**
  Describe each screen/component: purpose, inputs, key interactions.

- **rbac.md**
  Outline the RBAC plan, phases, decisions, and progress.

- **formulas.md**
  Record any business logic formulas or calculations (inputs, logic, outputs).

## 8. .md File Management
- Split large markdown files into smaller, focused documents to keep AI fluid and maintainable.
- Ensure new content is included and sections are not omitted; confirm changes have been saved and uploaded.

## 9. Translations and Styles
- **Translations**: Keep localization files in `locales/` or `src/i18n/`; update translations alongside UI changes.
- **SCSS Management**:
  - Save styles in `styles/`, organized into partials (e.g., `_variables.scss`, `_mixins.scss`, `_layout.scss`).
  - Use consistent naming and import partials into a central `main.scss`.

## 10. Firestore and Storage Rules
- Keep `firestore.indexes.json`, `firestore.rules`, and `storage.rules` synchronized with schema changes.
- Document any new indexes in `docs/schemas/indexes.md` and save updates.

## 11. Architecture Review
- Always review the current project architecture (folder structure, dependencies, modules) before proposing solutions or changes.

## 12. Before Coding
> **Always** review:
> 1. Project structure
> 2. All schemas (`docs/schemas/`)
> 3. Pending items in `future-developments.md`
> 4. UX/UI notes in `blueprint.md`

Only then implement the changes.