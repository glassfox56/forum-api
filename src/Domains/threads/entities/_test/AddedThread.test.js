import AddedThread from '../AddedThread.js';

describe('AddedThread entity', () => {
  it('should throw error when payload missing property', () => {
    expect(() => new AddedThread({ id: 'thread-123', title: 'judul' }))
      .toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new AddedThread({ id: 123, title: 'judul', owner: 'user-123' }))
      .toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread correctly', () => {
    const payload = { id: 'thread-123', title: 'sebuah thread', owner: 'user-123' };
    const { id, title, owner } = new AddedThread(payload);

    expect(id).toBe(payload.id);
    expect(title).toBe(payload.title);
    expect(owner).toBe(payload.owner);
  });
});
