const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer memory storage (keeps file in buffer for Sharp processing)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo no es una imagen válida.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per image
  }
});

// Middleware to process and optimize uploads
const optimizeImages = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    const filesToProcess = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
    req.optimizedImages = [];

    for (const file of filesToProcess) {
      const filename = `prop-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const outputPath = path.join(uploadsDir, filename);

      // Optimize image: resize to max 1200px width (preserving aspect ratio) and convert to WebP at 80% quality
      await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Add to array of optimized image URLs/filenames
      req.optimizedImages.push(`/uploads/${filename}`);
    }

    next();
  } catch (error) {
    console.error('Error in image optimization:', error);
    res.status(500).json({ error: 'Error al optimizar y procesar las imágenes.' });
  }
};

module.exports = {
  upload,
  optimizeImages
};
