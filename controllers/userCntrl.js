const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel')
const { OTP } = require('../models/otpModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, generateverificationToken, generateOTP } = require('../utils/email')
const { resetPasswordEmail } = require('../utils/resetpasswordemail')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

        await sendVerificationEmail(email, verificationToken);

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

        const congratulationContent = `
      <h1 style="color: #008080; font-family: 'Arial', sans-serif; text-align: center;">Congratulations!</h1>
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px; font-family: 'Arial', sans-serif; color: #444; text-align: center;">You have successfully verified your email.</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #008080; color: #fff; font-size: 18px; font-family: 'Arial', sans-serif; text-decoration: none; padding: 10px 20px; border-radius: 5px; border: 2px solid #008080; transition: background-color 0.3s ease-in-out;">
            Go to Home Page
          </a>
        </div>
      </div>
    `;

        res.send(congratulationContent);

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


//send-reset-password-email
const sendResetPasswordEmail = async (req, res) => {

    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ mssg: 'Email does not exist' });
        } else {
            //logic to delete exisitng otp
            const otpexist = OTP.findOne({ email: req.body.email })
            if (otpexist) {
                await OTP.deleteMany({ email: req.body.email });
            }

            const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
            const otpcode = generateOTP();
            const otpData = new OTP({
                code: otpcode,
                email: req.body.email,
                expiration: expirationDate,
            });

            await otpData.save();
            await resetPasswordEmail(req.body.email, otpcode);

            res.status(200).json({ mssg: 'OTP sent successfully', otp: otpData });
        }
    } catch (error) {
        res.status(500).json({ mssg: 'Error' });
        console.log(error);
    }
};


const resetPassword = async (req, res) => {
    const { email, otpCode, password } = req.body;
    try {
        console.log(email, otpCode, password);
        let data = await OTP.findOne({ email, code: otpCode });
        console.log(data);


        if (!data) {
            return res.status(404).json({ mssg: 'Invalid OTP' });
        } else {
            let currentTime = new Date();
            if (currentTime > data.expiration) {
                res.status(401).json({ mssg: "Token Expired" });
            } else {
                let user = await User.findOne({ email });


                if (!user) {
                    res.status(404).json({ mssg: "User does not exist" });
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    user.password = hashedPassword;
                    await user.save();
                    res.status(200).json({ mssg: "Password changed successfully" });
                }
            }
        }
    } catch (error) {
        res.status(500).json({ mssg: 'Error' });
        console.log(error);
    }
}


module.exports = {
    userInfo,
    registerUser,
    loginUser,
    verifyemail,
    sendResetPasswordEmail,
    resetPassword


} 