import AddedReply from '../AddedReply.js';

describe('AddedReply entity', () => {
  it('should throw error when required properties are missing', () => {
    expect(() => new AddedReply({ id: 'reply-123', content: 'isi' }))
      .toThrow('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when property has wrong data type', () => {
    expect(() => new AddedReply({ id: 123, content: 'isi', owner: 'user-123' }))
      .toThrow('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply correctly', () => {
    const reply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    });

    expect(reply.id).toBe('reply-123');
    expect(reply.content).toBe('sebuah balasan');
    expect(reply.owner).toBe('user-123');
  });
});
