/* eslint-disable camelcase */
import CommentDetail from '../CommentDetail.js';

describe('CommentDetail entity', () => {
  it('should create CommentDetail with correct properties when not deleted', () => {
    const comment = new CommentDetail({
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-01-01T00:00:00.000Z',
      content: 'isi komentar',
      is_delete: false,
    });

    expect(comment.id).toBe('comment-123');
    expect(comment.username).toBe('dicoding');
    expect(comment.date).toBe('2021-01-01T00:00:00.000Z');
    expect(comment.content).toBe('isi komentar');
  });

  it('should replace content with deletion message when is_delete is true', () => {
    const comment = new CommentDetail({
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-01-01T00:00:00.000Z',
      content: 'isi komentar',
      is_delete: true,
    });

    expect(comment.content).toBe('**komentar telah dihapus**');
  });
});
