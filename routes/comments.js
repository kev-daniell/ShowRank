const express = require('express')
const router = express.Router({ mergeParams: true })
const Joi = require('joi')
const catchAsync = require('../utilities/catchAsync')
const { validateComment, isLoggedIn, isCommentAuthor } = require('../middleware')
const comments = require('../controllers/comments')

router.post('/', isLoggedIn, validateComment, catchAsync(comments.makeComment))

router.route('/:commentId')
    .patch(isLoggedIn, isCommentAuthor, validateComment, catchAsync())
    .delete(isLoggedIn, isCommentAuthor, catchAsync(comments.destroy))


module.exports = router