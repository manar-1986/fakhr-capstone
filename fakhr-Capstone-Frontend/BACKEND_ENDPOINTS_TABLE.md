# Backend API Endpoints Table

## Health Check

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/health` | `/health` | Server health check | No | None | ✅ Implemented |

## Authentication (`/api/auth`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| POST | `/api/auth/register` | `/api/auth/register` | Register a new user | No | None | ✅ Implemented |
| POST | `/api/auth/login` | `/api/auth/login` | Login user and get token | No | None | ✅ Implemented |
| POST | `/api/auth/logout` | `/api/auth/logout` | Logout user (invalidate token) | Yes | None | ✅ Implemented |
| POST | `/api/auth/forgot-password` | `/api/auth/forgot-password` | Request password reset email | No | None | ✅ Implemented |
| POST | `/api/auth/reset-password` | `/api/auth/reset-password` | Reset password with token | No | None | ✅ Implemented |

## Users (`/api/users`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/users/me` | `/api/users/me` | Get current authenticated user profile | Yes | None | ✅ Implemented |
| GET | `/api/users` | `/api/users` | Get all users | Yes | None | ✅ Implemented |
| GET | `/api/users/:userId` | `/api/users/:userId` | Get user by ID | Yes | None | ✅ Implemented |
| PUT | `/api/users/:userId` | `/api/users/:userId` | Update user profile | Yes | None | ✅ Implemented |
| DELETE | `/api/users/:userId` | `/api/users/:userId` | Delete user account | Yes | None | ✅ Implemented |

## Children (`/api/children`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/children` | `/api/children` | Get all children for authenticated user | Yes | None | ✅ Implemented |
| GET | `/api/children/:childId` | `/api/children/:childId` | Get child by ID (only if belongs to user) | Yes | None | ✅ Implemented |
| POST | `/api/children` | `/api/children` | Create a new child (assigned to authenticated user) | Yes | None | ✅ Implemented |
| PUT | `/api/children/:childId` | `/api/children/:childId` | Update child (only if belongs to user) | Yes | None | ✅ Implemented |

## Community (`/api/community`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/community/posts` | `/api/community/posts` | Get all community posts | Yes | Parent | ✅ Implemented |
| POST | `/api/community/posts` | `/api/community/posts` | Create a new community post | Yes | Parent | ✅ Implemented |
| POST | `/api/community/posts/:postId/report` | `/api/community/posts/:postId/report` | Report a harmful post | Yes | Parent | ✅ Implemented |
| GET | `/api/community/events` | `/api/community/events` | Get all community events | Yes | Parent | ❌ Not Implemented |

## Care Path (`/api/care-path`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/care-path/weekly-plan` | `/api/care-path/weekly-plan` | Get weekly care plan | Yes | None | ❌ Not Registered |
| GET | `/api/care-path/tasks/:taskId` | `/api/care-path/tasks/:taskId` | Get task details by ID | Yes | None | ❌ Not Registered |
| GET | `/api/care-path/progress` | `/api/care-path/progress` | Get care path progress | Yes | None | ❌ Not Registered |
| POST | `/api/care-path/check-in` | `/api/care-path/check-in` | Submit a check-in | Yes | None | ❌ Not Registered |
| POST | `/api/care-path/generate` | `/api/care-path/generate` | Generate a new care path | Yes | None | ❌ Not Registered |
| GET | `/api/care-path/children` | `/api/care-path/children` | Get children (care-path endpoint) | Yes | None | ❌ Not Registered |

## Directory (`/api/directory`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/directory/centers` | `/api/directory/centers` | Get health centers (with filters) | Yes | None | ❌ Not Implemented |
| GET | `/api/directory/centers/:centerId` | `/api/directory/centers/:centerId` | Get center details by ID | Yes | None | ❌ Not Implemented |
| GET | `/api/directory/centers/cities` | `/api/directory/centers/cities` | Get list of available cities | Yes | None | ❌ Not Implemented |
| GET | `/api/directory/centers/specialties` | `/api/directory/centers/specialties` | Get list of center specialties | Yes | None | ❌ Not Implemented |
| GET | `/api/directory/professionals` | `/api/directory/professionals` | Get professionals (with filters) | Yes | None | ✅ Implemented |
| GET | `/api/directory/professionals/:professionalId` | `/api/directory/professionals/:professionalId` | Get professional details by ID | Yes | None | ✅ Implemented |
| GET | `/api/directory/professionals/specialties/list` | `/api/directory/professionals/specialties/list` | Get list of professional specialties | Yes | None | ✅ Implemented |
| GET | `/api/directory/professionals/tags/list` | `/api/directory/professionals/tags/list` | Get list of professional tags | Yes | None | ❌ Not Implemented |

## Services (`/api/services`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/services` | `/api/services` | Get all services | Yes | None | ✅ Implemented |
| GET | `/api/services/:serviceId` | `/api/services/:serviceId` | Get service by ID | Yes | None | ✅ Implemented |

## Content (`/api/content`)

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/api/content/resources` | `/api/content/resources` | Get all content resources | Yes | None | ❌ Not Implemented |
| GET | `/api/content/:contentId` | `/api/content/:contentId` | Get content details by ID | Yes | None | ❌ Not Implemented |

## File Uploads

| Method | Endpoint | Full URL | Description | Auth Required | Authorization | Status |
|--------|----------|----------|-------------|---------------|---------------|--------|
| GET | `/uploads/*` | `/uploads/*` | Serve uploaded files | No | None | ✅ Implemented |

---

## Legend

- ✅ **Implemented**: Endpoint exists in backend routes and is registered in app.ts
- ❌ **Not Implemented**: Endpoint is not implemented in backend
- ❌ **Not Registered**: Route file exists but not registered in app.ts
- **Auth Required**: Yes = Requires Bearer token, No = Public endpoint
- **Authorization**: Role-based access (Parent, Professional, Admin, etc.)

## Notes

1. **Services endpoints** are fully implemented and working ✅
2. **Directory professionals endpoints** are fully implemented and working ✅
3. **Directory centers endpoints** are NOT implemented - need to add to directory.controller.ts and directory.routes.ts
4. **Care-path routes** exist but are NOT registered in app.ts - need to add `app.use("/api/care-path", carePathRoutes)`
5. **Content endpoints** are NOT implemented - need to create content module
6. **Community events endpoint** is NOT implemented
7. **Directory professionals/tags/list** endpoint is NOT implemented
8. The `/api/care-path/children` endpoint seems redundant with `/api/children` - consider consolidating
9. Base URL: `http://localhost:8000` (or configured via `EXPO_PUBLIC_API_URL`)
