const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Comment = require('./comments')

const postSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String
    },
    image: [
        {
            url: String,
            filename: String,
        }
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
})

postSchema.post('findOneAndDelete', async (post) => {
    if (post.comments.length) {
        await Comment.deleteMany({ _id: { $in: post.comments } })
    }
})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;