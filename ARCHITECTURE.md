# Architecture

This app follows a **layered architecture** inspired by Flutter/clean architecture:

```
DataSource → Repository → State (hooks/context) → UI
```

## Layers

### 1. DataSource (`lib/api.ts`)
Low-level HTTP client. Handles:
- Fetch requests, auth headers, base URL
- 401 redirect to login
- Logging, error parsing
- Throws `ApiError` with status and message

### 2. Repository (`lib/repositories/`)
Domain-specific data access. Wraps the data source:
- **auth.repository.ts** – login, register
- **chats.repository.ts** – list, create, update, delete chats; get messages; send message

Repositories are plain TS modules (no React). Easy to test and swap implementations.

### 3. State / Business logic
- **AuthProvider** (`lib/auth-context.tsx`) – global auth state (token, login, register), uses auth repository
- **useAuthForm** (`lib/hooks/use-auth-form.ts`) – login/register form state, error handling, submit
- **useChats** (`lib/hooks/use-chats.ts`) – chat list state + actions (create, rename, delete)
- **useChatMessages** (`lib/hooks/use-chat-messages.ts`) – messages state + send

Hooks encapsulate loading, error handling (toast or inline), optimistic updates, and call context/repositories.

### 4. UI
Pages and components consume hooks/context only. No direct API or repository imports.

```
app/(dashboard)/chat/page.tsx     → useChats()
app/(dashboard)/chat/[id]/page.tsx → useChats(id) + useChatMessages(id)
app/(auth)/login/page.tsx         → useAuthForm('login')
app/(auth)/register/page.tsx      → useAuthForm('register')
```

## Flow

```
User action → Hook/Context → Repository → DataSource (API) → Backend
                ↑                              ↓
            State update ←────── Response / Error
```
