const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AsyncHandler = require('express-async-handler');

// Generate JWT
const generateToken =  (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

//@desc     Register New User
//@route    POST /api/users
//@access   Public
const registerUser = AsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if all fields are provided
    if(!name || !email || !password){
        res.status(400); //Bad Request
        throw new Error('Please provide all the fields');
    };

    //Check if user exists
    const userExists = await User.findOne({ email });

    if(userExists){
        res.status(400); //Bad Request
        throw new Error('User already exists');
    };

    //Create User
    const user = await User.create({
        name, 
        email,
        password,
    });

    //If user is created successfully, send back the user details and token
    if(user){
        res.status(201).json({ //201: Created
            _id: user._id,
            name: user.name,
            email: user.email,
            savedJobs: user.savedJobs,
            token: generateToken(user._id)
        });
    }else{
        res.status(400); //Bad Request
        throw new Error('Invalid email or password');
    }
});

//@desc     Login User
//@route    POST /api/users/login
//@access   Public
const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    //Check for password
    if(user && (await user.matchPassword(password))){ //matchPassword uses bcrypt.compare to compare the entered password with the hashed password. 
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            savedJobs: user.savedJobs,
            token: generateToken(user._id)
        });
    }else{
        res.status(401); //Unauthorized
        throw new Error('Invalid email or password');
    }
});



module.exports = {
    registerUser,
    loginUser
}