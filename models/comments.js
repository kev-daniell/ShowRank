const mongoose = require('mongoose');
const Schema = mongoose.Schema;

commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    text: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment;


