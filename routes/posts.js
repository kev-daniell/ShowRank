const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const Post = require('../models/posts')
const User = require('../models/user')
const AppError = require('../utilities/AppError')
const { isAuthor, isLoggedIn, validatePost, saveUrl } = require('../middleware')


router.get('/create', isLoggedIn, (req, res) => {
    res.render('create');
})

router.get('/', saveUrl, catchAsync(async (req, res) => {
    const posts = await Post.find().populate('comments').populate('author')
    const length = posts.length - 1
    res.render('posts', { posts, length })
}))


router.get('/:id', saveUrl, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author')

    if (!currentPost) {
        req.flash('error', `Sorry we can't find that post`)
        return res.redirect('/posts')
    }
    res.render('show', { post: currentPost })
}))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
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

router.patch('/:id', isLoggedIn, isAuthor, validatePost, catchAsync(async (req, res) => {
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



router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { posts: id } }, { useFindAndModify: false })
    await Post.findByIdAndDelete(id)
    req.flash('success', 'Your post has been deleted')
    res.redirect('/posts')
}))

module.exports = router