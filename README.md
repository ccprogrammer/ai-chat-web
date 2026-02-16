# AI Chat — Web

Next.js frontend for the [AI Chat](https://github.com/ccprogrammer/ai-chat) backend. Multiple conversations, persistent history, GitHub-like theme (light/dark).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (GitHub-style design tokens)
- **React 18**

## Project structure

```
├── app/
│   ├── (auth)/           # Route group: login, register
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # Route group: protected chat UI
│   │   ├── chat/
│   │   │   ├── [id]/     # Thread view
│   │   │   └── page.tsx  # Chat list / empty state
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx          # Landing (redirects if logged in)
│   └── globals.css
├── components/
│   ├── chat/             # Sidebar, message list, composer
│   └── theme-provider.tsx
├── lib/
│   ├── api.ts            # Backend API client
│   └── auth-context.tsx  # JWT auth state
├── types/
│   └── index.ts          # Shared types (aligned with backend)
└── tailwind.config.ts
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set the backend URL if needed:

   ```bash
   cp .env.example .env.local
   ```

   Default: `NEXT_PUBLIC_API_URL=http://localhost:8000`

3. **Run the backend**

   From the [ai-chat](https://github.com/ccprogrammer/ai-chat) repo:

   ```bash
   uvicorn app.main:app --reload
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up or sign in, then create chats and send messages.

## Features

- **Auth**: Register / login with email and password; JWT stored in `localStorage`.
- **Chats**: List, create, delete; sidebar with chat list and “New chat”.
- **Messages**: Load history for a chat; send messages with model choice (fast / balanced / smart).
- **Theme**: GitHub-like light/dark theme with a header toggle.

## API contract

The app expects the backend to expose:

- `POST /auth/register`, `POST /auth/login` → `{ access_token, token_type }`
- `GET /chats`, `POST /chats`, `GET /chats/:id`, `GET /chats/:id/messages`, `PATCH /chats/:id`, `DELETE /chats/:id`
- `POST /chat` with `{ chat_id, message, model }` → `{ reply, chat_id }`

See the [backend README](https://github.com/ccprogrammer/ai-chat) for full API details.

## License

MIT — see [LICENSE](LICENSE) for details.
