const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Comment = require('./comments')

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

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
    postDate: String,
    image: [imageSchema],
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