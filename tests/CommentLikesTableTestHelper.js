/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentLikesTableTestHelper = {
  async addCommentLike({
    id = 'comment-like-123',
    commentId = 'comment-123',
    owner = 'user-123',
  } = {}) {
    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

export default CommentLikesTableTestHelper;
