let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    chat: {
        type: Schema.ObjectId,
        ref: 'Chat'
    }
});

module.exports = mongoose.model('Message', MessageSchema);