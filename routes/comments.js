const express = require('express')
const router = express.Router({ mergeParams: true })
const Joi = require('joi')
const catchAsync = require('../utilities/catchAsync')
const { validateComment, isLoggedIn, isCommentAuthor, postDate } = require('../middleware')
const comments = require('../controllers/comments')

router.post('/', isLoggedIn, validateComment, postDate, catchAsync(comments.makeComment))

router.route('/:commentId')
    .patch(isLoggedIn, isCommentAuthor, validateComment, postDate, catchAsync(comments.editComment))
    .delete(isLoggedIn, isCommentAuthor, catchAsync(comments.destroy))


module.exports = router