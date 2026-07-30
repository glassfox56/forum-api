class NewReply {
  constructor({ content, commentId, threadId, owner }) {
    this._verifyPayload({ content, commentId, threadId, owner });

    this.content = content;
    this.commentId = commentId;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload({ content, commentId, threadId, owner }) {
    if (!content || !commentId || !threadId || !owner) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string' ||
      typeof commentId !== 'string' ||
      typeof threadId !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default NewReply;
