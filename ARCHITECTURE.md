# ARCHITECTURE.md

## Folder Structure

```
gastos-app/
├── public/                        # Static assets served as-is
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── *.png                      # App icons
│
├── src/
│   ├── index.js                   # Entry point — renders App
│   ├── index.css                  # Global resets, CSS variables, base typography
│   │
│   ├── app/                       # App shell — routing, layout, providers
│   │   ├── App.jsx                # Root component, route definitions
│   │   └── providers/             # React Context providers
│   │       ├── AuthProvider.jsx
│   │       ├── ToastProvider.jsx
│   │       └── GastosProvider.jsx
│   │
│   ├── components/                # Shared/reusable UI components
│   │   ├── Button.jsx             # Example: generic button
│   │   ├── Modal.jsx              # Example: generic modal shell
│   │   └── Sidebar.jsx            # Example: navigation sidebar
│   │
│   ├── features/                  # Feature modules (domain-driven)
│   │   ├── gastos/
│   │   │   ├── GastosPage.jsx     # Page component (composes sub-components)
│   │   │   ├── GastosPage.css     # Co-located styles
│   │   │   ├── components/        # Feature-specific sub-components
│   │   │   │   └── GastoCard.jsx
│   │   │   └── services/
│   │   │       ├── firestoreService.js   # Firestore CRUD for gastos
│   │   │       └── validationService.js  # Validation + constants
│   │   │
│   │   ├── inversiones/
│   │   │   ├── InversionesPage.jsx
│   │   │   ├── InversionesPage.css
│   │   │   ├── components/
│   │   │   └── services/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── DashboardPage.css
│   │   │   ├── components/
│   │   │   └── services/
│   │   │
│   │   └── settings/
│   │       ├── SettingsPage.jsx
│   │       ├── SettingsPage.css
│   │       └── services/
│   │
│   ├── lib/                       # Shared libraries & config
│   │   ├── firebase.js            # Firebase init (app, auth, db)
│   │   └── utils.js               # Generic helpers (formatDate, etc.)
│   │
│   ├── store/                     # Global state (if beyond Context)
│   │
│   └── types/                     # Shared constants, enums, type defs
│
├── firestore.rules                # Firestore security rules
├── package.json
├── postcss.config.js
├── AI_CONTEXT.md
├── ARCHITECTURE.md
├── AGENT_RULES.md
└── README.md
```

---

## Core Rules

### Pages Compose, Components Render

- **Page components** (`*Page.jsx`) orchestrate layout, state, and sub-components.
- **Sub-components** (`components/`) are pure UI — they receive props, render, and emit events.
- Pages live at `src/features/<name>/`, shared components at `src/components/`.

### Services Handle Firestore

- **All Firestore reads/writes** go through `services/firestoreService.js` inside each feature.
- Components and pages **never** import from `src/lib/firebase.js` directly.
- Services export plain async functions — no React hooks, no JSX.
- Validation logic lives in `services/validationService.js`.

### Providers Bridge State ↔ UI

- Each provider in `src/app/providers/` wraps a Context with a custom hook (`useXxxContext`).
- Providers call services internally — components only see the hook API.

---

## Assets & Images

| Type | Location | Notes |
|------|----------|-------|
| App icons (favicon, PWA) | `public/` | Referenced in `manifest.json` |
| Feature-specific images | `src/features/<name>/assets/` | Imported in JSX, bundled by Webpack |
| Shared icons/illustrations | `src/components/assets/` | Only if used across multiple features |

> **Do not** place runtime images in `public/` unless they must bypass the build pipeline.

---

## File Size Rule

- **Maximum 250 lines per file** (including imports and exports).
- If a page component exceeds 250 lines, extract sub-components into `components/` subfolder.
- If a service exceeds 250 lines, split by domain concern (e.g. `queryService.js`, `mutationService.js`).
- CSS files may exceed 250 lines only if they cover full responsive breakpoints for a single page.

---

## Import Order Convention

```jsx
// 1. React / library imports
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';

// 2. App-level imports (providers, lib)
import { useAuth } from '../../app/providers/AuthProvider';
import { db } from '../../lib/firebase';

// 3. Feature-local imports (services, components)
import { validateGasto } from './services/validationService';
import GastoCard from './components/GastoCard';

// 4. Styles
import './GastosPage.css';
```

---

## Key Constraints

- **React 19** — function components only, no class components.
- **No state management library** — React Context + `useReducer` where needed.
- **Recharts** for all charts — no other charting libraries.
- **CSS files** — no CSS-in-JS, no Tailwind. Plain CSS with CSS variables.
- **Firebase v9+ modular SDK** — tree-shakeable imports only.
