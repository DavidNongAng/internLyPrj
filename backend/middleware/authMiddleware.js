const jwt = require('jsonwebtoken');
const AsyncHandler = require('express-async-handler');
const User = require('../models/userModel');


const protect = AsyncHandler(async (req, res, next) => {
    let token;
    console.log('Starting auth check...');

    //Check if token is in the header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            // Get token from header
            token = req.headers.authorization.split(' ')[1]; //splits the token from 'bearer' part.
            console.log('Processing token...');

            // Verify token 
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded, looking for user:', decoded.id);

            // Get user from token and explicitly set it.
            const user = await User.findById(decoded.id).select('-password'); //select('-password') excludes the password from the response.

            //Check if user exists
            if(!user){
                console.log('No user found with token ID');
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // If we get here, we found the user
            console.log('User found successfully:', user._id);
            req.user = user;
            next();

        }catch(err){
            console.err('Auth error:', err.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
                error: err.message
            });
        }
    }else{
        console.log('No authorization header found');
        return res.status(401).json({
            success: false,
            message: 'No authorization token provided'
        });
    }
});

module.exports = {
    protect
}
