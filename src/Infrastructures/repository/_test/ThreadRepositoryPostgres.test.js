import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist thread in database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });

      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const repo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await repo.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return AddedThread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });

      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const repo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await repo.addThread(newThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, {});
      await expect(repo.verifyThreadExists('thread-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const repo = new ThreadRepositoryPostgres(pool, {});
      await expect(repo.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, {});
      await expect(repo.getThreadById('thread-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread with username correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123', title: 'sebuah thread', body: 'isi thread' });

      const repo = new ThreadRepositoryPostgres(pool, {});
      const thread = await repo.getThreadById('thread-123');

      expect(thread.id).toBe('thread-123');
      expect(thread.title).toBe('sebuah thread');
      expect(thread.body).toBe('isi thread');
      expect(thread.username).toBe('dicoding');
      expect(thread.date).toBeDefined();
    });
  });
});
