
const mongoose = require('mongoose')
const Note = require('../models/noteModel')

const CommentSchema = mongoose.Schema({
    noteId: {
        type: mongoose.Types.ObjectId,
        ref: "Note"
    },
    user: {
        id: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        username: {
            type: String,

        }
    },
    comment: {
        type: String,
        required: true
    }

})

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Comment, CommentSchema }