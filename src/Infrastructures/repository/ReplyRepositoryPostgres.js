import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, content, comment_id, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, commentId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, u.username, r.date, r.content, r.is_delete
             FROM replies r
             JOIN users u ON r.owner = u.id
             WHERE r.comment_id = $1
             ORDER BY r.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default ReplyRepositoryPostgres;
