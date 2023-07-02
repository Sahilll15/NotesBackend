const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"]
    },
    email: {
        type: String,
        required: [true, "Please provide a email"],
        unique: [true, "This email is already in use"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },

    notesUploaded: [{
        type: mongoose.Types.ObjectId,
        ref: "Notes"
    }],

    coins: {
        type: Number
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);