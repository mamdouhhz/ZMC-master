const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/class-login', authController.classLogin);
router.get('/logout', authController.logout);

// ADMIN ONLY ACCESS
router.use(authController.protect, authController.restrictTo('ادمن'));

router.get('/', userController.getAllUsers);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
