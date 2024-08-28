const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');

// @desc    Upload image to Cloudinary
// @route   POST /api/v1/upload
// @access  Private
exports.uploadImage = asyncHandler(async (req, res, next) => {
  console.log('Upload request received');
  if (!req.files) {
    console.log('No files in request');
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.image;
  console.log('File received:', file.name);

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  try {
    console.log('Attempting to upload to Cloudinary');
    console.log('Cloudinary config:', cloudinary.config());
    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'blog_images',
      use_filename: true,
      unique_filename: true,
    });
    console.log('Cloudinary upload successful:', uploadResult.public_id);

    // Generate optimized URL
    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    res.status(200).json({
      success: true,
      data: {
        url: optimizedUrl,
        public_id: uploadResult.public_id
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return next(new ErrorResponse('Problem with file upload: ' + error.message, 500));
  }
});