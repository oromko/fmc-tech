const LabRequest = require('../models/LabRequest');
const LabTestCatalog = require('../models/LabTestCatalog');
const Patient = require('../models/Patient');

// Generate lab request number: LAB-YYYYMMDD-XXXX
const generateLabNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `LAB-${dateStr}-`;
  
  const count = await LabRequest.countDocuments({
    labNumber: { $regex: `^${prefix}` }
  });
  
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

// Get all lab requests
exports.getAllLabRequests = async (req, res) => {
  try {
    const { status, priority, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (date) filter.requestDate = new Date(date);

    const labRequests = await LabRequest.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .populate('doctor', 'userId specialization name')
      .populate('tests.testId', 'testName category referenceRange units')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      count: labRequests.length,
      data: { labRequests }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get lab requests', 
      error: error.message 
    });
  }
};

// Get lab request by ID
exports.getLabRequestById = async (req, res) => {
  try {
    const labRequest = await LabRequest.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId contact email')
      .populate('doctor', 'userId specialization name')
      .populate('tests.testId', 'testName category referenceRange units description')
      .populate('results.performedBy', 'name role');

    if (!labRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab request not found' 
      });
    }

    res.json({
      success: true,
      data: { labRequest }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get lab request', 
      error: error.message 
    });
  }
};

// Create new lab request
exports.createLabRequest = async (req, res) => {
  try {
    const { patientId, tests, priority, clinicalNotes, requestedTests } = req.body;

    // Generate unique lab number
    const labNumber = await generateLabNumber();

    const labRequest = new LabRequest({
      labNumber,
      patient: patientId,
      doctor: req.user.doctorId || req.user.id,
      tests: requestedTests || tests.map(testId => ({ testId })),
      priority: priority || 'routine',
      clinicalNotes,
      status: 'pending'
    });

    await labRequest.save();
    
    const populated = await LabRequest.findById(labRequest._id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization')
      .populate('tests.testId', 'testName category');

    res.status(201).json({
      success: true,
      message: 'Lab request created successfully',
      data: { labRequest: populated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create lab request', 
      error: error.message 
    });
  }
};

// Update lab request
exports.updateLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const labRequest = await LabRequest.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('patient doctor tests.testId');

    if (!labRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab request not found' 
      });
    }

    res.json({
      success: true,
      message: 'Lab request updated successfully',
      data: { labRequest }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update lab request', 
      error: error.message 
    });
  }
};

// Add results to lab request
exports.addResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { results, notes } = req.body;

    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab request not found' 
      });
    }

    if (labRequest.status === 'verified') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot add results to verified request' 
      });
    }

    // Process results and check for abnormal values
    const processedResults = results.map(result => {
      const test = labRequest.tests.find(t => t.testId.toString() === result.testId);
      if (!test) return result;

      const catalogTest = await LabTestCatalog.findById(test.testId);
      let isAbnormal = false;
      let abnormalFlag = null;

      if (catalogTest && catalogTest.referenceRange) {
        const value = parseFloat(result.value);
        const [min, max] = catalogTest.referenceRange.split('-').map(Number);
        
        if (!isNaN(min) && !isNaN(max)) {
          if (value < min) {
            isAbnormal = true;
            abnormalFlag = 'L'; // Low
          } else if (value > max) {
            isAbnormal = true;
            abnormalFlag = 'H'; // High
          }
        }
      }

      return {
        ...result,
        isAbnormal,
        abnormalFlag,
        performedBy: req.user.id,
        performedAt: new Date()
      };
    });

    labRequest.results = processedResults;
    labRequest.notes = notes || labRequest.notes;
    labRequest.status = 'completed';
    labRequest.completedAt = new Date();

    await labRequest.save();

    const updated = await LabRequest.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization')
      .populate('tests.testId', 'testName category referenceRange units')
      .populate('results.performedBy', 'name role');

    res.json({
      success: true,
      message: 'Results added successfully',
      data: { labRequest: updated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add results', 
      error: error.message 
    });
  }
};

// Verify lab results (Doctor only)
exports.verifyResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab request not found' 
      });
    }

    if (labRequest.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only verify completed lab requests' 
      });
    }

    labRequest.verifiedBy = req.user.id;
    labRequest.verifiedAt = new Date();
    labRequest.verificationComments = comments;
    labRequest.status = 'verified';

    await labRequest.save();

    const updated = await LabRequest.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization')
      .populate('tests.testId', 'testName category referenceRange units')
      .populate('verifiedBy', 'name role');

    res.json({
      success: true,
      message: 'Lab results verified successfully',
      data: { labRequest: updated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify results', 
      error: error.message 
    });
  }
};

// Cancel lab request
exports.cancelLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab request not found' 
      });
    }

    if (labRequest.status === 'verified') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel verified lab request' 
      });
    }

    labRequest.status = 'cancelled';
    labRequest.cancellationReason = cancellationReason;
    labRequest.cancelledBy = req.user.id;
    labRequest.cancelledAt = new Date();

    await labRequest.save();

    res.json({
      success: true,
      message: 'Lab request cancelled successfully',
      data: { labRequest }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel lab request', 
      error: error.message 
    });
  }
};

// Get patient's lab requests
exports.getPatientLabRequests = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;
    const filter = { patient: patientId };
    
    if (status) filter.status = status;

    const labRequests = await LabRequest.find(filter)
      .populate('doctor', 'userId specialization name')
      .populate('tests.testId', 'testName category')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      count: labRequests.length,
      data: { labRequests }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get patient lab requests', 
      error: error.message 
    });
  }
};

// Get doctor's lab requests
exports.getDoctorLabRequests = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;
    const filter = { doctor: doctorId };
    
    if (status) filter.status = status;

    const labRequests = await LabRequest.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .populate('tests.testId', 'testName category')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      count: labRequests.length,
      data: { labRequests }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get doctor lab requests', 
      error: error.message 
    });
  }
};

// Get pending lab requests
exports.getPendingLabRequests = async (req, res) => {
  try {
    const labRequests = await LabRequest.find({ status: 'pending' })
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization name')
      .populate('tests.testId', 'testName category')
      .sort({ priority: 1, requestDate: 1 });

    res.json({
      success: true,
      count: labRequests.length,
      data: { labRequests }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pending lab requests', 
      error: error.message 
    });
  }
};

// Get verified lab requests
exports.getVerifiedLabRequests = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { status: 'verified' };
    
    if (date) {
      filter.verifiedAt = { $gte: new Date(date) };
    }

    const labRequests = await LabRequest.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'userId specialization name')
      .populate('verifiedBy', 'name role')
      .sort({ verifiedAt: -1 });

    res.json({
      success: true,
      count: labRequests.length,
      data: { labRequests }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get verified lab requests', 
      error: error.message 
    });
  }
};
