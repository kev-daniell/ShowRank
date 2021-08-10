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

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to ShowApp')
            res.redirect('/')
        })
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
    const redirectTo = req.session.returnTo || '/'
    delete req.session.returnTo;
    res.redirect(redirectTo)
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/')
})

module.exports = router;
