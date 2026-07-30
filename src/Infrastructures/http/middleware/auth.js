import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

const createAuthMiddleware = (container) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authentication' });
  }

  const token = authHeader.slice(7);

  try {
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    await tokenManager.verifyAccessToken(token);
    const { id } = await tokenManager.decodePayload(token);
    req.userId = id;
    return next();
  } catch {
    return res.status(401).json({ message: 'Missing authentication' });
  }
};

export default createAuthMiddleware;
