const express = require('express');
const router = express.Router();
const note = require('../models/notes_db');
const multer = require('multer');
const path = require('path');
const fs = require ('fs');

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


//multer setup ends



//get routes follows
router.get('/', (req, res) => {
    note.find({})
        .then(notes => {
            res.render('index', {
                notes: notes
            });
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/');
        })
});

router.get('/add', (req, res) => {
    res.render('add');
});

router.get('/demo', (req, res) => {
    res.render('demo');
});

router.get('/search', (req, res) => {
    res.render('search', {
        notes: [],
        flag: false
    });
});

router.get('/note', (req, res) => {
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

                res.redirect('/');
            })
    } else {
        res.redirect('/search');
    }
});

router.get('/edit/:id', (req, res) => {
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
            res.redirect('/');
        })
});

router.get('/noteView/:id', function (req, res) {
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
            res.redirect('/');
        })
});


router.get('*', function (req, res) {
    res.render('error');
});
//get routes end

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





// post route follows
router.post('/add', upload.array('images'), (req, res, next) => {
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
    arr = req.body.tags.trim().split(",");
    arr = Array.from(new Set(arr));

    let newNote = {
        title: title,
        tags: arr,
        note: notes,
        imgUrl: url
    };


    note.create(newNote)
        .then(notes => {
            req.flash('success_msg', `${req.body.title} Added Successfully`);
            res.redirect('/')
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/');
        })
});


router.post('/tag_delete/:id', (req, res) => {
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
            res.redirect("/");
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');
        })
});

router.post('/deleteimg/:id', (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    let url = req.body.url;
    
    fs.unlink('./public/'+url, (err)=> {
        if(err)
        {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/');   
        }
    })

    note.updateOne(SearchQuery,{ $pull: {
        imgUrl: url
        }}
        )
        .then(()=>{res.redirect('back');})
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/');
        })
    })


//post route ends





//put routes follows
router.put('/edit/:id', upload.array('images'), (req, res) => {
    var url = [];
    const files = req.files;
    let arr = [];
    arr = req.body.tags.trim().split(",");
    arr = Array.from(new Set(arr));

    let SearchQuery = {
        _id: req.params.id
    };
    note.findOne(SearchQuery)
        .then((note) => {
            url = note.imgUrl;
            if (!files) {
                console.log('no files extra added');
            }
            files.forEach(file => {
                url.push(file.path.replace('public', ''));
            });
        })
        .then(() => {
            note.updateOne(SearchQuery, {
                    $set: {
                        title: req.body.title,
                        tags: arr,
                        note: req.body.note,
                        imgUrl: url
                    }
                })
                .then(note => {
                    req.flash('success_msg', `${req.body.title} Updated Successfully`);
                    res.redirect("/");
                })
                .catch(err => {
                    req.flash('error_msg', 'ERROR: ' + err);
                    res.redirect('/');
                })
        })


        .catch((err) => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/');
        });
});


//put routes end



//Delete routes follows
router.delete('/delete/:id', (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    note.deleteOne(SearchQuery)
        .then(note => {
            req.flash('error_msg', `Deleted Successfully`);
            res.redirect("/");
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/');
        });
});
//Delete routes end




module.exports = router;