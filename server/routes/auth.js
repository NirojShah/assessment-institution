const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Quick admin creation if no users exist (for easy testing without manual seed)
    const count = await User.countDocuments();
    if (count === 0 && email === 'admin@edumerge.com') {
      await User.create({
        name: 'Super Admin',
        email: 'admin@edumerge.com',
        password: password || 'admin123',
        role: 'Admin'
      });
      await User.create({
        name: 'Officer John',
        email: 'officer@edumerge.com',
        password: password || 'officer123',
        role: 'Admission_Officer'
      });
      await User.create({
        name: 'Manager Ali',
        email: 'management@edumerge.com',
        password: password || 'management123',
        role: 'Management'
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
