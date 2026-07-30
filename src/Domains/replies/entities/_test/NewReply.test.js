import NewReply from '../NewReply.js';

describe('NewReply entity', () => {
  it('should throw error when required properties are missing', () => {
    expect(() => new NewReply({ content: 'isi', commentId: 'comment-123', threadId: 'thread-123' }))
      .toThrow('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when property has wrong data type', () => {
    expect(() => new NewReply({ content: 123, commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' }))
      .toThrow('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply correctly', () => {
    const reply = new NewReply({
      content: 'sebuah balasan',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    expect(reply.content).toBe('sebuah balasan');
    expect(reply.commentId).toBe('comment-123');
    expect(reply.threadId).toBe('thread-123');
    expect(reply.owner).toBe('user-123');
  });
});
