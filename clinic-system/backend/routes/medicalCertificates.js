const express = require('express');
const router = express.Router();
const medicalCertificateController = require('../controllers/medicalCertificateController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all medical certificates
router.get('/', authenticate, medicalCertificateController.getAllCertificates);

// Get certificate by ID
router.get('/:id', authenticate, medicalCertificateController.getCertificateById);

// Create new medical certificate
router.post('/', authenticate, authorize(['doctor', 'admin']), medicalCertificateController.createCertificate);

// Update medical certificate
router.put('/:id', authenticate, authorize(['doctor', 'admin']), medicalCertificateController.updateCertificate);

// Revoke medical certificate
router.post('/:id/revoke', authenticate, authorize(['doctor', 'admin']), medicalCertificateController.revokeCertificate);

// Print certificate (increment print count)
router.post('/:id/print', authenticate, medicalCertificateController.printCertificate);

// Get certificates by patient
router.get('/patient/:patientId', authenticate, medicalCertificateController.getPatientCertificates);

// Get certificates by doctor
router.get('/doctor/:doctorId', authenticate, medicalCertificateController.getDoctorCertificates);

// Get certificates by type
router.get('/type/:type', authenticate, medicalCertificateController.getCertificatesByType);

module.exports = router;
