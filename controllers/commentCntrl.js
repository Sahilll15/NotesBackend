const { Comment } = require('../models/commentModel');
const { Note } = require('../models/noteModel');
const { User } = require('../models/userModel');



const createComment = async (req, res) => {
    const { noteId } = req.params;
    const { comment } = req.body;
    try {
        if (!comment) {
            res.status(401).json({ message: "comment is required" })
        }
        const user = req.user.id;
        const ExistingUSer = await User.findById(user);
        if (!ExistingUSer) {
            res.status(401).json({ message: "user not found" })
        }
        const newCommnet = await Comment.create({
            noteId: noteId,
            comment: comment,
            user: user
        })

        newCommnet.save();
        res.status(200).json({ message: "comment added succesfully", comment: newCommnet })
    } catch (error) {
        console.log(error)
        res.status(401).json(error)
    }
}


const getCommentsByNoteId = async (req, res) => {
    const { noteId } = req.params;
    try {
        console.log(noteId)
        const note = await Note.findById(noteId);
        if (!note) {
            res.status(401).json({ message: "post not found" })
        }

        const comments = await Comment.find({ noteId: noteId }).populate('user')
        const qty = comments.length

        res.status(200).json({ message: "comments succesfully fetched", comments: comments, qty: qty })
    } catch (error) {
        res.status(401).json(error)
    }
}

module.exports = {
    getCommentsByNoteId, createComment
}