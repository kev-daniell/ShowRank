const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

const AppError = require('./utilities/AppError')
const posts = require('./routes/posts')
const comments = require('./routes/comments')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate);

mongoose.connect('mongodb://localhost:27017/showApp', { useNewUrlParser: true, useUnifiedTopology: true, })
    .then(() => {
        console.log('connection open')
    })
    .catch(e => {
        console.log('ERROR OCCURED', e)
    })


let viewMode = "dark";
const author = "k6daniel";

//Routing to home page
app.get('/', (req, res) => {
    res.render('home', { viewMode })
})

//TRASH changing system
app.get('/change', (req, res) => {
    // if (viewMode === "dark") viewMode = "light"; //This can be made way better
    // else viewMode = "dark";
    res.redirect('/')
})


//All the commenting routes
app.use('/posts/:id/comment', comments)

//ADD IN EDITING RIGHT HERE --THE GET ROUTE AND THE PATCH ROUTE


//All the posting routes
app.use('/posts', posts)



app.all('*', (req, res, next) => {
    next(new AppError('Sorry Page Not Found', 404))
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Something went wrong';
    if (!err.status) err.status = 500;
    res.status(err.status).render('error', { err, viewMode })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
