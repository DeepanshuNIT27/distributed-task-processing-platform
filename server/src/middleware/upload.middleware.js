import multer from "multer";
import path from "path";
import fs from "fs";

// Assuming server is started using: cd server && npm run dev
const uploadsPath = path.join(process.cwd(), "src/uploads/original");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `img_${uniqueSuffix}${ext}`);
  },
});

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
