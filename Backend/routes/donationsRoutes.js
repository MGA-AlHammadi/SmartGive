const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
    createDonation,
    listMyDonations,
    listReceivedDonations,
    updateDonationStatus,
    updateDonationByOwner,
    deleteDonationByOwner,
    generateDonationReport
} = require('../controllers/donationsController');
const validate = require('../middlewares/validateMiddleware');
const { createDonationSchema } = require('../validations/donationSchema');

router.post('/', verifyToken, upload.array('images', 5), validate(createDonationSchema), createDonation);
router.get('/mine', verifyToken, listMyDonations);
router.get('/received', verifyToken, listReceivedDonations);
router.get('/:id/report', verifyToken, generateDonationReport);
router.patch('/:id/status', verifyToken, updateDonationStatus);
router.patch('/:id', verifyToken, upload.array('images', 5), updateDonationByOwner);
router.delete('/:id', verifyToken, deleteDonationByOwner);

module.exports = router;
