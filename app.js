const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Post = require('./models/posts')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

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


let viewMode = "light";
const author = "k6daniel";

app.get('/', (req, res) => {
    res.render('home', { viewMode })
})

//TRASH changing system
app.get('/change', (req, res) => {
    if (viewMode === "dark") viewMode = "light"; //This can be made way better
    else viewMode = "dark";
    res.redirect('/')
})

app.get('/posts/create', (req, res) => {
    res.render('create', { viewMode });
})

app.get('/posts', async (req, res) => {
    const posts = await Post.find()
    const length = posts.length - 1
    res.render('posts', { posts, viewMode, length })
})


app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    res.render('show', { viewMode, post: currentPost })
})


app.get('/posts/:id/edit', async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    res.render('edit', { viewMode, post: currentPost })
})

app.post('/posts', async (req, res) => {
    const { title, text } = req.body
    const newPost = new Post({ author, title, text })
    await newPost.save()
    res.redirect('/posts')
})

app.patch('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, text } = req.body;
    const currentPost = await Post.findByIdAndUpdate(id, { title: title, text: text }, { runValidators: true, useFindAndModify: false })
    await currentPost.save()
    res.redirect('/posts')
})

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id, { useFindAndModify: false })
    res.redirect('/posts')
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
