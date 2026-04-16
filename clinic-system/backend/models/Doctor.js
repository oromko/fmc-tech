const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: String,
    unique: true,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    enum: ['General Practice', 'Cardiology', 'Dermatology', 'Endocrinology', 
           'Gastroenterology', 'Neurology', 'Oncology', 'Pediatrics', 
           'Psychiatry', 'Orthopedics', 'Gynecology', 'Urology', 'ENT', 
           'Ophthalmology', 'Radiology', 'Pathology', 'Emergency Medicine']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    certificateNumber: String
  }],
  licenseNumber: {
    type: String,
    required: true
  },
  licenseExpiry: Date,
  experience: {
    years: Number,
    description: String
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  schedule: [{
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  maxAppointmentsPerDay: {
    type: Number,
    default: 20
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

doctorSchema.pre('save', async function(next) {
  if (!this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(4, '0');
    this.doctorId = `DOC-${year}${month}${day}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
