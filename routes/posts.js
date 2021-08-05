const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const Post = require('../models/posts')
const Joi = require('joi')
const AppError = require('../utilities/AppError')

//Error checking middleware using JOI, every post needs a title to be created
const validatePost = (req, res, next) => {
    const postSchema = Joi.string().required()
    const { error } = postSchema.validate(req.body.title)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(`A Title is required for a Post, ${msg}`, 400)
    }
    else next()
}

viewMode = 'dark'
author = 'k6daniel'

router.get('/create', (req, res) => {
    res.render('create', { viewMode });
})

router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find().populate('comments')
    const length = posts.length - 1
    res.render('posts', { posts, viewMode, length })
}))


router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id).populate('comments')
    if (!currentPost) {
        req.flash('error', `Sorry we can't find that post`)
        return res.redirect('/posts')
    }
    res.render('show', { viewMode, post: currentPost })
}))


router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    if (!currentPost) {
        req.flash('error', `Sorry you can't edit that post because it does not exist`)
        return res.redirect('/posts')
    }
    res.render('edit', { viewMode, post: currentPost })
}))

router.post('/', validatePost, catchAsync(async (req, res) => {
    const { title, text, image } = req.body;
    if (title.trim().length === 0) throw new AppError('You CANNOT leave the title blank')
    const newPost = new Post({ author, title, text, image })
    await newPost.save()
    req.flash('success', 'You made a new post')
    res.redirect('/posts')
}))

router.patch('/:id', validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, text, image } = req.body;
    if (title.trim().length === 0) throw new AppError('You CANNOT leave the title blank')
    const currentPost = await Post.findByIdAndUpdate(id, { title: title, text: text, image: image }, { runValidators: true })
    await currentPost.save()
    req.flash('success', 'You updated your post')
    res.redirect(`/posts/${id}`)
}))



router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id)
    req.flash('success', 'Your post has been deleted')
    res.redirect('/posts')
}))

module.exports = router