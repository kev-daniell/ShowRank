const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const { isAuthor, isLoggedIn, validatePost, saveUrl } = require('../middleware')
const post = require('../controllers/posts')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
router.route('/')
    .get(saveUrl, catchAsync(post.allPosts))
    // .post(isLoggedIn, validatePost, catchAsync(post.postNewPost))
    .post(upload.single('image'), (req, res) => {
        console.log(req.body, req.file)
        res.send('it worked')
    })
router.get('/create', isLoggedIn, post.createForm)

router.route('/:id')
    .get(saveUrl, catchAsync(post.singlePost))
    .patch(isLoggedIn, isAuthor, validatePost, catchAsync(post.patchEdit))
    .delete(isLoggedIn, isAuthor, catchAsync(post.destroy))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(post.editForm))


module.exports = router