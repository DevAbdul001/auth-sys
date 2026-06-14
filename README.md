
---

# Authentication System (Node.js + Express)

A backend authentication system built with Node.js and Express, focused on secure session management, token lifecycle control and maintainable API architecture.

---

## Overview

This project implements a complete authentication flow:

* User registration and login
* Access and refresh token handling
* Refresh token rotation and revocation
* Role-based access control (RBAC)
* Authentication event logging
* Cookie-based session management

The primary goal is to model how production authentication systems handle identity, sessions and security boundaries beyond basic JWT login implementations.

---

## Tech Stack

* Node.js + Express
* MySQL
* JWT (access + refresh tokens)
* Argon2 (password hashing)
* HTTP-only cookies
* Zod (validation)
* Helmet, CORS, rate limiting

---

## Key Design Decisions

### 1. Internal vs External User IDs

The database uses auto-increment integer IDs internally, while UUIDs are exposed externally via the API.

```
users:
  id (INT PRIMARY KEY)
  uuid (CHAR36, public identifier)
```

API responses expose only UUIDs.

**Rationale:**

* Prevents user enumeration
* Decouples API contracts from database structure

---

### 2. Access and Refresh Tokens

* Access tokens: short-lived (e.g. 15 minutes)
* Refresh tokens: long-lived (e.g. days), stored and managed

**Rationale:**

* Limits exposure window for compromised tokens
* Enables controlled session renewal

---

### 3. Token Persistence Strategy

Refresh tokens are stored server-side instead of relying on fully stateless JWT sessions.

**Rationale:**

* Enables logout and revocation
* Allows invalidation of compromised sessions
* Provides visibility into active sessions

---

### 4. Cookie-Based Authentication

Tokens are delivered via HTTP-only cookies.

```
Client → Server: login request
Server → Client:
  Set-Cookie: accessToken
  Set-Cookie: refreshToken
```

Cookies are automatically attached on subsequent requests.

**Rationale:**

* Reduces XSS token exposure risk
* Simplifies browser-based session handling

---

### 5. Authentication Logging

Authentication events are logged, including:

* Successful logins
* Failed login attempts
* Token refresh events
* Logout actions
* Token revocation events

**Rationale:**

* Improves observability
* Supports security auditing and anomaly detection

---

### 6. Layered Architecture

The system follows a layered structure:

```
Routes → Controllers → Services → Repositories → Utils
```

* Routes: request validation and routing
* Controllers: request handling and response formatting
* Services: business logic (auth flows, token logic)
* Repositories: database access layer
* Utils: helpers (JWT, hashing, logging)

**Rationale:**

* Separation of concerns
* Easier testing and maintainability
* Clear boundaries between business logic and infrastructure

---

## Features

* User signup and signin
* Protected routes (/me)
* Refresh token rotation
* Logout with session invalidation
* User deletion
* Rate limiting
* Secure HTTP headers

---

## Testing

Implemented using Jest and Supertest.

Coverage includes:

* Signup → login → access flow
* Cookie-based session persistence
* Protected route authorization
* Token refresh flow
* Logout and invalidation

---

## Getting Started

### Clone repository

```
git clone https://github.com/DevAbdul001/auth-sys
cd auth-sys
```

### Install dependencies

```
npm install
```

### Environment variables

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_REFRESH_SECRET=

JWT_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

COOKIE_SECRET=
CORS_ORIGINS=
```

### Run application

```
node server.js
```

### Run tests

```bash
npm test
```

---

## API Endpoints

| Method | Route                                   | Description          |
| ------ | --------------------------------------- | -------------------- |
| POST   | /api/auth/signup                        | Register user        |
| POST   | /api/auth/signin                        | Login user           |
| GET    | /api/auth/me                            | Get current user     |
| POST   | /api/auth/refresh-token                 | Refresh access token |
| PATCH  | /api/auth/refresh-token/revoke/:user_id | Revoke sessions      |
| POST   | /api/auth/signout                       | Logout user          |
| DELETE | /api/auth/delete                        | Delete user          |

---

## Tradeoffs and Limitations

* Single database instance (no horizontal scaling)
* No distributed cache layer (e.g. Redis)
* Basic RBAC implementation
* Token revocation not optimized for high-scale systems

---

## Future Improvements

* Redis-based session storage
* OAuth (Google, GitHub) integration
* Email verification flow
* Multi-device session tracking
* Improved audit logging and analytics

---

## What This Project Demonstrates

* Authentication system design beyond basic JWT login
* Session lifecycle management
* Secure API design patterns
* Separation of concerns in backend architecture
* Practical understanding of token-based authentication systems

---

## License

MIT

---
