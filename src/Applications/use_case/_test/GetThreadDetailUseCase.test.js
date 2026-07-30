/* eslint-disable camelcase */
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import ThreadDetail from '../../../Domains/threads/entities/ThreadDetail.js';
import CommentDetail from '../../../Domains/comments/entities/CommentDetail.js';
import ReplyDetail from '../../../Domains/replies/entities/ReplyDetail.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail correctly with replies', async () => {
    const threadId = 'thread-123';

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2021-01-01T00:00:00.000Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-01-01T01:00:00.000Z',
        content: 'komentar pertama',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-01-01T02:00:00.000Z',
        content: 'komentar yang dihapus',
        is_delete: true,
      },
    ];

    const mockRepliesComment1 = [
      {
        id: 'reply-1',
        username: 'dicoding',
        date: '2021-01-01T01:30:00.000Z',
        content: 'balasan pertama',
        is_delete: false,
      },
    ];

    const mockRepliesComment2 = [];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue(mockThread);
    mockCommentRepository.getCommentsByThreadId = vi
      .fn()
      .mockResolvedValue(mockComments);
    mockReplyRepository.getRepliesByCommentId = vi
      .fn()
      .mockResolvedValueOnce(mockRepliesComment1)
      .mockResolvedValueOnce(mockRepliesComment2);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await useCase.execute(threadId);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      'comment-1',
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      'comment-2',
    );

    expect(result).toBeInstanceOf(ThreadDetail);
    expect(result.id).toBe('thread-123');
    expect(result.comments).toHaveLength(2);

    expect(result.comments[0]).toBeInstanceOf(CommentDetail);
    expect(result.comments[0].content).toBe('komentar pertama');
    expect(result.comments[0].replies).toHaveLength(1);
    expect(result.comments[0].replies[0]).toBeInstanceOf(ReplyDetail);
    expect(result.comments[0].replies[0].content).toBe('balasan pertama');

    expect(result.comments[1].content).toBe('**komentar telah dihapus**');
    expect(result.comments[1].replies).toHaveLength(0);
  });
});
