# components

## Purpose
Shared, reusable UI components used across multiple features.

## What Goes Here
- Generic UI primitives: `Button.jsx`, `Modal.jsx`, `Card.jsx`
- App shell components: `shell/Sidebar.jsx`, `shell/Header.jsx`
- Each component gets its own `.jsx` + optional co-located `.css`
- `assets/` subfolder for shared icons/illustrations

## What Does NOT Go Here
- ❌ Feature-specific components (belong in `src/features/<name>/components/`)
- ❌ Business logic or Firestore calls (belong in feature `services/`)
- ❌ Context providers (belong in `src/app/providers/`)
- ❌ Utility functions (belong in `src/lib/`)
