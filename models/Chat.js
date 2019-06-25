let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ChatSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Chat', ChatSchema);