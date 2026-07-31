import LikeCommentUseCase from '../LikeCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';

describe('LikeCommentUseCase', () => {
  it('should like comment when comment not liked yet', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockCommentRepository.isCommentLiked = vi.fn().mockResolvedValue(false);
    mockCommentRepository.addCommentLike = vi.fn().mockResolvedValue();
    mockCommentRepository.deleteCommentLike = vi.fn().mockResolvedValue();

    const useCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await useCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
      'comment-123',
    );
    expect(mockCommentRepository.isCommentLiked).toHaveBeenCalledWith(
      'comment-123',
      'user-123',
    );
    expect(mockCommentRepository.addCommentLike).toHaveBeenCalledWith(
      'comment-123',
      'user-123',
    );
    expect(mockCommentRepository.deleteCommentLike).not.toHaveBeenCalled();
  });

  it('should unlike comment when comment has been liked', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockCommentRepository.isCommentLiked = vi.fn().mockResolvedValue(true);
    mockCommentRepository.addCommentLike = vi.fn().mockResolvedValue();
    mockCommentRepository.deleteCommentLike = vi.fn().mockResolvedValue();

    const useCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await useCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
      'comment-123',
    );
    expect(mockCommentRepository.isCommentLiked).toHaveBeenCalledWith(
      'comment-123',
      'user-123',
    );
    expect(mockCommentRepository.deleteCommentLike).toHaveBeenCalledWith(
      'comment-123',
      'user-123',
    );
    expect(mockCommentRepository.addCommentLike).not.toHaveBeenCalled();
  });
});
