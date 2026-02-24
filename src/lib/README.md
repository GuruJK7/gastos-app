# lib

## Purpose
Shared libraries, configuration, and pure utility functions.

## What Goes Here
- `firebase.js` — Firebase app init, auth, and Firestore exports
- `utils.js` — Generic helpers (date formatting, currency, etc.)
- Any third-party library wrappers or adapters

## What Does NOT Go Here
- ❌ React components or JSX (belong in `src/components/` or `src/features/`)
- ❌ React hooks or Context (belong in `src/app/providers/`)
- ❌ Feature-specific business logic (belong in `src/features/<name>/services/`)
- ❌ Type definitions or constants (belong in `src/types/`)
