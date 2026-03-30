const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const Applicant = require('../models/Applicant');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get dashboard metrics
// @access  Private (Management, Admin, Admission_Officer)
router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find({});
    
    let totalIntake = 0;
    let totalFilled = 0;
    const quotaMap = {};

    programs.forEach(p => {
      totalIntake += p.totalIntake;
      p.quotas.forEach(q => {
        totalFilled += q.filled;
        if (!quotaMap[q.type]) {
          quotaMap[q.type] = { allocated: 0, filled: 0 };
        }
        quotaMap[q.type].allocated += q.allocated;
        quotaMap[q.type].filled += q.filled;
      });
    });

    const pendingDocsCount = await Applicant.countDocuments({ documentStatus: 'Pending' });
    const pendingFeesCount = await Applicant.countDocuments({ feeStatus: 'Pending', admissionStatus: 'Seat Locked' });

    res.json({
      overview: {
        totalIntake,
        totalAdmitted: totalFilled,
        remainingSeats: totalIntake - totalFilled
      },
      quotaStats: quotaMap,
      actionRequired: {
        pendingDocuments: pendingDocsCount,
        pendingFees: pendingFeesCount
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
