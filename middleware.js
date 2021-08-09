const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in')
        res.redirect('/login')
    } else next()
}

module.exports = isLoggedIn