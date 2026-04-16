const express = require('express');
const router = express.Router();
const hmisReportController = require('../controllers/hmisReportController');
const { authenticate, authorize } = require('../middleware/auth');

// Get daily summary report
router.get('/daily', authenticate, authorize(['admin', 'doctor']), hmisReportController.getDailySummary);

// Get monthly financial report
router.get('/monthly/financial', authenticate, authorize(['admin']), hmisReportController.getMonthlyFinancial);

// Get patient demographics report
router.get('/demographics', authenticate, authorize(['admin', 'doctor']), hmisReportController.getPatientDemographics);

// Get appointment statistics
router.get('/appointments', authenticate, hmisReportController.getAppointmentStats);

// Get lab test statistics
router.get('/lab-tests', authenticate, hmisReportController.getLabTestStats);

// Generate custom report
router.post('/custom', authenticate, authorize(['admin']), hmisReportController.generateCustomReport);

// Get report history
router.get('/history', authenticate, authorize(['admin']), hmisReportController.getReportHistory);

// Export report
router.post('/:id/export', authenticate, hmisReportController.exportReport);

module.exports = router;
