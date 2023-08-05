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
        type: Number,
        default: 100
    },
    role: {
        type: String,
        enum: ['user', 'superuser'],
        default: 'user'
    },
    isVerified:
    {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
},
    { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = { User, userSchema }