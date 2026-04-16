const mongoose = require('mongoose');

const hmisReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: true
  },
  reportType: {
    type: String,
    enum: ['daily-summary', 'monthly-financial', 'patient-demographics', 
           'appointment-statistics', 'disease-surveillance', 'inventory', 
           'staff-productivity', 'quality-indicators'],
    required: true
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: mongoose.Schema.Types.Mixed,
  summary: {
    totalPatients: Number,
    totalAppointments: Number,
    totalRevenue: Number,
    totalLabTests: Number,
    totalPrescriptions: Number,
    averageWaitTime: Number,
    patientSatisfaction: Number
  },
  demographics: {
    ageGroups: [{
      range: String,
      count: Number,
      percentage: Number
    }],
    genderDistribution: [{
      gender: String,
      count: Number,
      percentage: Number
    }],
    topDiagnoses: [{
      code: String,
      description: String,
      count: Number
    }],
    geographicDistribution: [{
      region: String,
      count: Number,
      percentage: Number
    }]
  },
  financials: {
    revenueByCategory: [{
      category: String,
      amount: Number,
      percentage: Number
    }],
    paymentMethodBreakdown: [{
      method: String,
      amount: Number,
      count: Number
    }],
    outstandingPayments: Number,
    insuranceClaims: {
      submitted: Number,
      approved: Number,
      rejected: Number,
      pending: Number,
      totalAmount: Number
    }
  },
  exports: [{
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv', 'json']
    },
    exportedAt: Date,
    exportedBy: mongoose.Schema.Types.ObjectId,
    filePath: String
  }],
  status: {
    type: String,
    enum: ['draft', 'finalized', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

hmisReportSchema.pre('save', async function(next) {
  if (!this.reportId) {
    const count = await mongoose.model('HMISReport').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(4, '0');
    this.reportId = `RPT-${year}${month}${day}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('HMISReport', hmisReportSchema);
