# AI_CONTEXT.md

## What This App Is

**Gestor de Gastos Premium** — a personal finance web app for tracking **gastos** (expenses) and **inversiones** (investments).
Built with React 19 + Firebase (Auth + Firestore). Designed for daily use on desktop and mobile.

---

## UI Style

- **Dark mode** only — `--bg-dark: #0f172a`, cyan accents (`#22d3ee`)
- **Minimal, clean** — inspired by Linear / macOS aesthetic
- **Glassmorphism** — subtle translucent card effects
- **System fonts** with Inter fallback
- **Micro-interactions** — smooth transitions, no heavy animation
- **Responsive** — mobile-first, works down to 380px

---

## Main Modules

| Module | Path | Purpose |
|---------------|-------------------------------|------------------------------------------|
| **Auth** | `src/app/providers/AuthProvider.jsx` | Firebase Auth (email/password), session persistence |
| **Gastos** | `src/features/gastos/` | Expense CRUD, categories, payment methods |
| **Inversiones** | `src/features/inversiones/` | Investment tracking and portfolio view |
| **Dashboard** | `src/features/dashboard/` | KPI metrics, charts (Recharts), CSV export |
| **Settings** | `src/features/settings/` | User preferences, account management |

---

## Data Source

- **Firestore** — primary data store, real-time sync
- **localStorage** — anonymous/fallback mode
- All Firestore logic lives in `services/` files inside each feature
- Security rules defined in `/firestore.rules`

---

## Naming Conventions

### Files & Folders
- **Features**: `src/features/<feature-name>/` (kebab-case folders)
- **Components**: `PascalCase.jsx` (e.g. `GastosPage.jsx`)
- **Services**: `camelCase.js` (e.g. `validationService.js`, `firestoreService.js`)
- **CSS**: co-located, same name as component (e.g. `GastosPage.css`)
- **Providers**: `PascalCaseProvider.jsx` in `src/app/providers/`

### Code
- React components: PascalCase function components
- Hooks: `use` prefix (e.g. `useGastosContext`)
- Constants: UPPER_SNAKE_CASE
- State variables: camelCase
- Spanish for domain terms (gasto, monto, categoria, fecha, metodoPago)
- English for technical terms (provider, service, store, utils)

---

## Strict Boundaries

| Layer | Location | Responsibility |
|------------|--------------------------|----------------------------------------------|
| **UI** | `components/`, feature `*Page.jsx` | Render, user interaction, local state only |
| **Services** | `features/*/services/` | Validation, Firestore ops, business logic |
| **Store** | `src/store/` | Global state (if needed beyond Context) |
| **Providers** | `src/app/providers/` | React Context, connect store ↔ UI |
| **Lib** | `src/lib/` | Firebase init, shared utilities |
| **Types** | `src/types/` | Shared type definitions / constants |

> **Rule**: Components never import `firebase.js` directly. All Firestore calls go through services.

---

## How to Add a New Feature

1. **Create folder** `src/features/<feature-name>/` with `FeaturePage.jsx`, `FeaturePage.css`, and `services/` subfolder.
2. **Add Firestore logic** in `services/firestoreService.js` — never put DB calls in components.
3. **Create a Provider** in `src/app/providers/` if the feature needs shared state across routes.
4. **Register route/navigation** in `src/app/App.jsx`.
5. **Keep files ≤ 250 lines** — split into sub-components or helpers if larger.
