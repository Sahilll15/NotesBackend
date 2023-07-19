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
        <h1 style="color: #008080; font-family: 'Arial', sans-serif; text-align: center;">Email Verification</h1>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
          <p style="font-size: 16px; font-family: 'Arial', sans-serif; color: #444; text-align: center;">Click the button below to verify your email:</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8000/api/v1/users/emailverify/${verificationToken}" style="display: inline-block; background-color: #008080; color: #fff; font-size: 18px; font-family: 'Arial', sans-serif; text-decoration: none; padding: 10px 20px; border-radius: 5px; border: 2px solid #008080; transition: background-color 0.3s ease-in-out;">
              Verify Email
            </a>
          </div>
        </div>
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

const generateOTP = () => {
    const otpLength = 6;
    const characters = '0123456789';
    let otpcode = '';
    for (let i = 0; i < otpLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otpcode += characters[randomIndex];
    }
    return otpcode;
}

module.exports = {
    generateverificationToken,
    sendVerificationEmail,
    generateOTP
}