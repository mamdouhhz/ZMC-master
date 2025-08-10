const express = require('express');
const notebookController = require('../controllers/notebookController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/patient/:patientId')
  .post(notebookController.uploadFile, notebookController.uploadNotebook)
  .get(notebookController.getPatientAllNotebooks);

router.get('/my-notebooks', notebookController.getMyNotebooks);
router.get('/patient/:patientId/notebook', notebookController.getPatientNotebook);
router.delete('/:notebookId', notebookController.deleteNotebook);
router.get('/:notebookId/download', notebookController.downloadNotebook);
router.get('/:notebookId', notebookController.getNotebook);
router.patch(
  '/:notebookId',
  notebookController.uploadFile,
  notebookController.updateNotebook
);

module.exports = router;
