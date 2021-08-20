const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const { isAuthor, isLoggedIn, validatePost, saveUrl } = require('../middleware')
const post = require('../controllers/posts')
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })


router.route('/')
    .get(saveUrl, catchAsync(post.allPosts))
    .post(isLoggedIn, upload.array('image'), validatePost, catchAsync(post.postNewPost))

router.get('/create', isLoggedIn, post.createForm)

router.route('/:id')
    .get(saveUrl, catchAsync(post.singlePost))
    .patch(isLoggedIn, isAuthor, upload.array('image'), validatePost, catchAsync(post.patchEdit))
    .delete(isLoggedIn, isAuthor, catchAsync(post.destroy))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(post.editForm))


module.exports = router