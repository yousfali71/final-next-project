/**
 * Catch Async Errors Wrapper
 * Wraps async route handlers to automatically catch errors and pass them to error middleware
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
