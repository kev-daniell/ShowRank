const mongoose = require('mongoose');
const Post = require('../models/posts')
const User = require('../models/user')

mongoose.connect('mongodb://localhost:27017/showApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('connection open')
    }).catch(e => {
        console.log('an error occured', e)
    })

const seedPosts = [
    {
        author: '611e7e1d06dbe77ca1d710b5',
        title: 'AMC TO THE MOON',
        text: 'amc and gme r gonna go to the moon, diamond hands only baby',
    },
    {
        author: '611e7e1d06dbe77ca1d710b5',
        title: 'What is life',
        text: 'not sure what life is anymore',
        image: {
            url: 'https://i.imgflip.com/2hrn59.jpg',
            filename: 'shouldNotDelete'
        }
    },
    {
        author: '611e7e1d06dbe77ca1d710b5',
        title: 'Mai bad as hell',
        text: 'felt the need to remind everyone that mai is bad as hell',
        image: {
            url: 'https://i.pinimg.com/originals/84/58/61/84586164248f9862b4117b2c2ab540aa.jpg',
            filename: 'dontdeletepls'
        }
    },
]

Post.insertMany(seedPosts)
    .then(res => {
        console.log(res)
    }).catch(e => {
        console.log(e)
    })
