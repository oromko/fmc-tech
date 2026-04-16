const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  chiefComplaints: [String],
  historyOfPresentIllness: String,
  pastMedicalHistory: String,
  familyHistory: String,
  socialHistory: String,
  physicalExamination: {
    general: String,
    systemic: [{
      system: String,
      findings: String
    }]
  },
  provisionalDiagnosis: [{
    code: String,
    description: String,
    confidence: {
      type: String,
      enum: ['confirmed', 'probable', 'possible', 'rule-out']
    }
  }],
  finalDiagnosis: [{
    code: String,
    description: String,
    confirmedDate: Date
  }],
  treatmentPlan: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      route: String,
      instructions: String,
      startDate: Date,
      endDate: Date
    }],
    procedures: [{
      name: String,
      code: String,
      date: Date,
      performedBy: String,
      notes: String
    }],
    therapies: [{
      type: String,
      frequency: String,
      duration: String,
      goals: [String]
    }],
    lifestyleRecommendations: [String],
    dietaryAdvice: [String]
  },
  investigations: [{
    type: String,
    name: String,
    orderedDate: Date,
    status: {
      type: String,
      enum: ['ordered', 'in-progress', 'completed', 'cancelled']
    },
    results: String,
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedDate: Date
  }],
  progressNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  referrals: [{
    specialist: String,
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled']
    },
    referralDate: Date,
    feedback: String
  }],
  attachments: [{
    name: String,
    type: String,
    url: String,
    uploadedDate: Date,
    uploadedBy: mongoose.Schema.Types.ObjectId
  }],
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(6, '0');
    this.recordId = `REC-${year}${month}${day}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
