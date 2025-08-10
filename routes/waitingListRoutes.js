const express = require('express');

const waitingListController = require('../controllers/waitingListController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('ادمن'));

router
  .route('/')
  .get(waitingListController.getWaitingList)
  .post(waitingListController.addToWaitingList);

router
  .route('/:id')
  .get(waitingListController.getWaitingPatient)
  .put(waitingListController.updateWaitingPatient)
  .post(waitingListController.moveToPatients)
  .delete(waitingListController.deleteFromWaitingList);

module.exports = router;
