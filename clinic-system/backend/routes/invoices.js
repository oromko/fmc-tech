const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all invoices
router.get('/', authenticate, invoiceController.getAllInvoices);

// Get invoice by ID
router.get('/:id', authenticate, invoiceController.getInvoiceById);

// Create new invoice
router.post('/', authenticate, authorize(['admin', 'receptionist']), invoiceController.createInvoice);

// Update invoice
router.put('/:id', authenticate, authorize(['admin', 'receptionist']), invoiceController.updateInvoice);

// Add payment to invoice
router.post('/:id/payment', authenticate, authorize(['admin', 'receptionist', 'cashier']), invoiceController.addPayment);

// Cancel invoice
router.delete('/:id', authenticate, authorize(['admin']), invoiceController.cancelInvoice);

// Get invoices by patient
router.get('/patient/:patientId', authenticate, invoiceController.getPatientInvoices);

// Get pending invoices
router.get('/status/pending', authenticate, invoiceController.getPendingInvoices);

// Get paid invoices
router.get('/status/paid', authenticate, invoiceController.getPaidInvoices);

// Get financial statistics
router.get('/stats/financial', authenticate, authorize(['admin']), invoiceController.getFinancialStats);

module.exports = router;
