const mongoose = require('mongoose');

let noteSchema = new mongoose.Schema({
    title: String,
    note: String,
    tags: Object
});
module.exports = mongoose.model('note', noteSchema);