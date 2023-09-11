const Comment = require('../models/commentModel');
const { Note } = require('../models/noteModel');
const { User } = require('../models/userModel');



const creatCommnet = async (req, res) => {
    const { NoteId } = req.params;
    const { comment } = req.body;
    try {
        const user = req.user._id;
        const ExistingUSer = await User.findById(user);
        if (!ExistingUSer) {
            res.status(401).json({ mssg: "user not found" })
        }
        const newCommnet = await Comment.create({
            noteId: NoteId,
            comment: comment,
            user: {
                id: user,
                username: ExistingUSer.username
            }
        })

        newCommnet.save();
        res.status(200).json({ mssg: "commnet added succesfully", comment: comment })
    } catch (error) {
        res.status(401).json(error)
    }
}


const getComments = async (req, res) => {
    const { NoteId } = req.params;
    try {
        const note = await Note.findById(NoteId);
        if (!note) {
            res.status(401).json({ mssg: "post not found" })
        }

        const comments = await Comment.find({ noteId: NoteId })
        const qty = comments.length

        res.status(200).json({ mssg: "comments succesfully fetched", comments: comments })
    } catch (error) {
        res.status(401).json(error)
    }
}

module.exports = {
    getComments, creatCommnet
}