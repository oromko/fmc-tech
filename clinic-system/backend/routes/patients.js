const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientRecords
} = require('../controllers/patientController');

router.use(protect); // All routes require authentication

router.route('/')
  .get(authorize('Admin', 'Doctor', 'Receptionist'), getPatients)
  .post(authorize('Admin', 'Receptionist'), createPatient);

router.route('/:id')
  .get(getPatient)
  .put(updatePatient)
  .delete(authorize('Admin'), deletePatient);

router.get('/:id/records', authorize('Admin', 'Doctor'), getPatientRecords);

module.exports = router;
