const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users - List all users (username and email only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'username email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 