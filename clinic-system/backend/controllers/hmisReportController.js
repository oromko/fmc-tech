const HMISReport = require('../models/HMISReport');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const LabRequest = require('../models/LabRequest');
const Invoice = require('../models/Invoice');
const MedicalCertificate = require('../models/MedicalCertificate');

// Get daily summary report
exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    // Count appointments for the day
    const appointmentsToday = await Appointment.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Count completed appointments
    const completedAppointments = await Appointment.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    });

    // Count new patients registered today
    const newPatientsToday = await Patient.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Count lab requests today
    const labRequestsToday = await LabRequest.countDocuments({
      requestDate: { $gte: startOfDay, $lte: endOfDay }
    });

    // Count verified lab results
    const verifiedLabs = await LabRequest.countDocuments({
      verifiedAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'verified'
    });

    // Count certificates issued today
    const certificatesToday = await MedicalCertificate.countDocuments({
      issueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    // Revenue collected today
    const invoicesToday = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' }
        }
      }
    ]);

    const dailyRevenue = invoicesToday.length > 0 ? invoicesToday[0].total : 0;

    const report = {
      reportType: 'daily_summary',
      reportDate: startOfDay,
      generatedAt: new Date(),
      data: {
        appointments: {
          total: appointmentsToday,
          completed: completedAppointments,
          completionRate: appointmentsToday > 0 ? ((completedAppointments / appointmentsToday) * 100).toFixed(2) : 0
        },
        patients: {
          newRegistrations: newPatientsToday
        },
        laboratory: {
          requests: labRequestsToday,
          verified: verifiedLabs
        },
        certificates: {
          issued: certificatesToday
        },
        financial: {
          revenue: dailyRevenue
        }
      }
    };

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate daily summary', 
      error: error.message 
    });
  }
};

// Get monthly financial report
exports.getMonthlyFinancial = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year and month are required' 
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate invoices by payment method
    const revenueByMethod = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $unwind: '$payments'
      },
      {
        $match: {
          'payments.processedAt': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$payments.method',
          total: { $sum: '$payments.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total revenue
    const totalRevenue = revenueByMethod.reduce((sum, item) => sum + item.total, 0);

    // Outstanding payments
    const outstanding = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['pending', 'partial'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ['$total', '$amountPaid'] } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await Invoice.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const report = {
      reportType: 'monthly_financial',
      period: { year: parseInt(year), month: parseInt(month) },
      generatedAt: new Date(),
      data: {
        revenue: {
          total: totalRevenue,
          byMethod: revenueByMethod
        },
        outstanding: {
          amount: outstanding.length > 0 ? outstanding[0].total : 0,
          invoiceCount: outstanding.length > 0 ? outstanding[0].count : 0
        },
        statusBreakdown
      }
    };

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate monthly financial report', 
      error: error.message 
    });
  }
};

// Get patient demographics report
exports.getPatientDemographics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Gender distribution
    const genderDistribution = await Patient.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age groups
    const ageGroups = await Patient.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                31536000000 // milliseconds in a year
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$age', 18] }, '0-17',
              { $cond: [{ $lt: ['$age', 35] }, '18-34',
                { $cond: [{ $lt: ['$age', 50] }, '35-49',
                  { $cond: [{ $lt: ['$age', 65] }, '50-64', '65+'] }
                ]}
              ]}
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total patients
    const totalPatients = await Patient.countDocuments(matchStage);

    const report = {
      reportType: 'patient_demographics',
      period: { startDate, endDate },
      generatedAt: new Date(),
      data: {
        totalPatients,
        genderDistribution,
        ageGroups
      }
    };

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate demographics report', 
      error: error.message 
    });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Status breakdown
    const statusBreakdown = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Type breakdown
    const typeBreakdown = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority breakdown
    const priorityBreakdown = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments(matchStage);

    const report = {
      reportType: 'appointment_statistics',
      period: { startDate, endDate },
      generatedAt: new Date(),
      data: {
        totalAppointments,
        statusBreakdown,
        typeBreakdown,
        priorityBreakdown
      }
    };

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate appointment statistics', 
      error: error.message 
    });
  }
};

// Get lab test statistics
exports.getLabTestStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.requestDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Status breakdown
    const statusBreakdown = await LabRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority breakdown
    const priorityBreakdown = await LabRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Abnormal results count
    const abnormalResults = await LabRequest.aggregate([
      { $match: matchStage },
      { $unwind: '$results' },
      { $match: { 'results.isAbnormal': true } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLabRequests = await LabRequest.countDocuments(matchStage);

    const report = {
      reportType: 'lab_test_statistics',
      period: { startDate, endDate },
      generatedAt: new Date(),
      data: {
        totalLabRequests,
        statusBreakdown,
        priorityBreakdown,
        abnormalResults: abnormalResults.length > 0 ? abnormalResults[0].count : 0
      }
    };

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate lab test statistics', 
      error: error.message 
    });
  }
};

// Generate custom report
exports.generateCustomReport = async (req, res) => {
  try {
    const { reportType, filters, metrics } = req.body;

    // Save report to history
    const report = new HMISReport({
      reportType,
      filters,
      metrics,
      generatedBy: req.user.id
    });

    await report.save();

    res.json({
      success: true,
      message: 'Custom report generated',
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate custom report', 
      error: error.message 
    });
  }
};

// Get report history
exports.getReportHistory = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    const filter = {};

    if (reportType) filter.reportType = reportType;
    if (startDate && endDate) {
      filter.generatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const reports = await HMISReport.find(filter)
      .populate('generatedBy', 'name role')
      .sort({ generatedAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: { reports }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get report history', 
      error: error.message 
    });
  }
};

// Export report
exports.exportReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body;

    const report = await HMISReport.findById(id);
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    // Increment export count
    report.exportCount += 1;
    report.lastExportedAt = new Date();
    report.lastExportFormat = format || 'pdf';
    
    await report.save();

    res.json({
      success: true,
      message: `Report exported as ${report.lastExportFormat}`,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export report', 
      error: error.message 
    });
  }
};
