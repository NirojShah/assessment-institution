const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/programs
// @desc    Get all programs
// @access  Private (All authenticated)
router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find({});
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/programs
// @desc    Create a new program (Master Setup)
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const program = new Program(req.body);
    const createdProgram = await program.save();
    res.status(201).json(createdProgram);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create program', error: err.message });
  }
});

module.exports = router;
