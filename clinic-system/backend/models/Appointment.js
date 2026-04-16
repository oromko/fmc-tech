const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'procedure', 'emergency', 'telemedicine'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: [String],
  notes: String,
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    recommendations: [String]
  },
  diagnosis: [{
    code: String,
    description: String,
    type: {
      type: String,
      enum: ['primary', 'secondary']
    }
  }],
  vitals: {
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  followUp: {
    required: Boolean,
    date: Date,
    reason: String
  },
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const seq = String(count + 1).padStart(6, '0');
    this.appointmentId = `APT-${year}${month}${day}-${seq}`;
  }
  
  // Calculate BMI if weight and height are provided
  if (this.vitals && this.vitals.weight && this.vitals.height) {
    const heightInMeters = this.vitals.height / 100;
    this.vitals.bmi = parseFloat((this.vitals.weight / (heightInMeters * heightInMeters)).toFixed(2));
  }
  
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
