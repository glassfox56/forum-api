import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.date, c.content, c.is_delete
             FROM comments c
             JOIN users u ON c.owner = u.id
             WHERE c.thread_id = $1
             ORDER BY c.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default CommentRepositoryPostgres;
