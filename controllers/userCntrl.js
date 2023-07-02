const asyncHandler = require('express-async-handler');
const {User} = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const userInfo = asyncHandler(async (req,res) => {
    res.json(req.user);
});

const registerUser = asyncHandler(async(req,res)=>{

    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("All fields are mandatory baby");
    }

    const userAvailable = await User.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error(`User with ${email} already exist`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User.create({
        username,
        email,
        password: hashedPassword
    });

    if(user){
        res.status(201).json({_id: user.id, email: user.email});
    }else{
        res.status(500);
        throw new Error("Something went wrong");
    }
});


const loginUser  = asyncHandler(async (req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const user = await User.findOne({email});
    
    if(!user){
        res.status(404);
        throw new Error(`User with this ${email} does not exist`);
    }

    if(user && await bcrypt.compare(password, user.password)){
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "20m"});
        res.status(200).json({accessToken});
    }else{
        res.status(400);
        throw new Error("Password is not valid");
    }

});





       



module.exports = {
    userInfo,
    registerUser,
    loginUser,

}