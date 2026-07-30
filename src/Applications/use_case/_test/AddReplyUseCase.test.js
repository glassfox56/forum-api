import AddReplyUseCase from '../AddReplyUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue();
    mockReplyRepository.addReply = vi.fn().mockResolvedValue(
      new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }),
    );

    const useCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await useCase.execute({
      content: 'sebuah balasan',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
      'comment-123',
    );
    expect(mockReplyRepository.addReply).toHaveBeenCalled();
    expect(result).toStrictEqual(expectedAddedReply);
  });
});
