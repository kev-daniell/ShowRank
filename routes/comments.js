const express = require('express')
const router = express.Router({ mergeParams: true })
const Joi = require('joi')

const catchAsync = require('../utilities/catchAsync')
const Comment = require('../models/comments')
const Post = require('../models/posts')
const User = require('../models/user')
const AppError = require('../utilities/AppError')
const { validateComment, isLoggedIn, isCommentAuthor } = require('../middleware')


router.post('/', isLoggedIn, validateComment, catchAsync(async (req, res) => {
    const { text } = req.body;
    const { id } = req.params;
    if (text.trim().length === 0) {
        req.flash('error', 'You need text in order to make a comment')
        return res.redirect(`/posts/${id}`)
    }
    const currentUser = await User.findById(req.user._id)
    const newComment = new Comment({ text: text })
    const currentPost = await Post.findById(id);
    currentPost.comments.push(newComment);
    currentUser.comments.push(newComment);
    newComment.post = currentPost;
    newComment.author = req.user._id
    await newComment.save()
    await currentPost.save()
    await currentUser.save()
    req.flash('success', 'Created new comment')
    res.redirect(`/posts/${id}`)
}))

router.patch('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    const { text } = req.body;
    if (text.trim().length === 0) {
        req.flash('error', 'You need text for a comment to exist')
        return res.redirect(`/posts/${id}`)
    }
    const currentComment = await Comment.findByIdAndUpdate(commentId, { text }, { runValidators: true })
    await currentComment.save()
    req.flash('success', 'Comment was edited')
    res.redirect(`/posts/${id}`)
}))

router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } }, { useFindAndModify: false })
    await User.findByIdAndUpdate(req.user._id, { $pull: { comments: commentId } }, { useFindAndModify: false })
    await Comment.findByIdAndDelete(commentId, { useFindAndModify: false })
    req.flash('success', 'Your comment has been deleted')
    res.redirect(`/posts/${id}`);
}))

module.exports = router