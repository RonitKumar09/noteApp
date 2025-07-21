const Note = require('../models/notes_db');
const fs = require('fs');

module.exports = {
    getHome: async (req, res) => {
        try {
            const notes = await Note.find();
            res.render('index', { notes });
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');
        }
    },
    getAdd: (req, res) => res.render('add'),
    getEdit: async (req, res) => {
        try {
            const notes = await Note.findById(req.params.id);
            res.render('edit', { notes });
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        }
    },
    getNoteView: async (req, res) => {
        try {
            const notes = await Note.findById(req.params.id);
            res.render('noteView', { note: notes });
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        }
    },
    getSearch: (req, res) => {
        res.render('search', { notes: [], flag: false });
    },
    searchNote: async (req, res) => {
        let SearchQuery = req.query.noteTitle.replace('*', '');
        if (SearchQuery) {
            try {
                const notes = await Note.find({
                    $or: [
                        { note: { $regex: new RegExp(req.query.noteTitle), $options: 'im' } },
                        { title: { $regex: new RegExp(req.query.noteTitle), $options: 'im' } },
                        { tags: { $regex: new RegExp(req.query.noteTitle), $options: 'im' } }
                    ]
                });
                res.render('search', { notes, flag: true });
            } catch (err) {
                req.flash('error_msg', 'ERROR: ' + err);
                res.redirect('/home');
            }
        } else {
            res.redirect('/search');
        }
    },
    postAdd: async (req, res) => {
        const files = req.files;
        let url = [];
        if (files) {
            files.forEach(file => {
                url.push(file.path.replace('public', ''));
            });
        }
        let arr = req.body.tags.trim().split(",");
        arr = Array.from(new Set(arr));
        let newNote = {
            title: req.body.title,
            tags: arr,
            note: req.body.note,
            imgUrl: url,
            author: [req.body.author]
        };
        try {
            await Note.create(newNote);
            req.flash('success_msg', `${req.body.title} Added Successfully`);
            res.redirect('/home');
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        }
    },
    putEdit: async (req, res) => {
        let url = [];
        let author = req.body.author;
        const files = req.files;
        let arr = req.body.tags.trim().split(",");
        arr = Array.from(new Set(arr));
        let SearchQuery = { _id: req.params.id };
        if (files) {
            files.forEach(file => {
                url.push(file.path.replace('public', ''));
            });
        }
        try {
            await Note.updateOne(SearchQuery, {
                $set: {
                    title: req.body.title,
                    tags: arr,
                    note: req.body.note,
                },
                $push: { imgUrl: { $each: url } },
                $addToSet: { author: author }
            });
            req.flash('success_msg', `${req.body.title} Updated Successfully`);
            res.redirect('/home');
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        }
    },
    deleteNote: async (req, res) => {
        let SearchQuery = { _id: req.params.id };
        try {
            await Note.deleteOne(SearchQuery);
            req.flash('error_msg', `Deleted Successfully`);
            res.redirect('/home');
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        }
    },
    deleteTag: async (req, res) => {
        let SearchQuery = { _id: req.params.id };
        let tag = req.body.tag;
        try {
            await Note.updateOne(SearchQuery, { $pull: { tags: tag } });
            res.redirect('back');
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');
        }
    },
    deleteImage: async (req, res) => {
        let SearchQuery = { _id: req.params.id };
        let url = req.body.url;
        try {
            fs.unlinkSync('./public/' + url);
        } catch (err) {
            // Suppress ENOENT (file not found) errors
            if (err.code !== 'ENOENT') {
                req.flash('error_msg', 'ERROR: ' + err);
                return res.redirect('back');
            }
            // else, file already gone, continue
        }
        try {
            await Note.updateOne(SearchQuery, { $pull: { imgUrl: url } });
            res.redirect('back');
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('back');
        }
    }
};
