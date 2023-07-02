const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        lowercase: true,
        trim: true,
        minLength: 5,
        maxLength: 50,

    },
    uploadedAt: {
        type: Date,
        default: Date.now()
    },

    acceptedStatus: {
        type: Boolean,
        default: false
    },

    subject:{
        type: mongoose.Types.ObjectId,
        ref : "Subject",
        required: [true, "Subject must be provided"]
    },

    module:{
        type: mongoose.Types.ObjectId,
        ref: "Module",
        required: [true, "Module must be provided"]
    },

    purchased: [{
        type : mongoose.Types.ObjectId,
        ref : "User" 
    }],

    likes: [{
        type : mongoose.Types.ObjectId,
        ref : "User" 
    }],

    desc: {
        type: String,
        minLength: 10,
        maxLength: 250,
        required: [true, "Desc must be provided"]
    },

    author: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    file: {
        type: String,
        required: [true, "Can't upload a note without a file"]
    }


});

const Note = mongoose.model("Note", noteSchema);
module.exports = {Note, noteSchema}