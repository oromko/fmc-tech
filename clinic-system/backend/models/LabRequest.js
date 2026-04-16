const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  clinicalNotes: String,
  tests: [{
    testCatalog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTestCatalog'
    },
    testName: String,
    testCode: String,
    status: {
      type: String,
      enum: ['pending', 'sample-collected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    specimenCollected: Boolean,
    specimenCollectionTime: Date,
    results: [{
      parameter: String,
      value: Number,
      unit: String,
      referenceMin: Number,
      referenceMax: Number,
      isAbnormal: Boolean,
      isCritical: Boolean,
      flag: {
        type: String,
        enum: ['low', 'high', 'critical-low', 'critical-high', 'normal']
      },
      notes: String
    }],
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verifiedDate: Date,
    remarks: String
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'sample-collected', 'in-progress', 'partial-results', 
           'completed', 'verified', 'cancelled'],
    default: 'draft'
  },
  sampleCollectionDetails: {
    collectedBy: mongoose.Schema.Types.ObjectId,
    collectedAt: Date,
    sampleType: String,
    sampleCondition: {
      type: String,
      enum: ['acceptable', 'rejected', 'hemolyzed', 'lipemic', 'icteric']
    },
    rejectionReason: String
  },
  completedDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedDate: Date,
  deliveryMethod: {
    type: String,
    enum: ['print', 'email', 'portal', 'pickup']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

labRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const count = await mongoose.model('LabRequest').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(4, '0');
    this.requestNumber = `LAB-${year}${month}${day}-${seq}`;
  }
  
  // Auto-flag abnormal results
  this.tests.forEach(test => {
    if (test.results && test.results.length > 0) {
      test.results.forEach(result => {
        if (result.value !== undefined && result.referenceMin !== undefined && result.referenceMax !== undefined) {
          if (result.value < result.referenceMin) {
            result.isAbnormal = true;
            result.flag = result.value < (result.referenceMin * 0.7) ? 'critical-low' : 'low';
          } else if (result.value > result.referenceMax) {
            result.isAbnormal = true;
            result.flag = result.value > (result.referenceMax * 1.3) ? 'critical-high' : 'high';
          } else {
            result.isAbnormal = false;
            result.flag = 'normal';
          }
          result.isCritical = result.flag === 'critical-low' || result.flag === 'critical-high';
        }
      });
    }
  });
  
  next();
});

module.exports = mongoose.model('LabRequest', labRequestSchema);
