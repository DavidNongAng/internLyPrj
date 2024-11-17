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
            success: true,
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
    console.log('Login attempt for:', email);

    // Check for user email
    const user = await User.findOne({ email });
    console.log('User found:', user ? user._id : 'No user found');

    //Check for password
    if(user && (await user.matchPassword(password))){ //matchPassword uses bcrypt.compare to compare the entered password with the hashed password. 
        const token = generateToken(user._id);
        console.log('JWT_SECRET used for token:', process.env.JWT_SECRET ? 'Is set' : 'Not set');
        console.log('Generated token:', token.substring(0, 20) + '...');
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            savedJobs: user.savedJobs,
            token: token
        });
    }else{
        res.status(401); //Unauthorized
        throw new Error('Invalid email or password');
    }
});

const getUserProfile = AsyncHandler(async (req, res) => {
    console.log('Profile request received');
    console.log('User from request:', req.user);

    if(!req.user || !req.user._id){
        console.log('No user in request');
        res.status(401); //Unauthorized
        throw new Error('Not authorized, no user found in request');
    }
    
    try{
        const user = await User.findById(req.user._id);
        console.log('User found in profile:', user ? 'Yes' : 'No');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
    
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    }catch(err){
        console.error('Error getting user profile:', err.message);
        res.status(500);
        throw new Error('Error fetching user profile');
    }
    
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
}
