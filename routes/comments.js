const express = require('express')
const router = express.Router({ mergeParams: true })
const Joi = require('joi')

const catchAsync = require('../utilities/catchAsync')
const { validateComment, isLoggedIn, isCommentAuthor } = require('../middleware')
const comments = require('../controllers/comments')

router.post('/', isLoggedIn, validateComment, catchAsync(comments.makeComment))

router.patch('/:commentId', isLoggedIn, isCommentAuthor, validateComment, catchAsync())

router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(comments.destroy))

module.exports = router