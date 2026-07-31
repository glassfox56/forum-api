class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const isCommentLiked = await this._commentRepository.isCommentLiked(
      commentId,
      owner,
    );

    if (!isCommentLiked) {
      await this._commentRepository.addCommentLike(commentId, owner);
    } else {
      await this._commentRepository.deleteCommentLike(commentId, owner);
    }
  }
}

export default LikeCommentUseCase;
