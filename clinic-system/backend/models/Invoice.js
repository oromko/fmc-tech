const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
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
  items: [{
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'laboratory', 'radiology', 'pharmacy', 
             'supplies', 'facility-fee', 'other'],
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      required: true
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'items.referenceModel'
    },
    referenceModel: {
      type: String,
      enum: ['LabRequest', 'Appointment', 'MedicalRecord', null]
    }
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  payments: [{
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'bank_transfer', 'mobile_money'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    transactionId: String,
    paidAt: {
      type: Date,
      default: Date.now
    },
    receivedBy: mongoose.Schema.Types.ObjectId,
    notes: String,
    receiptNumber: String
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  insuranceClaim: {
    provider: String,
    policyNumber: String,
    claimNumber: String,
    claimStatus: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'pending']
    },
    approvedAmount: Number,
    remarks: String
  },
  billingDetails: {
    billedTo: {
      type: String,
      enum: ['patient', 'insurance', 'corporate', 'government']
    },
    billingAddress: String,
    billingContact: String,
    billingEmail: String
  },
  dueDate: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate totals before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(6, '0');
    this.invoiceNumber = `INV-${year}${month}${day}-${seq}`;
  }
  
  // Calculate item amounts and totals
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  
  this.items.forEach(item => {
    item.amount = (item.unitPrice * item.quantity) - item.discount;
    const taxAmount = item.amount * (item.taxRate / 100);
    subtotal += item.unitPrice * item.quantity;
    totalDiscount += item.discount;
    totalTax += taxAmount;
  });
  
  this.subtotal = subtotal;
  this.totalDiscount = totalDiscount;
  this.totalTax = totalTax;
  this.totalAmount = subtotal - totalDiscount + totalTax;
  
  // Update payment status
  const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  if (totalPaid === 0) {
    this.paymentStatus = 'pending';
  } else if (totalPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
