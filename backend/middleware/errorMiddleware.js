const multer = require('multer');

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File size must not exceed 10 MB.'
        : 'The uploaded file could not be processed.';

    return res.status(400).json({ success: false, message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error('Unhandled API error:', error.message);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'An unexpected server error occurred.',
  });
};

module.exports = { notFound, errorHandler };
