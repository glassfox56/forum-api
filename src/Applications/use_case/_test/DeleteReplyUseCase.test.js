import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = vi.fn().mockResolvedValue();
    mockReplyRepository.deleteReply = vi.fn().mockResolvedValue();

    const useCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await useCase.execute({
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith('reply-123');
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-123', 'user-123');
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith('reply-123');
  });

  it('should throw NotFoundError when reply not found', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyExists = vi.fn().mockRejectedValue(new NotFoundError('balasan tidak ditemukan'));

    const useCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(
      useCase.execute({ replyId: 'reply-xxx', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' }),
    ).rejects.toThrowError(NotFoundError);
  });

  it('should throw AuthorizationError when user is not the owner', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyExists = vi.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = vi.fn().mockRejectedValue(new AuthorizationError('forbidden'));

    const useCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(
      useCase.execute({ replyId: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-456' }),
    ).rejects.toThrowError(AuthorizationError);
  });
});
