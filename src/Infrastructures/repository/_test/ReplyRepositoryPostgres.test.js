import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply', () => {
    it('should persist reply in database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const newReply = new NewReply({
        content: 'sebuah balasan',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const repo = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await repo.addReply(newReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return AddedReply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const newReply = new NewReply({
        content: 'sebuah balasan',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const repo = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await repo.addReply(newReply);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyExists', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(repo.verifyReplyExists('reply-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when reply exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(repo.verifyReplyExists('reply-123')).resolves.not.toThrow();
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(repo.verifyReplyOwner('reply-xxx', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(repo.verifyReplyOwner('reply-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyRepositoryPostgres(pool, {});
      await expect(repo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteReply', () => {
    it('should soft delete reply (set is_delete = true)', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyRepositoryPostgres(pool, {});
      await repo.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return empty array when no replies', async () => {
      const repo = new ReplyRepositoryPostgres(pool, {});
      const replies = await repo.getRepliesByCommentId('comment-xxx');
      expect(replies).toHaveLength(0);
    });

    it('should return replies with username sorted by date ASC', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'balasan pertama',
        date: '2021-01-01T01:00:00.000Z',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        commentId: 'comment-123',
        owner: 'user-456',
        content: 'balasan kedua',
        date: '2021-01-01T02:00:00.000Z',
      });

      const repo = new ReplyRepositoryPostgres(pool, {});
      const replies = await repo.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-1');
      expect(replies[0].username).toBe('dicoding');
      expect(replies[0].content).toBe('balasan pertama');
      expect(replies[0].is_delete).toBe(false);
      expect(replies[1].id).toBe('reply-2');
      expect(replies[1].username).toBe('johndoe');
    });

    it('should include is_delete flag correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        commentId: 'comment-123',
        owner: 'user-123',
        isDelete: true,
      });

      const repo = new ReplyRepositoryPostgres(pool, {});
      const replies = await repo.getRepliesByCommentId('comment-123');

      expect(replies[0].is_delete).toBe(true);
    });
  });
});
