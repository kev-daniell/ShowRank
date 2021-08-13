const Post = require("./models/posts")
const mongoose = require('mongoose')
const Comment = require('./models/comments')
const Joi = require('joi')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in')
        res.redirect('/login')
    } else next()
}

module.exports.saveUrl = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
    }
    next();
}


module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    if (currentPost.author.equals(req.user._id)) {
        next()
    }
    else {
        req.flash('error', 'You do not have permission to do that')
        res.redirect(`/posts/${id}`)
    }
}

module.exports.isCommentAuthor = async (req, res, next) => {
    const { id, commentId } = req.params;
    const currentComment = await Comment.findById(commentId)
    if (req.user._id && currentComment.author.equals(req.user._id)) {
        next();
    } else {
        req.flash('error', 'You do not have permission to do that')
        res.redirect(`/posts/${id}`)
    }
}

//Error checking middleware using JOI, every post needs a title to be created
module.exports.validatePost = (req, res, next) => {
    const postSchema = Joi.string().required()
    const { error } = postSchema.validate(req.body.title)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(`A Title is required for a Post, ${msg}`, 400)
    }
    else next()
}

module.exports.validateComment = (req, res, next) => {
    const commentSchema = Joi.string().required()
    const { error } = commentSchema.validate(req.body.text)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(`Text is required to make a comment, ${msg}`, 400)
    }
    else next()
}
