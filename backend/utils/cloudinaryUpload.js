const path = require('path');
const configureCloudinary = require('../config/cloudinary');

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const cloudinary = configureCloudinary();
    
    // Extract the file extension
    const ext = path.extname(file.originalname || '');
    
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'placement-knowledge-system',
        public_id: `${Date.now()}-${baseName || 'attachment'}${ext}`,
        resource_type: 'auto', // <-- FIX: Let Cloudinary automatically figure out the file type!
        use_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          originalName: file.originalname,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileType: file.mimetype,
          fileSize: file.size,
          resourceType: result.resource_type, // Save whatever Cloudinary decided it was
        });
      },
    );

    uploadStream.end(file.buffer);
  });

const deleteFromCloudinary = async (file) => {
  if (!file || !file.publicId) {
    return;
  }

  const cloudinary = configureCloudinary();
  await cloudinary.uploader.destroy(file.publicId, {
    resource_type: file.resourceType || 'auto',
    invalidate: true,
  });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };