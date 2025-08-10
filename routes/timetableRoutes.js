const express = require('express');

const timetableController = require('../controllers/timetableController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.post('/', timetableController.createTimetableForToday);
// router.get('/all', timetableController.getAllTimetables);

// router.use(authController.protect, authController.restrictTo('ادمن'));
router.get('/', timetableController.getTimetable);
router.post('/:id', timetableController.addPresentPatient);
router.put('/session-status/:id', timetableController.updateSessionStatus);

module.exports = router;
