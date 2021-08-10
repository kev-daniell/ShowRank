const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const Post = require('../models/posts')
const User = require('../models/user')
const Joi = require('joi')
const AppError = require('../utilities/AppError')
const isLoggedIn = require('../middleware')
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

router.get('/create', isLoggedIn, (req, res) => {
    res.render('create');
})

router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find().populate('comments').populate('author')
    const length = posts.length - 1
    res.render('posts', { posts, length })
}))


router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id).populate('comments').populate('author')
    console.log(currentPost)
    if (!currentPost) {
        req.flash('error', `Sorry we can't find that post`)
        return res.redirect('/posts')
    }
    res.render('show', { post: currentPost })
}))


router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    if (!currentPost) {
        req.flash('error', `Sorry you can't edit that post because it does not exist`)
        return res.redirect('/posts')
    }
    res.render('edit', { post: currentPost })
}))

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {
    const { title, text, image } = req.body;
    if (title.trim().length === 0) {
        req.flash('error', 'You CANNOT leave the title empty')
        return res.redirect('/posts/create')
    }
    const author = req.user._id
    const cUser = await User.findById(author)
    const newPost = new Post({ author, title, text, image })
    cUser.posts.push(newPost)
    await newPost.save()
    await cUser.save()
    req.flash('success', 'You made a new post')
    res.redirect('/posts')
}))

router.patch('/:id', validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, text, image } = req.body;
    if (title.trim().length === 0) {
        req.flash('error', 'You CANNOT leave the title empty')
        return res.redirect(`/posts/${id}/edit`)
    }
    const currentPost = await Post.findByIdAndUpdate(id, { title, text, image }, { runValidators: true })
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