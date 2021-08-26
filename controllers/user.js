const Post = require('../models/posts')
const Comment = require('../models/comments');
const User = require('../models/user')

//have to make and export user routes
//for profile changes/viewing each others profile

module.exports.renderRegister = (req, res) => {
    res.render('auth/register')
}

module.exports.makeAccount = async (req, res, next) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('auth/login')
}

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back to ShowApp')
    const redirectTo = req.session.returnTo || '/'
    delete req.session.returnTo;
    res.redirect(redirectTo)
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/')
}

//User profile routes

module.exports.profile = async (req, res) => {
    const { id } = req.params
    const currentUser = await User.findById(id)
    res.render('profile', { user: currentUser })
}