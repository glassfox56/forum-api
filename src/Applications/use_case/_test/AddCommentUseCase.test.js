import AddCommentUseCase from '../AddCommentUseCase.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    const useCasePayload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.addComment = vi.fn().mockResolvedValue(
      new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
      }),
    );

    const useCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addedComment = await useCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    );
    expect(addedComment).toStrictEqual(expectedAddedComment);
  });
});
