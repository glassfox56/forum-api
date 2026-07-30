import ThreadRepository from '../ThreadRepository.js';

describe('ThreadRepository interface', () => {
  it('should throw error when invoking abstract method addThread', async () => {
    const repo = new ThreadRepository();
    await expect(repo.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method verifyThreadExists', async () => {
    const repo = new ThreadRepository();
    await expect(repo.verifyThreadExists('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
