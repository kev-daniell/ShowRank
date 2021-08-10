const express = require('express')
const router = express.Router({ mergeParams: true })
const Joi = require('joi')

const catchAsync = require('../utilities/catchAsync')
const Comment = require('../models/comments')
const Post = require('../models/posts')
const AppError = require('../utilities/AppError')

const validateComment = (req, res, next) => {
    const commentSchema = Joi.string().required()
    const { error } = commentSchema.validate(req.body.text)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(`Text is required to make a comment, ${msg}`, 400)
    }
    else next()
}


router.post('/', validateComment, catchAsync(async (req, res) => {
    const { text } = req.body;
    const { id } = req.params;
    if (text.trim().length === 0) {
        req.flash('error', 'You need text in order to make a comment')
        return res.redirect(`/posts/${id}`)
    }
    const author = req.user._id
    const newComment = new Comment({ author, text: text })
    const currentPost = await Post.findById(id);
    currentPost.comments.push(newComment);
    newComment.post = currentPost;
    await newComment.save()
    await currentPost.save()
    req.flash('success', 'Created new comment')
    res.redirect(`/posts/${id}`)
}))



router.delete('/:commentId', catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } }, { useFindAndModify: false })
    await Comment.findByIdAndDelete(commentId, { useFindAndModify: false })
    req.flash('success', 'Your comment has been deleted')
    res.redirect(`/posts/${id}`);
}))

module.exports = router