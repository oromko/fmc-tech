const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Get all appointments based on user role
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctorId, patientId } = req.query;
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      filter.patient = req.user.patientId || req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user.doctorId || req.user.id;
    }

    // Additional filters
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .populate('doctor', 'userId specialization doctorId')
      .sort({ date: 1, 'timeSlot.start': 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get appointments', 
      error: error.message 
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId contact email')
      .populate('doctor', 'userId specialization doctorId name');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get appointment', 
      error: error.message 
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot, type, reason, symptoms, priority } = req.body;

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      timeSlot,
      type,
      reason,
      symptoms,
      priority
    });

    await appointment.save();
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment: populated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create appointment', 
      error: error.message 
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update appointment', 
      error: error.message 
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled', 
        cancellationReason,
        cancelledBy: req.user._id
      },
      { new: true }
    ).populate('patient doctor');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel appointment', 
      error: error.message 
    });
  }
};

// Get appointments by date
exports.getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.find({
      date: new Date(date)
    })
      .populate('patient', 'firstName lastName patientId contact')
      .populate('doctor', 'userId specialization doctorId')
      .sort({ 'timeSlot.start': 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get appointments by date', 
      error: error.message 
    });
  }
};

// Get doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;
    const filter = { doctor: doctorId };
    
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .sort({ date: 1, 'timeSlot.start': 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get doctor appointments', 
      error: error.message 
    });
  }
};

// Get patient's appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;
    const filter = { patient: patientId };
    
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'userId specialization doctorId name')
      .sort({ date: 1, 'timeSlot.start': 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get patient appointments', 
      error: error.message 
    });
  }
};
