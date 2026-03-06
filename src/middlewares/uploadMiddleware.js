const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const uploadDir = path.resolve(process.cwd(), 'src/uploads/users');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${req.params.id}-${Date.now()}${ext || '.jpg'}`);
  },
});

function imageFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Arquivo precisa ser uma imagem'));
  }
  return cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
