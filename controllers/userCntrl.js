const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, generateverificationToken } = require('../utils/email')
const bodyParser = require('body-parser');

const userInfo = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Authentication successful', user: req.user });
});



const registerUser = asyncHandler(async (req, res) => {

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400);
            throw new Error("All fields are mandatory baby");
        }

        const userAvailable = await User.findOne({ email });
        if (userAvailable) {
            res.status(400);
            throw new Error(`User with ${email} already exist`);
        }
        console.log("hi")
        const verificationToken = generateverificationToken(email);
        console.log("hello")
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken
        });

        sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Registration successful. Please check your email for verification.', verificationToken: verificationToken });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during registration.' });
        console.log(error);

    }
});

const verifyemail = async (req, res) => {
    try {
        const tokenId = req.params.tokenId;
        const user = await User.findOne({ verificationToken: tokenId });

        if (!user) {
            return res.status(404).json({ error: 'Invalid verification token.' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
        res.json({ message: 'Email verification successful. You can now log in.' });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during email verification.' });
        console.log(error);
    }
};



const loginUser = asyncHandler(async (req, res) => {
    console.log(process.env.ACCESS_TOKEN_SECRET)
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error(`User with this ${email} does not exist`);
    }

    if (!user.isVerified) {
        res.status(403);
        throw new Error("Email not verified. Please verify your email before logging in.");
    }

    if (user && await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token: accessToken, msg: "User logged in" });
    } else {
        res.status(400);
        throw new Error("Password is not valid");
    }
});



module.exports = {
    userInfo,
    registerUser,
    loginUser,
    verifyemail


}