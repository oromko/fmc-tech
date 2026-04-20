const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConfig = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const labRequestRoutes = require('./routes/labRequests');
const medicalCertificateRoutes = require('./routes/medicalCertificates');
const invoiceRoutes = require('./routes/invoices');
const hmisReportRoutes = require('./routes/hmisReports');

// ICD-11 lookup route
app.get('/api/icd11', (req, res) => {
  try {
    const icd11Data = require('./data/icd11.json');
    const { search, chapter } = req.query;
    let results = icd11Data.icd11_codes;
    
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(code => 
        code.code.toLowerCase().includes(searchLower) ||
        code.title.toLowerCase().includes(searchLower)
      );
    }
    
    if (chapter) {
      results = results.filter(code => code.chapter === chapter);
    }
    
    res.json({ success: true, data: results, total: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lab Catalog route
app.get('/api/lab-catalog', async (req, res) => {
  try {
    const LabTestCatalog = require('./models/LabTestCatalog');
    const { category } = req.query;
    let query = {};
    if (category) query.category = category;
    
    const tests = await LabTestCatalog.find(query).sort({ category: 1, testName: 1 });
    res.json({ success: true, data: tests, total: tests.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab-requests', labRequestRoutes);
app.use('/api/lab-catalog', require('./routes/labRequests')); // Re-use for catalog management
app.use('/api/certificates', medicalCertificateRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', hmisReportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Family Clinic System API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;

dbConfig.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = app;
