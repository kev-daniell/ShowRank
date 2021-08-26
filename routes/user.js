const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync')
const passport = require('passport')
const User = require('../models/user')
const user = require('../controllers/user')

router.route('/register')
    .get(user.renderRegister)
    .post(user.makeAccount)

router.route('/login')
    .get(user.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login)

router.get('/logout', user.logout)

router.get('/user/:id', catchAsync(user.profile))
module.exports = router;
