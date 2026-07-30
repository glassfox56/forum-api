import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { content, threadId, owner } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    const newComment = new NewComment({ content, threadId, owner });
    return this._commentRepository.addComment(newComment);
  }
}

export default AddCommentUseCase;
