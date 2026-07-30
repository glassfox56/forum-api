import NewComment from '../NewComment.js';

describe('NewComment entity', () => {
  it('should throw error when missing property', () => {
    expect(() => new NewComment({ content: 'isi', threadId: 'thread-123' }))
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when wrong data type', () => {
    expect(() => new NewComment({ content: 123, threadId: 'thread-123', owner: 'user-123' }))
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment correctly', () => {
    const comment = new NewComment({ content: 'isi komentar', threadId: 'thread-123', owner: 'user-123' });

    expect(comment.content).toBe('isi komentar');
    expect(comment.threadId).toBe('thread-123');
    expect(comment.owner).toBe('user-123');
  });
});
