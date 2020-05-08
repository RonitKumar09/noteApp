const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const notesRoute = require('./routes/notes');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const user = require('./models/users_db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const fbStrategy = require('passport-facebook');


dotenv.config({
    path: './config.env'
});

app.use(flash());

app.use(session({
    secret : process.env.session_key,
    resave : true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField:'email'},user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//message varriables
app.use((req, res, next)=>{
   res.locals.success_msg = req.flash(('success_msg'));
   res.locals.error_msg = req.flash(('error_msg'));
   res.locals.error = req.flash(('error'));
   res.locals.currentUser = req.user;
   next();
});
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const databaseUrl = process.env.DATABASE;

mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(conn =>{
    console.log('database connection established');
});

app.use(notesRoute);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`PORT active on ${port}`);
})