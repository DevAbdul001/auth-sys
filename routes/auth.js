const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require ('../middleware/authMiddleware');
const {authorizeRole } = require ('../middleware/roleMiddleware');


router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.get('/me', authenticate, authController.fetchMe);
router.post('/refresh-token', authenticate, authController.refreshAccessToken);
router.patch('/refresh-token/revoke/:user_id', authenticate, authorizeRole("admin"), authController.revokeRefreshToken);
router.post('/signout', authenticate, authController.signOut);
router.delete('/delete', authenticate, authController.deleteUser);


module.exports = router;