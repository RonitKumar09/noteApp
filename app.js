require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
const User = require('./src/models/users_db');
const notesRoute = require('./src/routes/notes');
const authRoute = require('./src/routes/auth');
const pagesRoute = require('./src/routes/pages');

app.use(flash());

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const databaseUrl = process.env.DATABASE;
mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});



// Register authRoute first to ensure /login and other auth routes are matched before notes/pages
app.use('/', authRoute);
app.use('/', notesRoute);
app.use('/', pagesRoute);

// 404 handler (should be after all other routes)
app.use((req, res, next) => {
    res.status(404).render('error');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});