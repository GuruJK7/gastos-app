# features/inversiones

## Purpose
Investment tracking module — portfolio view, asset management, and performance metrics.

## What Goes Here
- `InversionesPage.jsx` — page component
- `InversionesPage.css` — co-located styles
- `components/` — feature-specific sub-components
- `services/` — Firestore ops for investments, validation, calculations

## What Does NOT Go Here
- ❌ Expense (gasto) logic (belongs in `src/features/gastos/`)
- ❌ Shared UI components (use `src/components/`)
- ❌ Firebase init (lives in `src/lib/firebase.js`)
- ❌ Global providers (belong in `src/app/providers/`)
