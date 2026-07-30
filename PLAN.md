# Forum API — Implementation Plan

## Stack & Architecture

- **Runtime**: Node.js (ESM)
- **Framework**: Express v5
- **DB**: PostgreSQL via `pg`
- **Migration**: node-pg-migrate
- **Testing**: Vitest + supertest
- **Auth**: JWT (already implemented)
- **Architecture**: Clean Architecture (4 layers)

```
src/
├── Domains/          → Entities + abstract Repositories
├── Applications/     → Use Cases
├── Infrastructures/  → DB pool, concrete Repositories, HTTP server, container
└── Interfaces/       → HTTP handlers + routes
```

**Already done**: Users, Authentications (register, login, logout, refresh token)

---

## Database Schema (new tables)

### Migration order

```
migrations/
  ...existing...
  XXXXX_create-table-threads.js
  XXXXX_create-table-comments.js
  XXXXX_create-table-replies.js   ← optional
```

### threads
| column    | type        | constraint       |
|-----------|-------------|------------------|
| id        | VARCHAR(50) | PK               |
| title     | TEXT        | NOT NULL         |
| body      | TEXT        | NOT NULL         |
| owner     | VARCHAR(50) | FK → users.id    |
| date      | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### comments
| column    | type        | constraint       |
|-----------|-------------|------------------|
| id        | VARCHAR(50) | PK               |
| thread_id | VARCHAR(50) | FK → threads.id  |
| owner     | VARCHAR(50) | FK → users.id    |
| content   | TEXT        | NOT NULL         |
| is_delete | BOOLEAN     | NOT NULL DEFAULT FALSE |
| date      | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### replies (optional)
| column     | type        | constraint        |
|------------|-------------|-------------------|
| id         | VARCHAR(50) | PK                |
| comment_id | VARCHAR(50) | FK → comments.id  |
| owner      | VARCHAR(50) | FK → users.id     |
| content    | TEXT        | NOT NULL          |
| is_delete  | BOOLEAN     | NOT NULL DEFAULT FALSE |
| date       | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

---

## Implementation Workflow

Work feature-by-feature. Each feature = Domain → Application → Infrastructure → Interface → Tests.

---

## Phase 1 — Add Thread (Kriteria 1)

### 1.1 Domain Layer

**`src/Domains/threads/entities/NewThread.js`**
- Class `NewThread` — validates `title`, `body`, `owner`
- Throw `InvariantError` if missing

**`src/Domains/threads/entities/AddedThread.js`**
- Class `AddedThread` — holds `id`, `title`, `owner`
- Throw `InvariantError` if missing

**`src/Domains/threads/ThreadRepository.js`**
- Abstract class with method: `addThread(newThread)`
- Throws `Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')`

### 1.2 Application Layer

**`src/Applications/use_case/AddThreadUseCase.js`**
- Depends on: `threadRepository`
- Flow: validate payload → create `NewThread` entity → call `threadRepository.addThread()` → return `AddedThread`

### 1.3 Infrastructure Layer

**Migration**: `XXXXX_create-table-threads.js`

**`src/Infrastructures/repository/ThreadRepositoryPostgres.js`**
- Implements `ThreadRepository`
- `addThread(newThread)`: INSERT → return `AddedThread`
- Uses `nanoid` for ID generation (prefix: `thread-`)

**Register in `src/Infrastructures/container.js`**:
- `ThreadRepository` → `ThreadRepositoryPostgres`
- `AddThreadUseCase`

### 1.4 Interface Layer

**`src/Interfaces/http/api/threads/`**
- `handler.js` — `postThreadHandler`: extract userId from JWT, call use case
- `routes.js` — `POST /threads` with auth middleware
- `index.js` — Express router plugin export

**Register plugin in `src/Infrastructures/http/createServer.js`**

> Auth middleware must return `{ message: 'Missing authentication' }` on 401 — Postman checks exact string.

### 1.5 Tests

| File | Type | What |
|------|------|------|
| `Domains/threads/entities/_test/NewThread.test.js` | Unit | Validation cases |
| `Domains/threads/entities/_test/AddedThread.test.js` | Unit | Validation cases |
| `Domains/threads/_test/ThreadRepository.test.js` | Unit | Abstract method throws |
| `Applications/use_case/_test/AddThreadUseCase.test.js` | Unit | Mock repo, test flow |
| `Infrastructures/repository/_test/ThreadRepositoryPostgres.test.js` | Integration | Real DB |

---

## Phase 2 — Add Comment (Kriteria 2)

### 2.1 Domain Layer

**`src/Domains/comments/entities/NewComment.js`**
- Validates `content`, `threadId`, `owner`

**`src/Domains/comments/entities/AddedComment.js`**
- Holds `id`, `content`, `owner`

**`src/Domains/comments/CommentRepository.js`**
- Abstract: `addComment(newComment)`

### 2.2 Application Layer

**`src/Applications/use_case/AddCommentUseCase.js`**
- Depends on: `commentRepository`, `threadRepository`
- Flow: verify thread exists → create `NewComment` → `commentRepository.addComment()` → return `AddedComment`
- `threadRepository` needs method `verifyThreadExists(threadId)` → 404 if not found

### 2.3 Infrastructure Layer

**Migration**: `XXXXX_create-table-comments.js`

**`src/Infrastructures/repository/CommentRepositoryPostgres.js`**
- `addComment(newComment)`: INSERT → return `AddedComment`
- ID prefix: `comment-`

**Add to `ThreadRepositoryPostgres`**: `verifyThreadExists(threadId)` — SELECT → throw `NotFoundError` if 0 rows

**Register** `CommentRepository`, `CommentRepositoryPostgres`, `AddCommentUseCase` in container

### 2.4 Interface Layer

**`src/Interfaces/http/api/threads/`** — extend routes:
- `POST /threads/{threadId}/comments` with auth

### 2.5 Tests

| File | Type |
|------|------|
| `Domains/comments/entities/_test/NewComment.test.js` | Unit |
| `Domains/comments/entities/_test/AddedComment.test.js` | Unit |
| `Applications/use_case/_test/AddCommentUseCase.test.js` | Unit |
| `Infrastructures/repository/_test/CommentRepositoryPostgres.test.js` | Integration |

---

## Phase 3 — Delete Comment (Kriteria 3)

### 3.1 Domain Layer

**Add to `CommentRepository`**:
- `deleteComment(commentId)` — soft delete (`is_delete = true`)
- `verifyCommentOwner(commentId, owner)` — throw `AuthorizationError` if not owner
- `verifyCommentExists(commentId)` — throw `NotFoundError` if not found

### 3.2 Application Layer

**`src/Applications/use_case/DeleteCommentUseCase.js`**
- Depends on: `commentRepository`, `threadRepository`
- Flow: `verifyThreadExists` → `verifyCommentExists` → `verifyCommentOwner` → `deleteComment`

### 3.3 Infrastructure Layer

**Add to `CommentRepositoryPostgres`**:
- `deleteComment(commentId)`: `UPDATE comments SET is_delete=true WHERE id=$1`
- `verifyCommentOwner(commentId, owner)`: SELECT owner → compare → `AuthorizationError` if mismatch
- `verifyCommentExists(commentId)`: SELECT → `NotFoundError` if 0 rows

**Register** `DeleteCommentUseCase` in container

### 3.4 Interface Layer

Routes extension: `DELETE /threads/{threadId}/comments/{commentId}` with auth

### 3.5 Tests

| File | Type |
|------|------|
| `Applications/use_case/_test/DeleteCommentUseCase.test.js` | Unit |
| `Infrastructures/repository/_test/CommentRepositoryPostgres.test.js` | Integration (extend) |

---

## Phase 4 — Get Thread Detail (Kriteria 4)

### 4.1 Domain Layer

**`src/Domains/threads/entities/ThreadDetail.js`**
- Holds `id`, `title`, `body`, `date`, `username`, `comments[]`

**`src/Domains/comments/entities/CommentDetail.js`**
- Holds `id`, `username`, `date`, `content`
- If `is_delete=true` → content = `**komentar telah dihapus**`

**Add to `ThreadRepository`**: `getThreadById(threadId)` → `ThreadDetail` or `NotFoundError`

**Add to `CommentRepository`**: `getCommentsByThreadId(threadId)` → `CommentDetail[]` sorted ASC by date

### 4.2 Application Layer

**`src/Applications/use_case/GetThreadDetailUseCase.js`**
- Depends on: `threadRepository`, `commentRepository`
- Flow: `getThreadById` → `getCommentsByThreadId` → merge → return

### 4.3 Infrastructure Layer

**Add to `ThreadRepositoryPostgres`**:
```sql
SELECT t.id, t.title, t.body, t.date, u.username
FROM threads t
JOIN users u ON t.owner = u.id
WHERE t.id = $1
```

**Add to `CommentRepositoryPostgres`**:
```sql
SELECT c.id, u.username, c.date, c.content, c.is_delete
FROM comments c
JOIN users u ON c.owner = u.id
WHERE c.thread_id = $1
ORDER BY c.date ASC
```

**Register** `GetThreadDetailUseCase` in container

### 4.4 Interface Layer

Route: `GET /threads/{threadId}` — **no auth required**

### 4.5 Tests

| File | Type |
|------|------|
| `Domains/threads/entities/_test/ThreadDetail.test.js` | Unit |
| `Domains/comments/entities/_test/CommentDetail.test.js` | Unit |
| `Applications/use_case/_test/GetThreadDetailUseCase.test.js` | Unit |
| `Infrastructures/http/_test/createServer.test.js` | Integration (extend) |

---

## Phase 5 — Replies (Kriteria Opsional)

### 5.1 Domain Layer

**`src/Domains/replies/entities/NewReply.js`** — validates `content`, `commentId`, `threadId`, `owner`

**`src/Domains/replies/entities/AddedReply.js`** — holds `id`, `content`, `owner`

**`src/Domains/replies/entities/ReplyDetail.js`** — holds `id`, `username`, `date`, `content` (soft-delete aware: `**balasan telah dihapus**`)

**`src/Domains/replies/ReplyRepository.js`** — abstract:
- `addReply(newReply)`
- `deleteReply(replyId)`
- `verifyReplyOwner(replyId, owner)`
- `verifyReplyExists(replyId)`
- `getRepliesByCommentId(commentId)`

### 5.2 Application Layer

**`src/Applications/use_case/AddReplyUseCase.js`**
- Verify thread + comment exist → add reply

**`src/Applications/use_case/DeleteReplyUseCase.js`**
- Verify thread → comment → reply exists → verify owner → soft delete

**Extend `GetThreadDetailUseCase`**:
- Also call `replyRepository.getRepliesByCommentId(commentId)` per comment
- Merge replies into each comment's `replies[]` sorted ASC
- **CRITICAL**: `replies` field must always be present on every comment, even `[]` when none exist
- Postman test explicitly: `pm.expect(comment2.replies).to.have.length(0)`

### 5.3 Infrastructure Layer

**Migration**: `XXXXX_create-table-replies.js`

**`src/Infrastructures/repository/ReplyRepositoryPostgres.js`**
- ID prefix: `reply-`
- `getRepliesByCommentId`:
  ```sql
  SELECT r.id, u.username, r.date, r.content, r.is_delete
  FROM replies r
  JOIN users u ON r.owner = u.id
  WHERE r.comment_id = $1
  ORDER BY r.date ASC
  ```

**Register** all reply components in container

### 5.4 Interface Layer

- `POST /threads/{threadId}/comments/{commentId}/replies` — auth required
- `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` — auth required

### 5.6 Postman Prereq Note

Replies test setup creates **2 comments** (not 1):
- `commentId` = first comment (will get 2 replies)
- second comment = zero replies → must return `replies: []`

Both use `accessToken` (user Dicoding as owner).

### 5.5 Tests

| File | Type |
|------|------|
| `Domains/replies/entities/_test/*.test.js` | Unit |
| `Domains/replies/_test/ReplyRepository.test.js` | Unit |
| `Applications/use_case/_test/AddReplyUseCase.test.js` | Unit |
| `Applications/use_case/_test/DeleteReplyUseCase.test.js` | Unit |
| `Infrastructures/repository/_test/ReplyRepositoryPostgres.test.js` | Integration |

---

## Phase 6 — DomainErrorTranslator & Error Handling

Extend `src/Commons/exceptions/DomainErrorTranslator.js` to map:
- Thread/Comment/Reply domain errors → user-friendly messages

Ensure HTTP layer maps:
- `NotFoundError` → 404
- `AuthorizationError` → 403
- `InvariantError` → 400
- `AuthenticationError` → 401

---

## Test Helpers (tests/)

Create alongside each integration test phase:
- `tests/ThreadsTableTestHelper.js`
- `tests/CommentsTableTestHelper.js`
- `tests/RepliesTableTestHelper.js`

Each helper: `insert()`, `findById()`, `cleanTable()`

---

## Execution Order

```
Phase 1: Thread (add)
  → migration threads
  → Domain: NewThread, AddedThread, ThreadRepository
  → UseCase: AddThreadUseCase
  → Infra: ThreadRepositoryPostgres
  → Interface: POST /threads
  → Tests

Phase 2: Comment (add)
  → migration comments
  → Domain: NewComment, AddedComment, CommentRepository
  → UseCase: AddCommentUseCase
  → Infra: CommentRepositoryPostgres, extend ThreadRepositoryPostgres
  → Interface: POST /threads/:threadId/comments
  → Tests

Phase 3: Comment (delete)
  → Extend CommentRepository + Postgres impl
  → UseCase: DeleteCommentUseCase
  → Interface: DELETE /threads/:threadId/comments/:commentId
  → Tests

Phase 4: Thread detail
  → Domain: ThreadDetail, CommentDetail
  → Extend ThreadRepository, CommentRepository
  → UseCase: GetThreadDetailUseCase
  → Interface: GET /threads/:threadId
  → Tests

Phase 5: Replies (optional)
  → migration replies
  → Domain: NewReply, AddedReply, ReplyDetail, ReplyRepository
  → UseCase: AddReplyUseCase, DeleteReplyUseCase
  → Extend GetThreadDetailUseCase
  → Interface: replies routes
  → Tests

Phase 6: Error translation + final integration test
```

---

## Key Constraints

| Rule | Detail |
|------|--------|
| Auth required | POST /threads, POST+DELETE /comments, POST+DELETE /replies |
| Auth NOT required | GET /threads/:threadId |
| Soft delete | comments.is_delete, replies.is_delete |
| Deleted comment content | `**komentar telah dihapus**` |
| Deleted reply content | `**balasan telah dihapus**` |
| Comment order | ASC by date |
| Reply order | ASC by date |
| Owner check | 403 if not owner (comment/reply delete) |
| Thread/Comment/Reply not found | 404 |
| No auth error message | Must be exact string `'Missing authentication'` — from JWT middleware |
| replies field on comment | When Phase 5 active, EVERY comment must include `replies: []` even if zero replies. Test explicitly checks `comment2.replies.length === 0` |
| Replies prereq test setup | Uses 2 comments (commentId = first, second has zero replies) — verify `getRepliesByCommentId` returns `[]` gracefully |

---

## File Count Summary (new files to create)

```
migrations/        +3 (threads, comments, replies)
Domains/           +10 entity/repo files
Applications/      +5 use cases
Infrastructures/   +3 repo postgres files
Interfaces/        extend threads plugin
tests/             +3 table helpers
_test/ files       ~15 test files
```
