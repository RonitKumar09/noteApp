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
            let showPopup = false;
            let originalAuthor = '';
            if (notes && notes.author && req.user && req.user.name) {
                if (Array.isArray(notes.author)) {
                    if (!notes.author.includes(req.user.name)) {
                        showPopup = true;
                        originalAuthor = Array.isArray(notes.author) ? notes.author[0] : notes.author;
                        // Append current user to author list
                        await Note.updateOne({ _id: req.params.id }, { $addToSet: { author: req.user.name } });
                        notes.author.push(req.user.name);
                    }
                } else if (notes.author !== req.user.name) {
                    showPopup = true;
                    originalAuthor = notes.author;
                    await Note.updateOne({ _id: req.params.id }, { $addToSet: { author: req.user.name } });
                    notes.author = [notes.author, req.user.name];
                }
            }
            res.render('edit', { notes, showPopup, originalAuthor });
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
        // Title validation
        if (!req.body.title || req.body.title.trim().length === 0) {
            req.flash('error_msg', 'Title cannot be empty');
            return res.redirect('back');
        }
        let arr = req.body.tags.trim().split(",").map(t => t.trim()).filter(t => t.length > 0);
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
        // Title validation
        if (!req.body.title || req.body.title.trim().length === 0) {
            req.flash('error_msg', 'Title cannot be empty');
            return res.redirect('back');
        }
        let arr = req.body.tags.trim().split(",").map(t => t.trim()).filter(t => t.length > 0);
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
            const note = await Note.findById(req.params.id);
            if (!note) {
                req.flash('error_msg', 'Note not found');
                return res.redirect('/home');
            }
            // Only allow delete if current user is the original creator (first author)
            let originalAuthor = Array.isArray(note.author) ? note.author[0] : note.author;
            if (!originalAuthor || req.user.name !== originalAuthor) {
                req.flash('error_msg', 'You are not allowed to delete this note. Only the original creator can delete.');
                return res.redirect('/home');
            }
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
            const note = await Note.findById(req.params.id);
            if (!note) {
                req.flash('error_msg', 'Note not found');
                return res.redirect('/home');
            }
            if (!note.author || (Array.isArray(note.author) ? !note.author.includes(req.user.name) : note.author !== req.user.name)) {
                req.flash('error_msg', 'You are not allowed to delete tags from this note.');
                return res.redirect('/home');
            }
            await Note.updateOne(SearchQuery, { $pull: { tags: tag } });
            res.redirect('/home'); // Redirect to home to refresh table
        } catch (err) {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/home');
        }
    },
    deleteImage: async (req, res) => {
        let SearchQuery = { _id: req.params.id };
        let url = req.body.url;
        try {
            const note = await Note.findById(req.params.id);
            if (!note) {
                req.flash('error_msg', 'Note not found');
                return res.redirect('back');
            }
            if (!note.author || (Array.isArray(note.author) ? !note.author.includes(req.user.name) : note.author !== req.user.name)) {
                req.flash('error_msg', 'You are not allowed to delete images from this note.');
                return res.redirect('back');
            }
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
