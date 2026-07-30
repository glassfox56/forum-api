import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw error when invoking abstract methods', async () => {
    const repo = new ReplyRepository();

    await expect(repo.addReply({})).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.verifyReplyExists('reply-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.verifyReplyOwner('reply-123', 'user-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.deleteReply('reply-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.getRepliesByCommentId('comment-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
