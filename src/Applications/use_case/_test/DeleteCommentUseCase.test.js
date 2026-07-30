import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment correctly', async () => {
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = vi.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = vi.fn().mockResolvedValue();

    const useCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await useCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith('comment-123');
  });
});
