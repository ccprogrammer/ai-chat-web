# Architecture

## Overview

This app uses **feature-based clean architecture** with:

- **`src/core/`** – Shared primitives (API client, types, contexts, base components)
- **`src/features/`** – Domain features (auth, chat) with per-feature layers

Each feature follows: **DataSource → Repository → Hooks/Context → UI**

---

## Structure

```
src/
├── app/                    # Next.js App Router (routes only)
│   ├── (auth)/login, register
│   └── (dashboard)/chat
│
├── core/                   # Shared across features
│   ├── api/                # HTTP client (request, ApiError)
│   ├── components/         # ThemeProvider
│   ├── context/            # ToastProvider, SidebarProvider
│   ├── types/              # Chat, Message, etc.
│   └── constants/          # Storage keys
│
└── features/
    ├── auth/
    │   ├── api/            # auth.datasource.ts
    │   ├── repository/      # auth.repository.ts
    │   ├── context/        # AuthProvider
    │   └── hooks/          # useAuthForm
    │
    └── chat/
        ├── api/            # chat.datasource.ts
        ├── repository/      # chat.repository.ts
        ├── hooks/          # useChats, useChatMessages
        └── components/     # Sidebar, Composer, MessageList, DashboardNavbar
```

---

## Data Flow

```
User action → Hook/Context → Repository → Datasource → Core API → Backend
                    ↑                              ↓
              State update ←── Response / Error
```

---

## Comparison: This Structure vs Your Flutter Structure

| Your Flutter | This Next.js |
|--------------|--------------|
| **core/** | **src/core/** – API client, types, constants, shared components (ThemeProvider, Toast), shared context (Sidebar) |
| **src/** (features) | **src/features/** – auth, chat |
| **Feature: datasource** | **features/x/api/x.datasource.ts** – raw API calls per feature |
| **Feature: repo** | **features/x/repository/** – wraps datasource, no abstract interfaces |
| **Feature: bloc** | **features/x/hooks/** + **features/x/context/** – custom hooks for state + side effects; Context for global state (Auth) |
| **Feature: components, view/page** | **features/x/components/** + **app/…/page.tsx** – UI components in feature, pages in app/ |

### Hooks vs BLoC

- **BLoC** = Events in, States out. You `emit` states; UI listens.
- **Hooks** = Same idea, different shape. `useChats()` returns `{ chats, loading, createChat, ... }`. The hook holds state and exposes actions. No separate event stream.
- **Context** (e.g. `AuthProvider`) = Global state shared across the app, like a singleton BLoC.

### State Libraries in React

- **Redux** – Central store, `useSelector` / `useDispatch`. Heavier.
- **Zustand** – Lightweight store, similar to Redux but simpler.
- **React Query (TanStack Query)** – Server state (fetching, caching). Often used with hooks for data.
- **Context + Hooks** – What this app uses: Context for auth, custom hooks for feature logic. No extra libraries.

---

## Why This Structure

1. **Feature isolation** – Auth and chat are independent; easy to add features.
2. **Clear layers** – Datasource → Repo → Hooks → UI; no circular deps.
3. **Minimal boilerplate** – No abstract repo interfaces.
4. **Core vs features** – Core holds shared code; features hold domain logic.
5. **Next.js-friendly** – `app/` stays thin (routes); logic lives in `features/`.
