const MedicalCertificate = require('../models/MedicalCertificate');
const Patient = require('../models/Patient');

// Generate certificate number: CERT-YYYYMMDD-XXXX
const generateCertificateNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `CERT-${dateStr}-`;
  
  const count = await MedicalCertificate.countDocuments({
    certificateNumber: { $regex: `^${prefix}` }
  });
  
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

// Get all medical certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const { type, status, date } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (date) filter.issueDate = new Date(date);

    const certificates = await MedicalCertificate.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .populate('doctor', 'userId specialization name')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: { certificates }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get certificates', 
      error: error.message 
    });
  }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId contact email dateOfBirth')
      .populate('doctor', 'userId specialization name licenseNumber');

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    res.json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get certificate', 
      error: error.message 
    });
  }
};

// Create new medical certificate
exports.createCertificate = async (req, res) => {
  try {
    const { patientId, type, diagnosis, treatment, validFrom, validUntil, notes } = req.body;

    // Validate certificate type
    const validTypes = ['fitness', 'sick-leave', 'disability', 'medical-report'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid certificate type. Must be one of: fitness, sick-leave, disability, medical-report' 
      });
    }

    // Generate unique certificate number
    const certificateNumber = await generateCertificateNumber();

    const certificate = new MedicalCertificate({
      certificateNumber,
      patient: patientId,
      doctor: req.user.doctorId || req.user.id,
      type,
      diagnosis,
      treatment,
      validFrom: validFrom || new Date(),
      validUntil,
      notes,
      status: 'active'
    });

    await certificate.save();
    
    const populated = await MedicalCertificate.findById(certificate._id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization');

    res.status(201).json({
      success: true,
      message: 'Medical certificate created successfully',
      data: { certificate: populated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create certificate', 
      error: error.message 
    });
  }
};

// Update medical certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const certificate = await MedicalCertificate.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: { certificate }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update certificate', 
      error: error.message 
    });
  }
};

// Revoke medical certificate
exports.revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { revocationReason } = req.body;

    const certificate = await MedicalCertificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    if (certificate.status === 'revoked') {
      return res.status(400).json({ 
        success: false, 
        message: 'Certificate is already revoked' 
      });
    }

    certificate.status = 'revoked';
    certificate.revocationReason = revocationReason;
    certificate.revokedBy = req.user.id;
    certificate.revokedAt = new Date();

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: { certificate }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to revoke certificate', 
      error: error.message 
    });
  }
};

// Print certificate (increment print count)
exports.printCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await MedicalCertificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    certificate.printCount += 1;
    certificate.lastPrintedAt = new Date();

    await certificate.save();

    const updated = await MedicalCertificate.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization');

    res.json({
      success: true,
      message: 'Certificate printed successfully',
      data: { certificate: updated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to print certificate', 
      error: error.message 
    });
  }
};

// Get patient's certificates
exports.getPatientCertificates = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { type, status } = req.query;
    const filter = { patient: patientId };
    
    if (type) filter.type = type;
    if (status) filter.status = status;

    const certificates = await MedicalCertificate.find(filter)
      .populate('doctor', 'userId specialization name')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: { certificates }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get patient certificates', 
      error: error.message 
    });
  }
};

// Get doctor's certificates
exports.getDoctorCertificates = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { type, status } = req.query;
    const filter = { doctor: doctorId };
    
    if (type) filter.type = type;
    if (status) filter.status = status;

    const certificates = await MedicalCertificate.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: { certificates }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get doctor certificates', 
      error: error.message 
    });
  }
};

// Get certificates by type
exports.getCertificatesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { status } = req.query;
    const filter = { type };
    
    if (status) filter.status = status;

    const certificates = await MedicalCertificate.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization name')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: { certificates }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get certificates by type', 
      error: error.message 
    });
  }
};
