const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        required: true,
        type: String,
        unique: true,
    },
    viewMode: {
        type: String,
        required: true,
        enum: ['dark', 'light'],
        default: 'light'
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    createDate: String,
})

userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', userSchema)
module.exports = User;

// const userSchema = new Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     viewMode: {
//         type: String,
//         required: true,
//         enum: ['dark', 'light'],
//         default: 'light'
//     },
//     posts: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: 'Post'
//         }
//     ],
//     comments: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: 'Comment'
//         }
//     ]
// })