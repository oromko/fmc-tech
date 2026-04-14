const mongoose = require('mongoose');

const medicalCertificateSchema = new mongoose.Schema({
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['fitness', 'sick-leave', 'disability', 'medical-report'],
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: Date,
  purpose: String,
  findings: String,
  recommendations: [String],
  restrictions: [String],
  fitnessDetails: {
    fitFor: String,
    limitations: [String],
    reviewRequired: Boolean,
    reviewDate: Date
  },
  sickLeaveDetails: {
    diagnosis: String,
    leaveDays: Number,
    canResumeWork: Boolean,
    workModifications: [String]
  },
  disabilityDetails: {
    disabilityType: String,
    percentage: Number,
    permanent: Boolean,
    assistiveDevicesNeeded: [String]
  },
  medicalReportDetails: {
    summary: String,
    history: String,
    examinationFindings: String,
    testResults: String,
    prognosis: String
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  revocation: {
    revokedAt: Date,
    revokedBy: mongoose.Schema.Types.ObjectId,
    reason: {
      type: String,
      enum: ['error', 'fraud', 'patient-request', 'administrative', 'other']
    },
    notes: String
  },
  printCount: {
    type: Number,
    default: 0
  },
  lastPrintedAt: Date,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

medicalCertificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const count = await mongoose.model('MedicalCertificate').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(4, '0');
    this.certificateNumber = `CERT-${year}${month}${day}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('MedicalCertificate', medicalCertificateSchema);
