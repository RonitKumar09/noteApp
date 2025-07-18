const mongoose = require('mongoose');

let noteSchema = new mongoose.Schema({
    title: String,
    note: String,
    tags: [String],
    imgUrl: [String],
    author: Object
});
module.exports = mongoose.model('Note', noteSchema);
