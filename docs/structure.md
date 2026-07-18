# ReMind Frontend — Folder & File Structure

Vite + React + TypeScript SPA. Source lives in `remind/src/`, built output is git-ignored.

```
remind/
├── docs/                     # Project documentation (this folder)
├── node_modules/            # Dependencies (ignored)
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── components/          # UI screens & feature components
│   │   ├── AboutUs/        # Static "About Us" page
│   │   ├── Admin/          # Admin portal (dashboard + expert CRUD + review)
│   │   ├── AIChat/         # AI Chat with real-time streaming support (SSE)
│   │   ├── Chat/           # 1:1 chat between student and expert (Socket.io)
│   │   ├── ExpertDirectory/ # Public expert directory (from localStorage)
│   │   ├── AdminExpertReview/ # Pending expert review + credential downloads
│   │   ├── Profile/        # Expert profile + credential documents tab
│   │   ├── Forum/          # Forum list, post/comment UI, modals
│   │   ├── Home/           # Landing/home screen
│   │   ├── Login/          # Login + register (shared) screen
│   │   └── Register/       # Register screen
│   ├── controllers/        # Business logic, API orchestration, mappers
│   ├── middleware/          # Route/role guards
│   ├── models/             # TypeScript interfaces (data shapes)
│   ├── routes/             # Admin route config + dispatcher
│   ├── services/           # Thin API service layer (forum)
│   ├── utils/              # HTTP client, constants, env
│   ├── App.tsx             # Root component + screen router (state-based)
│   ├── App.css             # App-level styles
│   ├── main.tsx            # React entry point
│   ├── index.css           # Global styles / design tokens
│   └── vite-env.d.ts      # Vite type declarations
├── .env                     # VITE_LOCAL_API_URL, VITE_GOOGLE_CLIENT_ID
├── .gitignore
├── DESIGN.md               # Design system spec
├── README.md
├── index.html              # HTML shell
├── package.json
├── tsconfig*.json          # TS configs (app / node / base)
├── vite.config.js          # Vite config
└── eslint.config.js
```

## Folder responsibilities

| Folder | Responsibility |
|--------|----------------|
| `components/` | Presentational + container React components, one subfolder per screen/feature, each with its own `.css`. |
| `controllers/` | Encapsulate API calls, response mapping, validation, and mixed backend/localStorage admin state. |
| `middleware/` | Guards access to privileged screens (e.g. admin) based on `userRole`. |
| `models/` | Pure TypeScript interfaces describing domain objects and DTOs. |
| `routes/` | Admin route table and dispatcher (which admin sub-screen to render). |
| `services/` | Low-level forum API functions calling the axios client directly. |
| `utils/` | `apiHelper` (axios instance + interceptors + token refresh), `constants` (base URL + endpoint registry), env bindings, `userSocket` (expert status sync). |
| `public/` | Static assets served as-is. |

## Notes

- **Routing is state-based**, not react-router: `App.tsx` switches the active screen via `currentScreen` / `adminRoute` state. All screens are `React.lazy` loaded.
- **Two parallel forum API layers** exist (`services/forumService.ts` and `controllers/ForumController.ts`) hitting the same backend — see `docs/api-reference.md`.
- **Admin review is backend-backed**: pending expert review, credential downloads, and review notifications use the API; legacy dashboard/CRUD slices still use `localStorage`.
- **Expert onboarding is Settings-based**: pending experts complete onboarding in `settings`; `aichat`, `chat`, and `calendar` stay gated until `status` stops being `pending`.
