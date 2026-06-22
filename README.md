# Authentication System (Node.js + Express)

A backend authentication system built with Node.js and Express, focused on secure session management, token lifecycle control, and maintainable API architecture.

---

## Overview

This project implements a complete authentication workflow with access and refresh token management, session revocation, role-based authorization, audit logging, and cookie-based authentication.

The system is designed around common patterns used in production applications, including refresh token rotation, server-side session control, layered architecture, and containerized deployment.

---

## Tech Stack

* Node.js
* Express
* MySQL
* JWT (Access and Refresh Tokens)
* Argon2
* HTTP-only Cookies
* Zod
* Helmet
* CORS
* Express Rate Limit
* Jest
* Supertest
* Docker
* Docker Compose

---

## Architecture

```
Browser / API Client
         |
         v
+------------------+
|   Express API    |
+------------------+
         |
         v
+------------------+
|      MySQL       |
+------------------+
```

Containerized deployment:

```
Docker Compose
│
├── api
│   └── Node.js + Express
│
└── mysql
    └── MySQL 8
```

---

## Key Design Decisions

### 1. Internal vs External User IDs

The database uses auto-increment integer IDs internally while exposing UUIDs through the API.

```
users
├── id     (INT)
└── uuid   (CHAR36)
```

API consumers never interact with internal database IDs.

**Rationale**

* Prevents user enumeration
* Decouples database structure from API contracts
* Allows internal schema changes without affecting clients

---

### 2. Access and Refresh Tokens

The authentication flow uses short-lived access tokens and long-lived refresh tokens.

```
Access Token
├── Short-lived
└── Used for API authorization

Refresh Token
├── Long-lived
└── Used to obtain new access tokens
```

**Rationale**

* Reduces the impact of token compromise
* Allows controlled session renewal
* Improves overall session security

---

### 3. Refresh Token Persistence

Refresh tokens are stored and managed server-side.

**Rationale**

* Supports token revocation
* Enables logout functionality
* Provides visibility into active sessions
* Allows compromised sessions to be invalidated

---

### 4. Cookie-Based Authentication

Authentication tokens are delivered using HTTP-only cookies.

```
Client ---> Login Request

Server ---> Set-Cookie: accessToken
         ---> Set-Cookie: refreshToken
```

Cookies are automatically attached to subsequent requests.

**Rationale**

* Reduces exposure to client-side JavaScript
* Simplifies browser authentication flows
* Improves session security

---

### 5. Authentication Logging

Authentication-related actions are recorded.

Logged events include:

* Successful logins
* Failed login attempts
* Token refreshes
* Logout actions
* Token revocations

**Rationale**

* Improves observability
* Supports auditing
* Assists troubleshooting and incident investigation

---

### 6. Layered Architecture

The application follows a layered architecture pattern.

```
Routes
   |
Controllers
   |
Services
   |
Repositories
   |
Database
```

Responsibilities:

* Routes: routing and middleware composition
* Controllers: request handling
* Services: business logic
* Repositories: database operations
* Utilities: shared helpers and infrastructure concerns

**Rationale**

* Separation of concerns
* Easier testing
* Improved maintainability
* Reduced coupling between layers

---

## Features

* User registration
* User authentication
* Protected routes
* Refresh token rotation
* Session revocation
* User deletion
* Role-based access control (RBAC)
* Authentication audit logging
* Rate limiting
* Secure HTTP headers
* Cookie-based authentication
* Dockerized deployment
* Interactive authentication testing UI

---

## Docker Support

The application can be started entirely through Docker Compose.

Services:

```
docker-compose.yml

├── api
│   └── Node.js + Express Application
│
└── mysql
    └── MySQL 8 Database
```

The API service waits for the database health check before startup.

Database persistence is provided through a named Docker volume:

```
mysql_data
```

This ensures data remains available across container restarts and rebuilds.

---

## Interactive Testing UI

The repository includes a lightweight frontend interface built with:

* HTML
* CSS
* JavaScript

The UI mirrors the authentication workflow and provides a simple way to explore the system without manually crafting requests.

---

## Testing

Testing is implemented using Jest and Supertest.

Coverage includes:

* User registration
* User login
* Cookie handling
* Protected route authorization
* Refresh token rotation
* Logout flow
* Session invalidation

---

## Getting Started

### Clone Repository

```
git clone https://github.com/DevAbdul001/auth-sys
cd auth-sys
```

---

### Environment Variables

```
PORT=

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

---

### Run with Docker

Build and start all services:

```
docker compose up --build
```

Start services:

```
docker compose up
```

Stop services:

```
docker compose down
```

---

### Run Without Docker

Install dependencies:

```
npm install
```

Start the application:

```
node server.js
```

---

### Run Tests

```
npm test
```

---

## API Endpoints

| Method | Route                                   | Description           |
| ------ | --------------------------------------- | --------------------- |
| POST   | /api/auth/signup                        | Register user         |
| POST   | /api/auth/signin                        | Authenticate user     |
| GET    | /api/auth/me                            | Retrieve current user |
| POST   | /api/auth/refresh-token                 | Refresh access token  |
| PATCH  | /api/auth/refresh-token/revoke/:user_id | Revoke sessions       |
| POST   | /api/auth/signout                       | Logout user           |
| DELETE | /api/auth/delete                        | Delete user           |

---

## Tradeoffs and Limitations

* Single MySQL instance
* No distributed cache layer
* Basic RBAC implementation
* Session storage is database-backed
* Not optimized for high-volume horizontal scaling

---

## Future Improvements

* Redis-backed session storage
* OAuth integration
* Email verification workflow
* Multi-device session management
* Advanced audit reporting

---

## What This Project Demonstrates

* Authentication system design
* Token lifecycle management
* Refresh token rotation
* Session revocation strategies
* Cookie-based authentication
* Role-based access control
* Layered backend architecture
* Secure API design patterns
* Automated testing
* Docker containerization
* MySQL persistence and initialization

---

## License

MIT
