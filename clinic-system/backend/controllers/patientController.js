const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get all patients with filtering
// @route   GET /api/patients
// @access  Private (Admin, Doctor, Receptionist)
const getPatients = async (req, res) => {
  try {
    const { search, gender, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) query.gender = gender;
    if (status) query.status = status;

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .populate('primaryDoctor', 'firstName lastName specialization');

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('primaryDoctor', 'firstName lastName specialization')
      .populate('nextOfKin');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist)
const createPatient = async (req, res) => {
  try {
    // Generate patient ID
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await Patient.countDocuments({
      patientId: new RegExp(`^PAT-${year}${month}${day}-`)
    });
    
    const patientId = `PAT-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;

    const patient = await Patient.create({
      patientId,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check for associated medical records
    const recordCount = await MedicalRecord.countDocuments({ patient: req.params.id });
    if (recordCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete patient with ${recordCount} medical record(s). Archive instead.`
      });
    }

    await patient.deleteOne();

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient medical history
// @route   GET /api/patients/:id/records
// @access  Private
const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.id })
      .sort({ visitDate: -1 })
      .populate('doctor', 'firstName lastName')
      .populate('appointment');

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientRecords
};
