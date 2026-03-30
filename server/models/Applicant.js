const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  // Basic Details (minimize to around 10-15 max as per spec)
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  category: { 
    type: String, 
    enum: ['GM', 'SC', 'ST', 'OBC', 'Other'], 
    required: true 
  },
  
  // Application specifics
  program: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Program', 
    required: true 
  },
  entryType: { 
    type: String, 
    enum: ['Regular', 'Lateral'],
    required: true 
  },
  quotaType: { 
    type: String, 
    enum: ['KCET', 'COMEDK', 'Management'],
    required: true 
  },
  qualifyingExamMarks: { type: Number, required: true },
  
  // Allotment logic (for government flow etc)
  allotmentNumber: { type: String }, // e.g. KCET rank or COMEDK allotment num
  
  // Workflow Status
  documentStatus: {
    type: String,
    enum: ['Pending', 'Submitted', 'Verified'],
    default: 'Pending'
  },
  feeStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  admissionStatus: {
    type: String,
    enum: ['Pending', 'Seat Locked', 'Confirmed'],
    default: 'Pending'
  },
  
  // Generated once confirmed
  admissionNumber: { 
    type: String, 
    unique: true, 
    sparse: true, 
    immutable: true // Admission number is unique and immutable
  }
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);
