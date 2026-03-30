const express = require('express');
const router = express.Router();
const Applicant = require('../models/Applicant');
const Program = require('../models/Program');
const Sequence = require('../models/Sequence');
const { protect, authorize } = require('../middleware/auth');

// Helper to generate admission number safely
async function getNextSequenceValue(sequenceName) {
  const sequenceDoc = await Sequence.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDoc.sequence_value;
}

// Get all applicants
router.get('/', protect, async (req, res) => {
  try {
    const applicants = await Applicant.find({}).populate('program', 'name institution totalIntake');
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create applicant
router.post('/', protect, authorize('Admission_Officer', 'Admin'), async (req, res) => {
  try {
    const applicant = new Applicant(req.body);
    const createdApplicant = await applicant.save();
    res.status(201).json(createdApplicant);
  } catch (err) {
    res.status(400).json({ message: 'Error creating applicant', error: err.message });
  }
});

// Get applicant by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate('program');
    if (applicant) {
      res.json(applicant);
    } else {
      res.status(404).json({ message: 'Applicant not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 1: Allocate Seat
router.put('/:id/allocate', protect, authorize('Admission_Officer', 'Admin'), async (req, res) => {
  try {
    const { quotaType, allotmentNumber } = req.body;
    let applicant = await Applicant.findById(req.params.id);
    
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    if (applicant.admissionStatus !== 'Pending') {
      return res.status(400).json({ message: 'Seat already processed for this applicant' });
    }

    // Atomic update to block seat if available
    const programId = applicant.program;
    const program = await Program.findOneAndUpdate(
      { 
        _id: programId, 
        "quotas.type": quotaType,
        $expr: {
          $lt: [
            { $arrayElemAt: ["$quotas.filled", { $indexOfArray: ["$quotas.type", quotaType] }] },
            { $arrayElemAt: ["$quotas.allocated", { $indexOfArray: ["$quotas.type", quotaType] }] }
          ]
        }
      },
      {
        $inc: { "quotas.$.filled": 1 }
      },
      { new: true }
    );

    if (!program) {
      return res.status(400).json({ message: 'Quota filled or program not found. Cannot allocate seat.' });
    }

    applicant.quotaType = quotaType;
    if (allotmentNumber) applicant.allotmentNumber = allotmentNumber;
    applicant.admissionStatus = 'Seat Locked';
    
    await applicant.save();

    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Step 2: Verify Documents
router.put('/:id/verify-documents', protect, authorize('Admission_Officer', 'Admin'), async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    
    applicant.documentStatus = req.body.status || 'Verified';
    await applicant.save();
    
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 3: Confirm Admission (Fee Payment)
router.put('/:id/confirm-fee', protect, authorize('Admission_Officer', 'Admin'), async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate('program');
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    
    if (applicant.admissionStatus !== 'Seat Locked') {
      return res.status(400).json({ message: 'Seat must be locked before confirming fee' });
    }
    
    if (applicant.documentStatus !== 'Verified') {
      return res.status(400).json({ message: 'Documents must be verified first' });
    }

    applicant.feeStatus = 'Paid';
    applicant.admissionStatus = 'Confirmed';
    
    // Generate unique immutable admission number
    // Format: INST/2026/UG/CSE/KCET/0001
    const p = applicant.program;
    const seqKey = `${p.institution}_${p.academicYear}_${p.courseType}_${p.name}_${applicant.quotaType}`;
    const seqValue = await getNextSequenceValue(seqKey);
    const paddedSeq = String(seqValue).padStart(4, '0');
    
    applicant.admissionNumber = `${p.institution}/${p.academicYear}/${p.courseType}/${p.name}/${applicant.quotaType}/${paddedSeq}`;
    
    await applicant.save();
    
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
