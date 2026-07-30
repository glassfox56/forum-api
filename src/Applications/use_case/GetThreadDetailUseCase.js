import ThreadDetail from '../../Domains/threads/entities/ThreadDetail.js';
import CommentDetail from '../../Domains/comments/entities/CommentDetail.js';
import ReplyDetail from '../../Domains/replies/entities/ReplyDetail.js';

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const rawComments = await this._commentRepository.getCommentsByThreadId(threadId);

    const comments = await Promise.all(
      rawComments.map(async (comment) => {
        const commentDetail = new CommentDetail(comment);
        const rawReplies = await this._replyRepository.getRepliesByCommentId(comment.id);
        commentDetail.replies = rawReplies.map((reply) => new ReplyDetail(reply));
        return commentDetail;
      }),
    );

    return new ThreadDetail({ ...thread, comments });
  }
}

export default GetThreadDetailUseCase;
