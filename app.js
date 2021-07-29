const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utilities/catchAsync')
const Joi = require('joi')

const Post = require('./models/posts')
const AppError = require('./utilities/AppError')
const Comment = require('./models/comments')

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

//Error checking middleware using JOI, every post needs a title to be created
const validatePost = (req, res, next) => {
    const postSchema = Joi.string().required()
    const { error } = postSchema.validate(req.body.title)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(`A Title is required for a Post, ${msg}`, 400)
    }
    else next()
}

//Routing to home page
app.get('/', (req, res) => {
    res.render('home', { viewMode })
})

//TRASH changing system
app.get('/change', (req, res) => {
    if (viewMode === "dark") viewMode = "light"; //This can be made way better
    else viewMode = "dark";
    res.redirect('/')
})

//All the commenting routes

app.post('/posts/:id/comment', async (req, res) => {
    const { text } = req.body;
    const { id } = req.params;
    // const newComment = new Comment({ author: author, text: text, post: id })
    // const currentPost = await Post.findById(id);
    // currentPost.comments.push(newComment);
    // await newComment.save()
    // await currentPost.save()
    res.redirect(`/posts/${id}`)
})



//All the posting routes
app.get('/posts/create', (req, res) => {
    res.render('create', { viewMode });
})

app.get('/posts', catchAsync(async (req, res) => {
    const posts = await Post.find()
    const length = posts.length - 1
    res.render('posts', { posts, viewMode, length })
}))


app.get('/posts/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    res.render('show', { viewMode, post: currentPost })
}))


app.get('/posts/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    res.render('edit', { viewMode, post: currentPost })
}))

app.post('/posts', validatePost, catchAsync(async (req, res) => {
    const { title, text, image } = req.body;

    const newPost = new Post({ author, title, text, image })
    await newPost.save()
    res.redirect('/posts')
}))

app.patch('/posts/:id', validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, text, image } = req.body;
    const currentPost = await Post.findByIdAndUpdate(id, { title: title, text: text, image: image }, { runValidators: true, useFindAndModify: false })
    await currentPost.save()
    res.redirect('/posts')
}))

app.delete('/posts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id, { useFindAndModify: false })
    res.redirect('/posts')
}))

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
