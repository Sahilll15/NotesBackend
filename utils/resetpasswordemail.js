require('dotenv').config();
const nodemailer = require('nodemailer');

const resetPasswordEmail = async (receipentEmail, otpcode) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        }
    });

    const emailcontent = `
    <h1 style="color: #008080; font-family: 'Arial', sans-serif; text-align: center;">NotesBeta</h1>
    <h1 style="color: #008080; font-family: 'Arial', sans-serif; text-align: center;">Reset Password</h1>
    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px; font-family: 'Arial', sans-serif; color: #444; text-align: center;">Your OTP for resetting password is:</p>
        <div style="text-align: center; margin-top: 20px;">
            <h1>${otpcode}</h1>
        </div>
    </div>
    `;
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: receipentEmail,
        subject: 'Reset Password',
        html: emailcontent
    });
}

module.exports = {
    resetPasswordEmail
}