const express = require('express');
const gympassController = require('../controllers/gympassController');
const verifyGympassSignature = require('../middlewares/webhookSignature');

const router = express.Router();

router.post('/gyms/:gymId/classes', gympassController.createClasses);
router.get('/gyms/:gymId/classes', gympassController.listClasses);
router.get('/gyms/:gymId/classes/:classId', gympassController.getClass);
router.put('/gyms/:gymId/classes/:classId', gympassController.updateClass);

router.post('/gyms/:gymId/classes/:classId/slots', gympassController.createSlot);
router.get('/gyms/:gymId/classes/:classId/slots', gympassController.listSlots);
router.get('/gyms/:gymId/classes/:classId/slots/:slotId', gympassController.getSlot);
router.delete('/gyms/:gymId/classes/:classId/slots/:slotId', gympassController.deleteSlot);
router.patch('/gyms/:gymId/classes/:classId/slots/:slotId', gympassController.patchSlot);
router.put('/gyms/:gymId/classes/:classId/slots/:slotId', gympassController.updateSlot);

router.patch('/gyms/:gymId/bookings/:bookingNumber', gympassController.validateBooking);

router.get('/gyms/:gymId/products', gympassController.listProducts);
router.post('/gyms/:gymId/checkins/validate', gympassController.validateCheckin);

router.post('/webhooks/gympass', verifyGympassSignature, gympassController.handleWebhook);

module.exports = router;
