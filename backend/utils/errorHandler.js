// Custom error class for bad requests
export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  // Handle other types of errors
  res.status(500).json({
    message: 'Something went wrong!'
  });
}; 