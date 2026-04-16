const mongoose = require('mongoose');

const labTestCatalogSchema = new mongoose.Schema({
  testCode: {
    type: String,
    unique: true,
    required: true
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 
           'Pathology', 'Radiology', 'Cardiology', 'Urinalysis', 
           'Serology', 'Molecular Diagnostics'],
    required: true
  },
  description: String,
  specimenType: {
    type: String,
    enum: ['Blood', 'Urine', 'Stool', 'Sputum', 'CSF', 'Tissue', 'Swab', 'Saliva', 'Other']
  },
  turnaroundTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days']
    }
  },
  referenceRanges: [{
    parameter: String,
    unit: String,
    min: Number,
    max: Number,
    criticalMin: Number,
    criticalMax: Number,
    ageGroup: {
      type: String,
      enum: ['pediatric', 'adult', 'geriatric', 'all']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'all']
    }
  }],
  price: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

labTestCatalogSchema.pre('save', async function(next) {
  if (!this.testCode) {
    const count = await mongoose.model('LabTestCatalog').countDocuments();
    this.testCode = `TEST-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LabTestCatalog', labTestCatalogSchema);
