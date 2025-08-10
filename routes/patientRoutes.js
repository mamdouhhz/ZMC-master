const express = require('express');

const patientController = require('../controllers/patientController');
const authController = require('../controllers/authController');

const router = express.Router();

// ADMIN ONLY ACCESS
router.use(authController.protect);
router
  .route('/')
  .get(patientController.getAllPatients)
  .post(patientController.createPatient);

router.get('/:id/sessions', patientController.getPatientAllSessions);

router.post(
  '/:id/photo',
  patientController.uploadPatientPhoto,
  patientController.resizePatientPhoto,
  patientController.updatePatientPhoto
);

router.delete('/:id/photo', patientController.deletePatientPhoto);

router.get('/my-patients', patientController.getMyPatients);

router.get('/class-patients', patientController.getClassPatients);

router
  .route('/:id')
  .get(patientController.getPatient)
  .put(patientController.updatePatient)
  .delete(patientController.deletePatient);

module.exports = router;
