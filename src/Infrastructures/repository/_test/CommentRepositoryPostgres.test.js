import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist comment in database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const newComment = new NewComment({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await repo.addComment(newComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return AddedComment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const newComment = new NewComment({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await repo.addComment(newComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, {});
      await expect(repo.verifyCommentExists('comment-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when comment exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const repo = new CommentRepositoryPostgres(pool, {});
      await expect(repo.verifyCommentExists('comment-123')).resolves.not.toThrow();
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, {});
      await expect(repo.verifyCommentOwner('comment-xxx', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const repo = new CommentRepositoryPostgres(pool, {});
      await expect(repo.verifyCommentOwner('comment-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const repo = new CommentRepositoryPostgres(pool, {});
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment (set is_delete = true)', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const repo = new CommentRepositoryPostgres(pool, {});
      await repo.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return empty array when no comments', async () => {
      const repo = new CommentRepositoryPostgres(pool, {});
      const comments = await repo.getCommentsByThreadId('thread-xxx');
      expect(comments).toHaveLength(0);
    });

    it('should return comments with username sorted by date ASC', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'komentar pertama',
        date: '2021-01-01T01:00:00.000Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-123',
        owner: 'user-456',
        content: 'komentar kedua',
        date: '2021-01-01T02:00:00.000Z',
      });

      const repo = new CommentRepositoryPostgres(pool, {});
      const comments = await repo.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe('comment-1');
      expect(comments[0].username).toBe('dicoding');
      expect(comments[0].content).toBe('komentar pertama');
      expect(comments[0].is_delete).toBe(false);
      expect(comments[1].id).toBe('comment-2');
      expect(comments[1].username).toBe('johndoe');
    });

    it('should include is_delete flag correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-123',
        owner: 'user-123',
        isDelete: true,
      });

      const repo = new CommentRepositoryPostgres(pool, {});
      const comments = await repo.getCommentsByThreadId('thread-123');

      expect(comments[0].is_delete).toBe(true);
    });
  });
});
