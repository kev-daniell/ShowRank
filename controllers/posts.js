const Post = require('../models/posts');
const User = require('../models/user')
const { cloudinary } = require('../cloudinary/index')

module.exports.allPosts = async (req, res) => {
    const posts = await Post.find().populate('comments').populate('author')
    const length = posts.length - 1
    res.render('posts', { posts, length })
}

module.exports.createForm = (req, res) => {
    res.render('create');
}

module.exports.singlePost = async (req, res, next) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author')

    if (!currentPost) {
        req.flash('error', `Sorry we can't find that post`)
        return res.redirect('/posts')
    } else {
        res.render('show', { post: currentPost })
    }
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id).populate('author')
    if (!currentPost) {
        req.flash('error', `Sorry you can't edit that post because it does not exist`)
        return res.redirect('/posts')
    }
    res.render('edit', { post: currentPost })
}

module.exports.postNewPost = async (req, res) => {
    const { title, text } = req.body;
    if (title.trim().length === 0) {
        req.flash('error', 'You CANNOT leave the title empty')
        return res.redirect('/posts/create')
    }
    postDate = req.body.date
    const author = req.user._id
    const cUser = await User.findById(author)
    const newPost = new Post({ author, title, text, postDate })
    newPost.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    cUser.posts.push(newPost)
    await newPost.save()
    await cUser.save()
    req.flash('success', 'You made a new post')
    res.redirect('/posts')
}

module.exports.patchEdit = async (req, res) => {
    const { id } = req.params;
    const { title, text } = req.body;
    if (title.trim().length === 0) {
        req.flash('error', 'You CANNOT leave the title empty')
        return res.redirect(`/posts/${id}/edit`)
    }
    const currentPost = await Post.findByIdAndUpdate(id, { title, text }, { runValidators: true })
    currentPost.postDate = `${req.body.date} (edited)`
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    currentPost.image.push(...images)
    await currentPost.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await currentPost.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'You updated your post')
    res.redirect(`/posts/${id}`)
}

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const currentPost = await Post.findById(id)
    if (currentPost.image) {
        for (let img of currentPost.image) {
            await cloudinary.uploader.destroy(img.filename)
        }
    }
    await User.findByIdAndUpdate(req.user._id, { $pull: { posts: id } }, { useFindAndModify: false })
    await Post.findByIdAndDelete(id)
    req.flash('success', 'Your post has been deleted')
    res.redirect('/posts')
}