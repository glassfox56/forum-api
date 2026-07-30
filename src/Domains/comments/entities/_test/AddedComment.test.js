import AddedComment from '../AddedComment.js';

describe('AddedComment entity', () => {
  it('should throw error when missing property', () => {
    expect(() => new AddedComment({ id: 'comment-123', content: 'isi' }))
      .toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when wrong data type', () => {
    expect(() => new AddedComment({ id: 123, content: 'isi', owner: 'user-123' }))
      .toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment correctly', () => {
    const comment = new AddedComment({ id: 'comment-123', content: 'isi komentar', owner: 'user-123' });

    expect(comment.id).toBe('comment-123');
    expect(comment.content).toBe('isi komentar');
    expect(comment.owner).toBe('user-123');
  });
});
