import NewThread from '../NewThread.js';

describe('NewThread entity', () => {
  it('should throw error when payload missing property', () => {
    expect(() => new NewThread({ title: 'judul', body: 'isi' }))
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new NewThread({ title: 123, body: 'isi', owner: 'user-123' }))
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread correctly', () => {
    const payload = { title: 'sebuah thread', body: 'sebuah body', owner: 'user-123' };
    const { title, body, owner } = new NewThread(payload);

    expect(title).toBe(payload.title);
    expect(body).toBe(payload.body);
    expect(owner).toBe(payload.owner);
  });
});
