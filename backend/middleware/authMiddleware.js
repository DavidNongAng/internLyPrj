const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            // Get token from header
            token = req.headers.authorization.split(' ')[1]; //splits the token from 'bearer' part.

            // Verify token 
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password'); //select('-password') excludes the password from the response.

            next(); //Move to the next middleware
        }catch(err){
            console.error(err);
            res.status(401); //Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    if(!token){
        res.status(401);
        throw new Error('Not authorized, no token');
    }
}

module.exports = {
    protect
}