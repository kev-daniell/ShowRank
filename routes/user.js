const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync')
const passport = require('passport')
const User = require('../models/user')
const user = require('../controllers/user')

router.route('/register')
    .get(catchAsync(user.renderRegister))
    .post(catchAsync(user.makeAccount))

router.route('/login')
    .get(catchAsync(user.renderLogin))
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login)

router.get('/logout', user.logout)

module.exports = router;
