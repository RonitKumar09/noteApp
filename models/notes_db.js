const mongoose = require('mongoose');

let noteSchema = new mongoose.Schema({
    title: String,
    note: String,
    tags: Object,
    imgUrl: Object
});
module.exports = mongoose.model('note', noteSchema);