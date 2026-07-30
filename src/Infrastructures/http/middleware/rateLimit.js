const createRateLimitMiddleware = ({ maxRequests, windowMs }) => {
  const requestCounters = new Map();

  return (req, res, next) => {
    const ip =
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown';
    const currentTime = Date.now();
    const entry = requestCounters.get(ip) ?? {
      count: 0,
      windowStart: currentTime,
    };

    if (currentTime - entry.windowStart >= windowMs) {
      entry.count = 1;
      entry.windowStart = currentTime;
    } else {
      entry.count += 1;
    }

    requestCounters.set(ip, entry);

    if (entry.count > maxRequests) {
      return res.status(429).json({
        status: 'fail',
        message: 'Terlalu banyak permintaan, silakan coba lagi nanti',
      });
    }

    return next();
  };
};

export default createRateLimitMiddleware;
