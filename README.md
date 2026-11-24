# Eternal Feed

> A lightweight social feed for sharing posts and discussing them through comments.

[![Backend CI](https://github.com/marlef03/eternal_feed/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/marlef03/eternal_feed/actions/workflows/backend-ci.yml)

Eternal Feed is a responsive web application for desktop and mobile devices. Users can create accounts, publish posts, browse a continuously updated feed and discuss publications in comment threads.

## Features

- **User accounts** — registration, profile lookup and account-related endpoints.
- **Authentication** — short-lived JWT access tokens and refresh sessions persisted in PostgreSQL.
- **Refresh-token rotation** — refresh tokens are rotated when renewed; only their hashes are stored in the database.
- **Secure refresh cookie** — the refresh token is issued as an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- **Posts** — create, read and delete publications.
- **Comments** — add, retrieve and delete comments associated with posts.
- **Feed pagination** — timestamp + ID cursors provide stable navigation when multiple records share the same timestamp.
- **Incremental updates** — endpoint for checking how many newer posts appeared after a cursor.
- **Database migrations** — schema changes are managed by Alembic.
- **Containerized deployment** — Docker Compose starts PostgreSQL, runs migrations, then starts the API and frontend.

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | Python 3.13, FastAPI, Pydantic |
| Database | PostgreSQL, SQLAlchemy 2.x (async), asyncpg |
| Migrations | Alembic |
| Authentication | JWT, `pwdlib` / Argon2, opaque refresh tokens |
| Frontend | React + TypeScript |
| Infrastructure | Docker, Docker Compose, Nginx |
| Quality | pytest, Ruff, mypy |

## Architecture

```text
Browser (desktop / mobile)
          |
          v
      Nginx :80
       /     \
      v       v
  Frontend   /api/*
                |
                v
           FastAPI :8000
                |
                v
          PostgreSQL :5432

Startup dependency:
PostgreSQL healthy -> Alembic migrator -> Backend healthy -> Frontend
```

The backend is organized by domain modules (`auth`, `users`, `posts`, `comments`). API routers delegate work to services, while services use repositories and an async SQLAlchemy session. The refresh-session records are stored separately from users and reference their owner.

## Quick start (Docker Compose)

### Requirements

- Docker Engine
- Docker Compose v2
- Git

### 1. Clone the repository

```bash
git clone https://github.com/marlef03/eternal_feed.git
cd eternal_feed
```

### 2. Configure environment variables

Copy the example file:

```bash
cp example.env .env
```

Edit `.env`:

```dotenv
DB_USER=eternal_feed
DB_PASSWORD=replace_with_a_long_random_password
DB_NAME=eternal_feed
DB_PORT=5432

# Generate a unique secret, for example:
# python -c "import secrets; print(secrets.token_urlsafe(48))"
JWT_SECRET_KEY=replace_with_a_long_random_secret
```

### 3. Build and start

```bash
docker compose up --build -d
```

Compose starts PostgreSQL and waits for its healthcheck. The `migrator` service applies all Alembic migrations. The API starts after PostgreSQL is healthy, and the frontend waits for the API healthcheck.

Open:

- **Application:** http://localhost
- **Swagger UI:** http://localhost/api/docs
- **ReDoc:** http://localhost/api/redoc

## Development mode

The repository also includes `docker-compose.dev.yaml`, which exposes the API on port `8000` and the Vite development server on port `5173`.

```bash
cp example.env .env
docker compose -f docker-compose.dev.yaml up --build
```

Open:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/api/docs

The development Compose file mounts the backend and frontend source directories into their containers, enabling hot reload. Use a separate database volume for development if you also run the production Compose stack.

## API overview

The API is versioned under `/api/v1`.

| Area | Endpoint | Purpose |
|---|---|---|
| Users | `POST /users` | Register a user |
| Users | `GET /users/me` | Get the authenticated user |
| Users | `GET /users/{user_id}` | Get a public user profile |
| Users | `GET /users/exists` | Check username/email availability |
| Users | `DELETE /users/{user_id}` | Delete a user (current user only) |
| Auth | `POST /auth/login/email` | Login using email and password |
| Auth | `POST /auth/login/username` | Login using username and password |
| Auth | `POST /auth/token` | OAuth2 password-form login (Swagger Authorize) |
| Auth | `POST /auth/refresh` | Rotate refresh session and issue a new access token |
| Auth | `POST /auth/logout` | Revoke the current refresh session |
| Posts | `POST /posts` | Create a post |
| Posts | `GET /posts` | Fetch feed posts using cursor parameters |
| Posts | `GET /posts/new-count` | Count posts newer than a cursor |
| Posts | `GET /posts/{post_id}` | Get a post with its author |
| Posts | `DELETE /posts/{post_id}` | Delete a post (owner only) |
| Comments | `POST /posts/{post_id}/comments` | Add a comment |
| Comments | `GET /posts/{post_id}/comments` | Fetch comments using cursor parameters |
| Comments | `GET /comments/{comment_id}` | Get a comment |
| Comments | `DELETE /comments/{comment_id}` | Delete a comment (owner only) |

### Authentication flow

1. A client submits credentials to one of the login endpoints.
2. The API returns a short-lived JWT access token in the response body.
3. The refresh token is set in an `HttpOnly` cookie, so browser JavaScript cannot read it.
4. When the access token expires, the client calls `/auth/refresh`. The API validates and revokes the previous refresh session, creates a replacement and returns a new access token.
5. `/auth/logout` revokes the refresh session and clears the cookie.

Refresh tokens are random opaque values. The database stores their SHA-256 hashes rather than the raw token. Access tokens are sent in the `Authorization: Bearer <token>` header.

## Running backend tests

The backend test suite uses a dedicated PostgreSQL database. Do not point `TEST_DATABASE_URL` at a database containing data you need.

From the repository root:

```bash
cd backend
uv sync --group dev
```

Set the test database URL (the database must already exist):

```bash
export TEST_DATABASE_URL='postgresql+asyncpg://test_user:test_password@localhost:5432/eternal_feed_test'
```

Run tests:

```bash
uv run pytest -q
```

The test fixtures create the schema in the dedicated test database and drop it after the test session. Tests use an isolated HTTP client and override the application's database dependency.
