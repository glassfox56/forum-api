import ThreadDetail from '../ThreadDetail.js';

describe('ThreadDetail entity', () => {
  it('should create ThreadDetail with correct properties', () => {
    const comments = [];
    const thread = new ThreadDetail({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2021-01-01T00:00:00.000Z',
      username: 'dicoding',
      comments,
    });

    expect(thread.id).toBe('thread-123');
    expect(thread.title).toBe('sebuah thread');
    expect(thread.body).toBe('isi thread');
    expect(thread.date).toBe('2021-01-01T00:00:00.000Z');
    expect(thread.username).toBe('dicoding');
    expect(thread.comments).toBe(comments);
  });
});
