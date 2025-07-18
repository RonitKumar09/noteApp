const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const isAuthenticatedUser = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup
let storage = multer.diskStorage({
    destination: 'public/img/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        } else {
            cb('Error! Images Only');
        }
    }
});

// Note CRUD routes
router.get('/home', isAuthenticatedUser, notesController.getHome);
router.get('/add', isAuthenticatedUser, notesController.getAdd);
router.get('/edit/:id', isAuthenticatedUser, notesController.getEdit);
router.get('/noteView/:id', isAuthenticatedUser, notesController.getNoteView);
router.get('/search', isAuthenticatedUser, notesController.getSearch);
router.get('/note', isAuthenticatedUser, notesController.searchNote);

router.post('/add', isAuthenticatedUser, upload.array('images'), notesController.postAdd);
router.put('/edit/:id', isAuthenticatedUser, upload.array('images'), notesController.putEdit);
router.delete('/delete/:id', isAuthenticatedUser, notesController.deleteNote);
router.post('/tag_delete/:id', isAuthenticatedUser, notesController.deleteTag);
router.post('/deleteimg/:id', isAuthenticatedUser, notesController.deleteImage);

module.exports = router;
