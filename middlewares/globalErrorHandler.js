const globalErrorHandler = (err, req, res, next) => {
  // STATUS
  // MESSAGE
  // STACK
  const stack = err.stack;
  const message = err.message;
  const status = err.status ? err.status : "failed";
  const statusCode = err?.statusCode ? err.statusCode : 500;

  
  //SEND THE RESPONSE
  res.status(statusCode).json({
    message,
    status,
    stack,
  });
};

module.exports = globalErrorHandler;
