# Forum API

Simple discussion forum API built with Node.js, Express, and PostgreSQL.

## Environment

- Copy `.env.example` to `.env` and fill values (or set env vars in your host).
- Required env vars:
  - `HOST`, `PORT`
  - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
  - `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `ACCESS_TOKEN_AGE`

## Start

Development:

```bash
npm run start:dev
```

Production:

```bash
npm start
```

## Database migrations

This project uses `node-pg-migrate`.

Run migrations (use `.test.env` for test DB):

```bash
npx node-pg-migrate up --envPath .env
```

## Health

- GET `/health` — returns `{"status":"ok"}`

## Routes overview

**Users**

- POST `/users` (create user)
  - Auth: no
  - Body: `{ "username", "password", "fullname" }`
  - Response: `201` added user

**Authentications**

- POST `/authentications` (login)
  - Auth: no
  - Body: `{ "username", "password" }`
  - Response: `201` with `accessToken` and `refreshToken`
- PUT `/authentications` (refresh access token)
  - Body: `{ "refreshToken" }`
  - Response: `200` new `accessToken`
- DELETE `/authentications` (logout)
  - Body: `{ "refreshToken" }`
  - Response: `200`

**Threads**

- POST `/threads` (create thread)
  - Auth: Bearer token
  - Body: `{ "title", "body" }`
  - Response: `201` added thread
- GET `/threads/:threadId` (thread detail)
  - Auth: optional
  - Response: thread detail with `comments`, each comment includes `replies` and `likeCount`

**Comments**

- POST `/threads/:threadId/comments` (add comment)
  - Auth: Bearer token
  - Body: `{ "content" }`
  - Response: `201` added comment
- DELETE `/threads/:threadId/comments/:commentId` (delete comment)
  - Auth: Bearer token (only owner)
  - Response: `200`
- PUT `/threads/:threadId/comments/:commentId/likes` (toggle like/unlike)
  - Auth: Bearer token
  - Response: `200` success

**Replies**

- POST `/threads/:threadId/comments/:commentId/replies` (add reply)
  - Auth: Bearer token
  - Body: `{ "content" }`
  - Response: `201` added reply
- DELETE `/threads/:threadId/comments/:commentId/replies/:replyId` (delete reply)
  - Auth: Bearer token (only owner)
  - Response: `200`

## Notes

- Routes under `/threads` are rate-limited in the server; adjust `src/Infrastructures/http/createServer.js` if needed.
- `GET /threads/:threadId` returns comments where deleted comments have `content: "**komentar telah dihapus**"` and include `likeCount` (number).
- Keep `.env` secret and use `.env.example` as a template.

## Quick curl example

Create a user and login:

```bash
curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' -d '{"username":"alice","password":"secret","fullname":"Alice"}'

curl -X POST http://localhost:3000/authentications -H 'Content-Type: application/json' -d '{"username":"alice","password":"secret"}'
```

Create thread (use returned access token):

```bash
curl -X POST http://localhost:3000/threads -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{"title":"Hello","body":"World"}'
```

If you want, I can add OpenAPI spec or Postman collection notes into this README.
