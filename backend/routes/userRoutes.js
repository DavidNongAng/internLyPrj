const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

router.get('/debug/:id', async (req, res) => {
    try {
        console.log('Debugging user ID:', req.params.id);
        const user = await User.findById(req.params.id);
        console.log('Debug found user:', user ? 'Yes' : 'No');
        
        res.json({
            exists: !!user,
            id: req.params.id,
            user: user ? {
                _id: user._id,
                email: user.email,
                name: user.name
            } : null
        });
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});


module.exports = router;