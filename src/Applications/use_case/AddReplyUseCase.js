import NewReply from '../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { content, commentId, threadId, owner } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    const newReply = new NewReply({ content, commentId, threadId, owner });
    return this._replyRepository.addReply(newReply);
  }
}

export default AddReplyUseCase;
