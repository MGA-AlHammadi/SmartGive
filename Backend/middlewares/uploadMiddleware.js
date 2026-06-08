const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
});

const fileFilter = (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return cb(new Error('Nur Bilddateien sind erlaubt'));
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
