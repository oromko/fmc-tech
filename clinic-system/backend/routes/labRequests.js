const express = require('express');
const router = express.Router();
const labRequestController = require('../controllers/labRequestController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all lab requests
router.get('/', authenticate, labRequestController.getAllLabRequests);

// Get lab request by ID
router.get('/:id', authenticate, labRequestController.getLabRequestById);

// Create new lab request
router.post('/', authenticate, authorize(['doctor', 'admin']), labRequestController.createLabRequest);

// Update lab request
router.put('/:id', authenticate, labRequestController.updateLabRequest);

// Add results to lab request
router.post('/:id/results', authenticate, authorize(['lab_technician', 'admin']), labRequestController.addResults);

// Verify lab results (Doctor only)
router.post('/:id/verify', authenticate, authorize(['doctor', 'admin']), labRequestController.verifyResults);

// Cancel lab request
router.delete('/:id', authenticate, authorize(['doctor', 'admin']), labRequestController.cancelLabRequest);

// Get lab requests by patient
router.get('/patient/:patientId', authenticate, labRequestController.getPatientLabRequests);

// Get lab requests by doctor
router.get('/doctor/:doctorId', authenticate, labRequestController.getDoctorLabRequests);

// Get pending lab requests (for lab technician)
router.get('/status/pending', authenticate, authorize(['lab_technician', 'admin']), labRequestController.getPendingLabRequests);

// Get verified lab requests
router.get('/status/verified', authenticate, labRequestController.getVerifiedLabRequests);

module.exports = router;
