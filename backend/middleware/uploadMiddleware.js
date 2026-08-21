const path = require('path');
const multer = require('multer');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const allowedExtensions = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
]);

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]);

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname || '').toLowerCase();

  if (allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype)) {
    return callback(null, true);
  }

  return callback(
    new Error(
      'Unsupported file type. Upload PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, PNG, JPG, or JPEG files only.',
    ),
  );
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

module.exports = { upload, MAX_FILE_SIZE_BYTES };
