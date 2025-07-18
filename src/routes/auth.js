const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: 'Invalid email or password. Try Again!!!'
}));
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/logout', authController.logout);
router.get('/forgot', authController.getForgot);
router.post('/forgot', authController.postForgot);
router.get('/reset/:token', authController.getReset);
router.post('/reset/:token', authController.postReset);

module.exports = router;
