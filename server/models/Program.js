const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: true
  },
  allocated: {
    type: Number,
    required: true,
    min: 0
  },
  filled: {
    type: Number,
    default: 0,
    min: 0
  }
});

const programSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  campus: { type: String, required: true },
  department: { type: String, required: true },
  name: { type: String, required: true }, // e.g., CSE, ISE
  academicYear: { type: String, required: true },
  courseType: { 
    type: String, 
    enum: ['UG', 'PG'],
    required: true 
  },
  entryType: { 
    type: String, 
    enum: ['Regular', 'Lateral'],
    required: true 
  },
  admissionMode: {
    type: String,
    enum: ['Government', 'Management'],
    required: true
  },
  totalIntake: { 
    type: Number, 
    required: true,
    min: 1
  },
  quotas: [quotaSchema]
}, { timestamps: true });

// Pre-save validation: Ensure total base quota must = intake
programSchema.pre('save', function(next) {
  const totalAllocated = this.quotas.reduce((sum, q) => sum + q.allocated, 0);
  if (totalAllocated !== this.totalIntake) {
    return next(new Error(`Total allocated quota (${totalAllocated}) must equal total intake (${this.totalIntake})`));
  }
  next();
});

module.exports = mongoose.model('Program', programSchema);
