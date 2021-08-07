const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync')
const passport = require('passport')
const User = require('../models/user')
const Post = require('../models/posts')
const Comment = require('../models/comments')

//base of this router will be '/user'
router.get('/register', (req, res) => {
    res.render('auth/register')
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        console.log(registeredUser);
        req.flash('success', 'Welcome to ShowApp')
        res.redirect('/')
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    req.flash('success', 'Welcome back to ShowApp')
    res.redirect('/')
})

module.exports = router;
