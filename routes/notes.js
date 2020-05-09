const express = require('express');
const router = express.Router();
const note = require('../models/notes_db');
const user = require('../models/users_db');
const multer = require('multer');
const path = require('path');
const fs = require ('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const async = require('async');
const crypto = require('crypto');
const nodemailer = require ('nodemailer');

//multer setup follows

let storage = multer.diskStorage({
    destination: 'public/img/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

//function for fileExtention validiation

function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
        return cb(null, true);
    } else {
        cb('Error! Images Only');
    }
}

//end of fileExtention validiation function

//multer setup ends

//isAuthenticatedUser

function isAuthenticatedUser(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', 'You need to Login First!!!');
    res.redirect('/login');
}


//get routes follows

router.get('/', (req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('/home');
    }
    res.redirect('/login');
});
router.get('/home', isAuthenticatedUser, (req, res) => {
    note.find({})
    .then( notes=>{
        res.render('index', {notes: notes});
    })
    .catch(err => {
        req.flash('error_msg', 'ERROR: ' + err);

        res.redirect('back');
    })
});

router.get('/add', isAuthenticatedUser, (req, res) => {
    res.render('add');
});

router.get('/demo', isAuthenticatedUser, (req, res) => {
    res.render('demo');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req,res)=>{
    req.logOut();
    req.flash('success_msg', 'Logged Out Successfully!!');
    res.redirect('/login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/search', isAuthenticatedUser, (req, res) => {
    res.render('search', {
        notes: [],
        flag: false
    });
});

router.get('/note', isAuthenticatedUser, (req, res) => {
    let SearchQuery = req.query.noteTitle.replace('*', '');
    if (SearchQuery) {
        note.find({
                $or: [{
                        note: {
                            $regex: new RegExp(req.query.noteTitle),
                            $options: 'i\m'
                        }
                    },
                    {
                        title: {
                            $regex: new RegExp(req.query.noteTitle),
                            $options: 'i\m'
                        }
                    },
                    {
                        tags: {
                            $regex: new RegExp(req.query.noteTitle),
                            $options: 'i\m'
                        }
                    }

                ]
            })
            .then(notes => {
                res.render('search', {
                    notes: notes,
                    flag: true
                });
            })
            .catch(err => {
                req.flash('error_msg', 'ERROR: ' + err);

                res.redirect('/home');
            })
    } else {
        res.redirect('/search');
    }
});

router.get('/edit/:id', isAuthenticatedUser, (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    note.findOne(SearchQuery)
        .then(notes => {
            res.render('edit', {
                notes: notes
            });
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        })
});

router.get('/noteView/:id', isAuthenticatedUser, function (req, res) {
    let SearchQuery = {
        _id: req.params.id
    };
    note.findOne(SearchQuery)
        .then(notes => {
            res.render('noteView', {
                note : notes
            });
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        })
});

router.get('/forgot', (req,res)=>{
    res.render('forgot');
});

router.get('/reset/:token', (req,res)=>{
    user.findOne({resetPasswordToken : req.params.token, resetPasswordExpires : {$gt : Date.now()}})
    .then(user =>{
        if(!user){
            req.flash('error_msg', 'Password reset token is either invalid or has been expired!!');
            res.redirect('/forgot');
        }
        res.render('newpassword', {token: req.params.token});
    })
    .catch(err=>{
        req.flash('error_msg', 'ERROR:' + err);
        res.redirect('/forgot');
    })
})

router.get('*', function (req, res) {
    res.render('error');
});
//get routes end



// post route follows
router.post('/add', isAuthenticatedUser, upload.array('images'), (req, res, next) => {
    const files = req.files;
    let url = [];
    if (!files) {
        url = [];
    }
    files.forEach(file => {
        url.push(file.path.replace('public', ''));
    });
    let arr = [];
    let title = req.body.title;
    let notes = req.body.note;
    let author = [req.body.author];
    arr = req.body.tags.trim().split(",");
    arr = Array.from(new Set(arr));

    let newNote = {
        title: title,
        tags: arr,
        note: notes,
        imgUrl: url,
        author : author
    };


    note.create(newNote)
        .then(notes => {
            req.flash('success_msg', `${req.body.title} Added Successfully`);
            res.redirect('/home')
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        })
});


router.post('/tag_delete/:id', isAuthenticatedUser, (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    let tag = req.body.tag;
    note.updateOne(SearchQuery, {
            $pull: {
                tags: tag
            }
        })
        .then(note => {
            res.redirect("back");
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');
        })
});

router.post('/deleteimg/:id', isAuthenticatedUser, (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    let url = req.body.url;
    
    fs.unlink('./public/'+url, (err)=> {
        if(err)
        {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');   
        }
    })

    note.updateOne(SearchQuery,{ $pull: {
        imgUrl: url
        }}
        )
        .then(()=>{res.redirect('back');})
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');
        })
});

router.post('/login',passport.authenticate( 'local', {
    successRedirect : '/home',
    failureRedirect : '/login',
    failureFlash : 'Invalid email or password. Try Again!!!'
}));

router.post('/signup', (req,res)=>{

    let user_id = req.body.user_id;
    let user_mail = req.body.email;
    let password = req.body.password;

    let userData = {
        name : user_id,
        email : user_mail
    };

    user.register(userData, password, (err, user)=>{
        if(err){
            req.flash('error_msg', 'ERROR:' +err)
            res.redirect('/signup');
        }
        passport.authenticate('local') (req, res, ()=>{
            req.flash('success_msg', `${userData.name} registered successfully!`);
            res.render('login');
        })
    })

});

router.post('/forgot', (req,res,next)=>{
    // let recoveryPassword ='';
    async.waterfall([
        (done)=>{
            crypto.randomBytes(20, (err, buf)=>{
                let token = buf.toString('hex');
                done(err,token);
            })
        },
        (token,done)=>{
            user.findOne({email : req.body.email})
            .then( user=>{
                if(!user){
                    req.flash('error_msg', `user with email: ${req.body.email} does not exist`);
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 1800000; // 30mins

                user.save(err=>{
                    done(err, token, user);
                });
            })
            .catch(err=>{
                req.flash('error_msg', 'ERROR: '+err);
                res.redirect('/forgot');
            })
        },
        (token, user)=>{
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user : process.env.GMAIL_EMAIL,
                    pass : process.env.GMAIL_PASSWORD
                }
            });

            let mailOptions = {
                to : user.email,
                from : 'noteApp_Recover_Password noteAppauth@gmail.com',
                subject : 'Recover Password of noteApp',
                text : 'Follow the link to recover your Password: \n\n' +
                        'https://'+ req.headers.host + '/reset/' +token + '\n\n' +
                        'If this password recovery request is not generated by you, please ignore this email.'
            };

            smtpTransport.sendMail(mailOptions, err =>{
                req.flash('success_msg','Email sent with recovery link on your registered mail-id!');
                res.redirect('/login');
            });
        }
    ], err =>{
        if(err){res.redirect('/forgot');}
    })
});

router.post('/reset/:token', (req,res)=>{
   async.waterfall([ (done)=>{
       user.findOne({resetPasswordToken : req.params.token, resetPasswordExpires : {$gt : Date.now()}})
       .then(user=>{
        if(!user){
            req.flash('error_msg', 'Password reset token is either invalid or has been expired!!');
            res.redirect('/forgot');
        }
        if(req.body.password != req.body.confirmpassword){
            req.flash('error_msg', 'Password does not match');
            return res.redirect('/forgot');
        }

        user.setPassword(req.body.password, (err)=>{
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(err=>{
                req.login(user, err=>{
                    done(err, user);
                })
            });
        })
       })
        .catch(err=>{
            req.flash('error_msg', "ERROR: " +err);
            res.redirect('/forgot');
        })
   },
   (user)=>{
       let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user : process.env.GMAIL_EMAIL,
            pass : process.env.GMAIL_PASSWORD
        }
       });
       let mailOptions = {
           to : user.email,
           from : 'noteApp _Password_Changed noteAppauth@gmail.com',
           subject : 'Your Password has been successfully changed!',
           text:`Hello, ${user.name} \n\nYou have successfully changed your Password for the account:  ${user.email}\n\n` +
                `Click Here to log in:- https://${req.headers.host}`
       };
       smtpTransport.sendMail(mailOptions, err=>{
           req.flash('success_msg', 'Your Password has been changed Successfully!!');
           res.redirect('/login');
       });
   }

], err=>{
       res.redirect('/login');
   })
    
});

//post route ends





//put routes follows
router.put('/edit/:id', isAuthenticatedUser, upload.array('images'), (req, res) => {
    let url = [];
    let author = req.body.author;
    const files = req.files;
    let arr = [];
    arr = req.body.tags.trim().split(",");
    arr = Array.from(new Set(arr));

    let SearchQuery = {
        _id: req.params.id
    };
    // note.findOne(SearchQuery)
    //     .then((note) => {
    //            url = note.imgUrl;
            if (!files) {
                console.log('no files extra added');
            }
            files.forEach(file => {
                url.push(file.path.replace('public', ''));
            });
        //  })
        //  .then(() => {
            note.updateOne(SearchQuery, {
                    $set: {
                        title: req.body.title,
                        tags: arr,
                        note: req.body.note,
                    },
                    $push : {
                        imgUrl:{ $each : url}
                    },
                    $addToSet: {
                        author: author
                    }
                })
                .then(note => {
                    req.flash('success_msg', `${req.body.title} Updated Successfully`);
                    res.redirect("/home");
                })
                .catch(err => {
                    req.flash('error_msg', 'ERROR: ' + err);
                    res.redirect('/home');
                })
    })


//         .catch((err) => {
//             req.flash('error_msg', 'ERROR: ' + err);
//             res.redirect('/home');
//         });
// });


//put routes end



//Delete routes follows
router.delete('/delete/:id',isAuthenticatedUser, (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    note.deleteOne(SearchQuery)
        .then(note => {
            req.flash('error_msg', `Deleted Successfully`);
            res.redirect("/home");
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        });
});
//Delete routes end




module.exports = router;
