const asyncHandler = require('express-async-handler');
const { Note } = require('../models/noteModel');
const { User } = require('../models/userModel');

const getAllNotes = asyncHandler(async (req, res) => {

    const notes = await Notes.find();
    console.log(req.user);
    res.status.json(notes);
});


const addNotes = asyncHandler(async (req, res) => {

    const { name, subject, module, desc } = req.body;

    // if(!name || !subject || !module || !desc || !req.file){
    //     res.status(403);
    //     throw new Error("All fields are mandatory");
    // }

    const newNote = await Note.create({
        name,
        subject,
        module,
        desc,
        author: req.user.id,
        file: req.file.path
    });

    const user = await User.findById(req.user.id);
    await user.notesUploaded.push(newNote);
    let coinsU = parseInt(user.coins)
    await user.updateOne({ coins: coinsU + 5 });
    user.save();

    res.status(201).json(newNote);
});

const fs = require('fs');
const path = require('path');

const deleteNote = asyncHandler(async (req, res) => {

    let { id: noteId } = req.params;
    let note = await Note.findById({ _id: noteId }).populate("author");
    if (!note) {
        res.status(404);
        throw new Error(`Unable to find note with id ${noteId}`);
    }
    note.author.notesUploaded.pull(note);
    await note.author.save();
    fs.unlink(path.join(__dirname, '..', note.file), (err) => {
        if (err) {
            throw err;
        }
    })
    note = await Note.findOneAndDelete({ _id: noteId })

    res.status(200).json({ "message": "Note successfully deleted" });


});

const getSingleNote = asyncHandler(async (req, res) => {
    let { id: noteId } = req.params;
    let note = await Note.findById({ _id: noteId }).populate("author");
    if (!note) {
        res.status(404);
        throw new Error(`Unable to find note with id ${noteId}`);
    }





})


module.exports = { getAllNotes, addNotes, deleteNote, getSingleNote };
