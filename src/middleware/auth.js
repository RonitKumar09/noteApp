// Middleware to check if user is authenticated
module.exports = function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view the resource');
    res.redirect('/login');
}
