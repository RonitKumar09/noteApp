const express = require('express');
const router = express.Router();
const note = require('../models/notes_db');



//get routes follows
router.get('/', (req, res) => {
    note.find({})
        .then(notes => {
            res.render('index', {
                notes: notes
            });
        })
        .catch(err => {
            console.log("err:", err);
            res.redirect('/');
        })
});

router.get('/add', (req, res) => {
    res.render('add');
});

router.get('/search', (req, res) => {
    res.render('search', {
        notes: [],
        flag: false
    });
});

router.get('/note', (req, res) => {
    // let SearchQuery = {};
    if (req.query.noteTitle) {
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
                req.flash('error_msg', 'ERROR: '+ err);
                
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
            req.flash('error_msg', 'ERROR: '+ err);
            res.redirect('/');
        })
});

router.get('*', function(req, res) {
    res.render('error');
  });
//get routes end







// post route follows
router.post('/add', (req, res) => {
    let arr = [];
    arr = req.body.tags.trim().split(",");
    arr = Array.from(new Set(arr));

    let newNote = {
        title: req.body.title,
        tags: arr,
        note: req.body.note
    };

    note.create(newNote)
        .then(notes => {
            req.flash('success_msg',`${req.body.title} Added Successfully`);
            res.redirect('/')
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: '+ err);
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
            req.flash('error_msg', 'ERROR: '+ err);
            res.redirect('/');
        })
});


//post route ends





//put routes follows
router.put('/edit/:id', (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    let arr = [];
    arr = req.body.tags.trim().split(",");
    arr = Array.from(new Set(arr));

    note.updateOne(SearchQuery, {
            $set: {
                title: req.body.title,
                tags: arr,
                note: req.body.note
            }
        })
        .then(note => {
            req.flash('success_msg',`${req.body.title} Updated Successfully`);
            res.redirect("/");
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: '+ err);
            res.redirect('/');
        })
});


//put routes end



//Delete routes follows
router.delete('/delete/:id', (req, res) => {
    let SearchQuery = {
        _id: req.params.id
    };
    note.deleteOne(SearchQuery)
        .then(note => {
            req.flash('error_msg',`Deleted Successfully`);
            res.redirect("/");
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: '+ err);
            res.redirect('/');
        });
});
//Delete routes end




module.exports = router;