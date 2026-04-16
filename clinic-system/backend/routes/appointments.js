const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all appointments (Admin/Doctor can see all, Patient sees own)
router.get('/', authenticate, appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/:id', authenticate, appointmentController.getAppointmentById);

// Create new appointment
router.post('/', authenticate, appointmentController.createAppointment);

// Update appointment
router.put('/:id', authenticate, appointmentController.updateAppointment);

// Cancel appointment
router.delete('/:id', authenticate, appointmentController.cancelAppointment);

// Get appointments by date
router.get('/date/:date', authenticate, appointmentController.getAppointmentsByDate);

// Get doctor's appointments
router.get('/doctor/:doctorId', authenticate, appointmentController.getDoctorAppointments);

// Get patient's appointments
router.get('/patient/:patientId', authenticate, appointmentController.getPatientAppointments);

module.exports = router;
