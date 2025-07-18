const express = require('express');
const router = express.Router();
const isAuthenticatedUser = require('../middleware/auth');

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});
router.get('/demo', isAuthenticatedUser, (req, res) => {
    res.render('demo');
});
// Catch-all 404 route (debug)

module.exports = router;
