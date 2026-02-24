# features/gastos

## Purpose
Expense tracking module — CRUD for daily expenses with categories, payment methods, and time tracking.

## What Goes Here
- `GastosPage.jsx` — page component that composes sub-components
- `GastosPage.css` — co-located styles
- `components/` — feature-specific sub-components (e.g. `GastoCard.jsx`)
- `services/` — Firestore CRUD (`firestoreService.js`), validation (`validationService.js`)

## What Does NOT Go Here
- ❌ Shared UI components (use `src/components/`)
- ❌ Firebase init or config (lives in `src/lib/firebase.js`)
- ❌ Auth logic (belongs in `src/features/auth/`)
- ❌ Dashboard charts or KPIs (belongs in `src/features/dashboard/`)
- ❌ Global state providers (belong in `src/app/providers/`)
