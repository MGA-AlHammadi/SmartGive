const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { createNeed, listNeeds, updateNeed, deleteNeed } = require('../controllers/needsController');

router.get('/', listNeeds);
router.post('/', verifyToken, upload.array('images', 5), createNeed);
router.patch('/:id', verifyToken, upload.array('images', 5), updateNeed);
router.delete('/:id', verifyToken, deleteNeed);

module.exports = router;
