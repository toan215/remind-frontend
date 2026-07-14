# ReMind Frontend — API Reference

## HTTP client

**`src/utils/apiHelper.tsx`** owns the single axios instance.

- `BASE_URL` = `VITE_LOCAL_API_URL` (`http://localhost:4000` in `.env`) or `https://remind-backend-wdv3.onrender.com`.
- `API_BASE_URL` = `${BASE_URL}/api` (from `constants.tsx`).
- **Request interceptor** attaches `Authorization: Bearer <accessToken>` from `localStorage`.
- **Response interceptor** on `401`:
  1. POSTs `refreshToken` to `/auth/refresh`.
  2. Stores new `accessToken`/`refreshToken`/`user` from the response.
  3. Replays the original request; queues concurrent 401s while refreshing.
  4. On failure: clears auth data and redirects to `/login`.
- Public helper object `apiHelper` = `{ get, post, put, patch, delete }`, each returns `response.data`.

## Endpoint registry

**`src/utils/constants.tsx` → `API_ENDPOINTS`**

| Group | Endpoint | Method(s) used |
|-------|----------|----------------|
| `HEALTH` | `GET {BASE_URL}/health` | (defined, unused) |
| `AUTH.REGISTER` | `POST /api/auth/register` | post |
| `AUTH.LOGIN` | `POST /api/auth/login` | post |
| `AUTH.REFRESH` | `POST /api/auth/refresh` | post (interceptor) |
| `AUTH.LOGOUT` | `POST /api/auth/logout` | post |
| `AUTH.GOOGLE` | `POST /api/auth/google` | post |
| `FORUMS.LIST_FORUMS` | `GET /api/forums` | get |
| `FORUMS.SEARCH_POSTS` | `GET /api/forums/search?q=` | get |
| `FORUMS.LIST_POSTS` | `GET /api/forums/posts?limit=&cursor=` | get |
| `FORUMS.CREATE_POST` | `POST /api/forums/posts` | post |
| `FORUMS.POST_DETAIL(id)` | `GET|POST(like)|PUT|DELETE /api/forums/posts/{id}` | get/post/put/delete |
| `FORUMS.CREATE_COMMENT(pid)` | `POST /api/forums/posts/{pid}/comments` | post |
| `FORUMS.UPDATE_COMMENT(cid)` / `DELETE_COMMENT(cid)` | `/api/forums/comments/{cid}` | put/delete |
| `AI.CHAT` | `POST /api/ai/chat` | post (fetch, stream) |
| `CHATS.LIST` | `GET /api/chats` | get |
| `CHATS.ROOM(id)` | `GET /api/chats/{id}` | (defined) |
| `CHATS.MESSAGES(id)` | `GET /api/chats/{id}/messages` | get |
| `ADMIN.*` | `/api/admin/...` (forums, experts, reports) | **defined but unused** |

## Real API callers

### Auth — `controllers/AuthController.ts` (used by `Login.tsx`, `Register.tsx`)

| Method | Endpoint | Request body | Returns |
|--------|----------|--------------|---------|
| `login(email, password)` | `POST /auth/login` | `{ email, password }` | `AuthResponse { user, accessToken, refreshToken }` |
| `register(fullname, email, password, role)` | `POST /auth/register` | `{ fullName, email, password, role: "student"|"expert" }` | `AuthResponse` |
| `googleLogin(googleToken)` | `POST /auth/google` | `{ googleToken }` | `AuthResponse` |
| `logout()` | `POST /auth/logout` | `{ refreshToken }` | `void` (clears local tokens on finish) |

`AuthResponse.user`: `UserDto { id, email, fullName?, role: "student"|"expert"|"admin"|"system_manager", status: "active"|"pending"|"rejected"|"banned" }`.

On success, tokens + user are persisted to `localStorage` (`accessToken`, `refreshToken`, `user`).

### Forum — service layer `services/forumService.ts` (used by `Forum.tsx`, `ForumDetail.tsx`)

Returns backend shapes from `components/Forum/types.ts` (`ForumType`, `PostType`, `CommentType`).

| Function | Endpoint | Params / body | Response shape |
|----------|----------|---------------|----------------|
| `getForums()` | `GET /forums` | — | `{ forums: ForumType[] }` |
| `getPosts(cursor?, limit=10)` | `GET /forums/posts?limit=&cursor=` | query | `{ posts: PostType[]; nextCursor: string|null; hasNext: boolean }` |
| `getPostDetail(postId)` | `GET /forums/posts/{id}` | — | `{ post: PostType; comments: CommentType[] }` |
| `createPost(forumId, title, content, tags[], authorDisplayMode=1)` | `POST /forums/posts` | `{ forumId, title, content, tags, authorDisplayMode }` | `{ post: PostType }` |
| `createComment(postId, content, authorDisplayMode=1)` | `POST /forums/posts/{id}/comments` | `{ content, authorDisplayMode }` | `{ comment: CommentType }` |
| `toggleLike(postId)` | `POST /forums/posts/{id}/like` | — | `{ liked: boolean; likeCount: number }` |
| `searchPosts(query)` | `GET /forums/search?q=` | query | `{ posts: PostType[] }` |

### Forum — controller layer `controllers/ForumController.ts` (used by `CommentSection.tsx`, `CreatePostModal.tsx`, `PostDetail.tsx`)

Wraps `apiHelper` and maps backend → frontend models (`models/ForumPost.ts`). Key methods:

| Method | Endpoint | Request | Returns |
|--------|----------|---------|---------|
| `getDefaultForumId()` | `GET /forums` | — | first forum `_id` (string) |
| `getPosts(limit=10, cursor?)` | `GET /forums/posts?...` | — | `{ posts: ForumPost[]; nextCursor; hasNext }` |
| `getPostById(postId)` | `GET /forums/posts/{id}` | — | `ForumPost | undefined` |
| `getPostDetail(postId)` | `GET /forums/posts/{id}` | — | `{ post: ForumPost; comments: Comment[] } | undefined` |
| `searchPosts(term)` | `GET /forums/search?q=` | — | `ForumPost[]` |
| `createPost(data: CreatePostData)` | `POST /forums/posts` | `{ title, content, tags, authorDisplayMode: isAnonymous?1:0 }` | `ForumPost` |
| `toggleLike(postId)` | `POST /forums/posts/{id}/like` | — | `ForumPost` |
| `deletePost(postId)` | `DELETE /forums/posts/{id}` | — | `void` |
| `getCommentsByPostId(postId)` | `GET /forums/posts/{id}` | — | `Comment[]` |
| `createComment(postId, {content, parentId})` | `POST /forums/posts/{id}/comments` | `{ content, authorDisplayMode: 1, parentId }` | `Comment` |
| `deleteComment(commentId)` | `DELETE /forums/comments/{id}` | — | `void` |

Helpers (no network): `formatTimeAgo(dateStr)`, `validate(data: CreatePostData)` → `Record<string,string>`.

### Backend ↔ frontend field mapping (`ForumController`)

| Frontend (`ForumPost`) | Backend | Notes |
|------------------------|---------|-------|
| `id` | `_id` | |
| `author` | `publicAuthorName` / `author` | fallback "Anonymous" |
| `likes` | `likeCount` / `likes` | |
| `likedBy` | `likedBy[]` | object ids stringified |
| `isAnonymous` | `authorDisplayMode === 1` / `isAnonymous` | |

### AI Chat & Expert Chat Integration

#### AI Chat (`components/AIChat/AIChat.tsx`)
- **Streaming integration:** Calls `fetch` to `${API_BASE_URL}/ai/chat` directly using `POST` method with headers `Content-Type: application/json` and `Authorization: Bearer <accessToken>`.
- **Request payload:** `{ prompt, history }`.
- **Context limit:** History is limited to the last 8 messages (`messages.slice(-8)`) to optimize context size and reduce Time To First Token (TTFT).
- **Streaming response (SSE):** Reads stream using `ReadableStream` reader, decoding chunks of `data: {"text": "..."}` or `data: {"error": "..."}` and updating the bot's response message dynamically until receiving `data: [DONE]`.

#### Expert Chat (`components/Chat/Chat.tsx`)
- **REST APIs:**
  - Loads list of rooms via `GET /api/chats` (`API_ENDPOINTS.CHATS.LIST`) where participants are populated with user details (`fullName`, `avatarUrl`, `role`).
  - Loads past room messages via `GET /api/chats/{id}/messages` (`API_ENDPOINTS.CHATS.MESSAGES`).
- **WebSocket connection:**
  - Connects to backend Socket.io server upon mounting using user's `accessToken` (via `io(BASE_URL, { auth: { token } })`).
  - Joins the current room with event `chat:join` (`{ roomId }`) and leaves the room with `chat:leave` (`{ roomId }`).
  - Sends messages using `chat:message` event (`{ roomId, text, type: "text" }`).
  - Listens to incoming messages on `chat:message` event to append them to the conversation thread and update the room's last message on sidebar.
  - Listens to socket errors via `chat:error` event and displays restriction details (e.g. unpaid appointments, time not reached) via an `errorBanner` component.

## Mocked / no-network layers (gap)

These controllers read/write `localStorage` and **do not call the backend**, even though `API_ENDPOINTS.ADMIN.*` exist:

- **`controllers/ExpertController.ts`** — seed list of 8 experts (`Expert[]`), CRUD, activity log, approval/suspension. Used by `AdminExpertCrud.tsx`, `AdminDashboard.tsx`, `ExpertDirectory.tsx`.
- **`controllers/DashboardController.ts`** — `getStats()` derives dashboard numbers from `ExpertController` + localStorage logs.

## Data shapes

- Frontend forum models: `models/ForumPost.ts` → `ForumPost`, `Comment`, `CreatePostData`, `CreateCommentData`.
- Backend forum models: `components/Forum/types.ts` → `ForumType`, `PostType`, `CommentType`.
- Expert: `models/Expert.ts` → `Expert`, `ExpertFormData`.
- Dashboard: `models/DashboardStats.ts` → `DashboardStats`, `ActivityLog`.
