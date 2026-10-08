# Frontend

Next.js client for the AI Chat Assistant, built with the App Router and React 19.

For the project overview, see the [root README](../README.md).

## Routes

| Route | Description |
|---|---|
| `/` | Redirects to the dashboard or the login page depending on the session. |
| `/login`, `/register` | Authentication screens. |
| `/dashboard` | Usage counter, chat list, search and chat creation. |
| `/chat/[id]` | Conversation view. |
| `/profile` | Username and password management. |

## Structure

```
src/
├── app/            Routes and global styles
├── components/     Header, footer and shared layout
├── context/        AuthContext (session) and ThemeContext (light and dark theme)
└── services/       api.js, the single entry point to the backend
```

## Running locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

The application is served at `http://localhost:3000`. By default it talks to the API at `http://localhost:8000`; set `NEXT_PUBLIC_API_URL` to change this. The variable is inlined at build time.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
