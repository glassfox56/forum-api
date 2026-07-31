import express from 'express';

const createThreadsRouter = (handler, authMiddleware) => {
  const router = express.Router();

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadDetailHandler);
  router.post(
    '/:threadId/comments',
    authMiddleware,
    handler.postCommentHandler,
  );
  router.delete(
    '/:threadId/comments/:commentId',
    authMiddleware,
    handler.deleteCommentHandler,
  );
  router.post(
    '/:threadId/comments/:commentId/replies',
    authMiddleware,
    handler.postReplyHandler,
  );
  router.delete(
    '/:threadId/comments/:commentId/replies/:replyId',
    authMiddleware,
    handler.deleteReplyHandler,
  );
  router.put(
    '/:threadId/comments/:commentId/likes',
    authMiddleware,
    handler.putCommentLikeHandler,
  );

  return router;
};

export default createThreadsRouter;
