import multer from "multer";
import path from "path";

// Keep uploads in memory only long enough to send them to Cloudinary. This
// removes the shared-filesystem requirement between the API and workers.
const storage = multer.memoryStorage();

// 🔥 Phase 9.3: STRICT File Validation (Format Check)
const fileFilter = (req, file, cb) => {
  // 1. Allowed File Extensions
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  // 2. Allowed Mime Types
  const allowedMimeTypes = /image\/jpeg|image\/png|image\/webp/;

  // Check extension and mimetype
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type! Only JPEG, JPG, PNG, and WEBP images are allowed.",
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
