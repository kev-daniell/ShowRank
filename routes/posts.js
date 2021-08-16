const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const { isAuthor, isLoggedIn, validatePost, saveUrl } = require('../middleware')
const post = require('../controllers/posts')


router.get('/', saveUrl, catchAsync(post.allPosts))

router.get('/create', isLoggedIn, post.createForm)

router.get('/:id', saveUrl, catchAsync(post.singlePost))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(post.editForm))

router.post('/', isLoggedIn, validatePost, catchAsync(post.postNewPost))

router.patch('/:id', isLoggedIn, isAuthor, validatePost, catchAsync(post.patchEdit))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(post.destroy))

module.exports = router