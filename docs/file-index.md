# ReMind Frontend — File Index

One entry per source file. "Exports" lists the public symbols (functions, classes, components, constants).

## Entry & shell

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/main.tsx` | React entry point; mounts `<App/>` into `#root`. | — |
| `src/App.tsx` | Root component. Holds app state (`userRole`, `currentScreen`, `adminRoute`) and renders the active screen via `lazy`/`Suspense`. | `default App` |
| `src/App.css` | App-level layout and shared styles. | — |
| `src/index.css` | Global reset, design tokens (CSS variables), base typography. | — |
| `src/vite-env.d.ts` | Vite client type references. | — |

## Utils

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/utils/apiHelper.tsx` | **The real HTTP client.** Axios instance (`api`) with `Bearer` token injection and 401 auto-refresh via `/auth/refresh`. Wraps requests in `apiHelper.{get,post,put,patch,delete}`. | `api` (default), `apiHelper`, `clearAuthData` |
| `src/utils/constants.tsx` | Base URLs and the endpoint registry. | `BASE_URL`, `API_BASE_URL`, `API_ENDPOINTS` |

## Models (interfaces only)

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/models/ForumPost.ts` | Frontend forum/comment data shapes and create DTOs. | `ForumPost`, `Comment`, `CreatePostData`, `CreateCommentData` |
| `src/models/Expert.ts` | Expert entity + expert form data. | `Expert`, `ExpertFormData` |
| `src/models/DashboardStats.ts` | Admin dashboard stats + activity log shapes. | `DashboardStats`, `ActivityLog` |

## Controllers

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/controllers/AuthController.ts` | Real auth API: login, register, Google login, logout; reads/writes tokens & user in `localStorage`. | `AuthController` (class), `UserDto`, `AuthResponse` |
| `src/controllers/ForumController.ts` | **Real forum API** via `apiHelper` + backend↔frontend mappers; also holds validation & `formatTimeAgo` helpers. | `ForumController` (class) |
| `src/controllers/ExpertController.ts` | **Mocked** expert CRUD over `localStorage` (seed list, activity log). No network. | `ExpertController` (class) |
| `src/controllers/DashboardController.ts` | **Mocked** dashboard stats computed from `ExpertController` + localStorage logs. | `DashboardController` (class) |

## Services

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/services/forumService.ts` | **Real forum API** (parallel to `ForumController`) calling `api` directly. | `getForums`, `getPosts`, `getPostDetail`, `createPost`, `createComment`, `toggleLike`, `searchPosts` |

## Routes

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/routes/adminRoutes.tsx` | Admin route table + dispatcher that renders the active admin sub-screen. | `AdminRoute` (type), `ADMIN_ROUTES`, `AdminRouteDispatcher` |

## Middleware

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/middleware/adminGuard.tsx` | Gate admin screens by `userRole`; redirect non-admins home. | `default AdminGuard` |

## Components — Auth & Landing

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/components/Home/Home.tsx` | Landing screen; entry points to AI chat, experts, forum, login/register, about, admin. | `default Home` |
| `src/components/Home/Home.css` | Home styles. | — |
| `src/components/Login/Login.tsx` | Login/register hybrid screen; calls `AuthController` (email/password + Google). | `default Login` |
| `src/components/Login/Login.css` | Login styles. | — |
| `src/components/Register/Register.tsx` | Register screen; calls `AuthController.register`. | `default Register` |
| `src/components/Register/Register.css` | Register styles. | — |
| `src/components/AboutUs/AboutUs.tsx` | Static about page. | `default AboutUs` |
| `src/components/AboutUs/AboutUs.css` | About styles. | — |

## Components — Forum

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/components/Forum/Forum.tsx` | Forum list + post feed, search, infinite cursor pagination; uses `forumService`. | `default Forum` |
| `src/components/Forum/Forum.css` | Forum styles. | — |
| `src/components/Forum/ForumDetail.tsx` | Post detail view (via `forumService.getPostDetail/createComment/toggleLike`). | `default ForumDetail` |
| `src/components/Forum/ForumDetail.css` | ForumDetail styles. | — |
| `src/components/Forum/PostDetail.tsx` | Post detail card; uses `ForumController` (getPostDetail, toggleLike). | `default PostDetail` |
| `src/components/Forum/PostDetail.css` | PostDetail styles. | — |
| `src/components/Forum/CommentSection.tsx` | Comment list + reply composer; uses `ForumController`. | `default CommentSection` |
| `src/components/Forum/CommentSection.css` | CommentSection styles. | — |
| `src/components/Forum/CreatePostModal.tsx` | Create-post modal; uses `ForumController.validate/createPost`. | `default CreatePostModal` |
| `src/components/Forum/CreatePostModal.css` | CreatePostModal styles. | — |
| `src/components/Forum/ForumModal.css` | Shared forum modal styles. | — |
| `src/components/Forum/types.ts` | Backend-shaped forum/post/comment interfaces returned by `forumService`. | `ForumType`, `PostType`, `CommentType` |

## Components — Experts, AI, Admin

| File | Responsibility | Exports |
|------|----------------|---------|
| `src/components/ExpertDirectory/ExpertDirectory.tsx` | Public expert list from `ExpertController.getApprovedExpertsForGuest()` (localStorage). | `default ExpertDirectory` |
| `src/components/ExpertDirectory/ExpertDirectory.css` | Styles. | — |
| `src/components/AIChat/AIChat.tsx` | **Simulated** AI chat (keyword-triggered responses, no network). | `default AIChat` |
| `src/components/AIChat/AIChat.css` | Styles. | — |
| `src/components/Admin/AdminLayout.tsx` | Admin shell (sidebar/nav) wrapping admin sub-screens. | `default AdminLayout` |
| `src/components/Admin/AdminDashboard.tsx` | Stats dashboard via `DashboardController` + quick expert actions via `ExpertController`. | `default AdminDashboard` |
| `src/components/Admin/AdminExpertCrud.tsx` | Expert CRUD UI over `ExpertController` (localStorage). | `default AdminExpertCrud` |
| `src/components/Admin/Admin.css` | Admin styles. | — |
