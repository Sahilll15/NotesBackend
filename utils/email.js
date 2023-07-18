const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
require('dotenv').config();

const secret_key = process.env.ACCESS_TOKEN_SECRET;



const generateverificationToken = (email) => {
    console.log(secret_key)
    return jwt.sign({ email: email }, secret_key, { expiresIn: '1d' })
}


const sendVerificationEmail = async (recipientEmail, verificationToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }

        })

        const emailcontent = `
        <h1>Email Verification</h1>
      <p>Click the following link to verify your email:</p>
      <a href="https://localhost:8000/api/v1/users/verify_email?token=${verificationToken}">Verify Email</a>

        `
        console.log(process.env.EMAIL + "email this is")

        await transporter.sendMail({
            from: 'sahilchalke1011@gmail.com',
            to: recipientEmail,
            subject: 'Email Verification',
            html: emailcontent
        })

        console.log("Verification email has been sent");

    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}

module.exports = {
    generateverificationToken,
    sendVerificationEmail
}