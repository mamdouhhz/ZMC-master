const express = require('express');

const sessionController = require('../controllers/sessionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// SPECIALIST ACCESS
router.get(
  '/my-sessions',
  authController.restrictTo('اخصائي'),
  sessionController.getMySessions,
  sessionController.getMyTodaySessions
);

// ADMIN ACCESS
router.use(authController.restrictTo('ادمن'));
router.get(
  '/specialist/:specialistId',
  sessionController.getSpecialistSessions
);
router.get('/:id', sessionController.getSession);
router.get('/', sessionController.getAllSessions);

router.post('/', sessionController.createSession);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
