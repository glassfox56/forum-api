/* eslint-disable camelcase */
import ReplyDetail from '../ReplyDetail.js';

describe('ReplyDetail entity', () => {
  it('should create ReplyDetail with correct properties when not deleted', () => {
    const reply = new ReplyDetail({
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-01-01T00:00:00.000Z',
      content: 'isi balasan',
      is_delete: false,
    });

    expect(reply.id).toBe('reply-123');
    expect(reply.username).toBe('dicoding');
    expect(reply.date).toBe('2021-01-01T00:00:00.000Z');
    expect(reply.content).toBe('isi balasan');
  });

  it('should replace content with deletion message when is_delete is true', () => {
    const reply = new ReplyDetail({
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-01-01T00:00:00.000Z',
      content: 'isi balasan',
      is_delete: true,
    });

    expect(reply.content).toBe('**balasan telah dihapus**');
  });
});
