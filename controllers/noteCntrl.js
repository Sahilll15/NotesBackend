const asyncHandler = require('express-async-handler');
const {Note} = require('../models/noteModel');
const {User} = require('../models/userModel');

const getAllNotes = asyncHandler(async(req,res)=>{

    const notes = await Notes.find();
    console.log(req.user);
    res.status.json(notes);
});


const addNotes = asyncHandler(async(req, res) => {

    const {name, subject, module, desc} = req.body;

    if(!req.file){
        console.log("Fuu");

    }
    console.log(req.user)
    if(!name || !subject || !module || !desc){
        res.status(403);
        throw new Error("All fields are mandatory");
    }
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
    user.save();

    res.status(201).json(newNote);
});

module.exports = {getAllNotes, addNotes};
