const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const { status, paymentMethod, date } = req.query;
    const filter = {};

    if (status) filter.paymentStatus = status;
    if (paymentMethod) filter.payments = { $elemMatch: { method: paymentMethod } };
    if (date) filter.createdAt = new Date(date);

    const invoices = await Invoice.find(filter)
      .populate('patient', 'firstName lastName patientId contact')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      data: { invoices }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get invoices', 
      error: error.message 
    });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId contact email')
      .populate('createdBy', 'name role')
      .populate('payments.processedBy', 'name role');

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    res.json({
      success: true,
      data: { invoice }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get invoice', 
      error: error.message 
    });
  }
};

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    const { patientId, items, notes } = req.body;

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return {
        ...item,
        total: itemTotal
      };
    });

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const invoice = new Invoice({
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patient: patientId,
      items: processedItems,
      subtotal,
      tax,
      total,
      notes,
      paymentStatus: 'pending',
      createdBy: req.user.id
    });

    await invoice.save();
    
    const populated = await Invoice.findById(invoice._id)
      .populate('patient', 'firstName lastName patientId');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice: populated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create invoice', 
      error: error.message 
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If items are updated, recalculate totals
    if (updates.items) {
      let subtotal = 0;
      const processedItems = updates.items.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return {
          ...item,
          total: itemTotal
        };
      });

      updates.subtotal = subtotal;
      updates.tax = subtotal * 0.1;
      updates.total = subtotal + updates.tax;
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('patient createdBy');

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update invoice', 
      error: error.message 
    });
  }
};

// Add payment to invoice
exports.addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, reference, notes } = req.body;

    // Validate payment method
    const validMethods = ['cash', 'card', 'insurance', 'bank_transfer', 'mobile_money'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment method' 
      });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invoice is already fully paid' 
      });
    }

    const remainingAmount = invoice.total - invoice.amountPaid;
    const paymentAmount = Math.min(amount, remainingAmount);

    // Add payment record
    invoice.payments.push({
      amount: paymentAmount,
      method,
      reference,
      notes,
      processedBy: req.user.id,
      processedAt: new Date()
    });

    invoice.amountPaid += paymentAmount;

    // Update payment status
    if (invoice.amountPaid >= invoice.total) {
      invoice.paymentStatus = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.paymentStatus = 'partial';
    }

    await invoice.save();

    const updated = await Invoice.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('payments.processedBy', 'name role');

    res.json({
      success: true,
      message: 'Payment added successfully',
      data: { invoice: updated }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add payment', 
      error: error.message 
    });
  }
};

// Cancel invoice
exports.cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel a fully paid invoice' 
      });
    }

    invoice.paymentStatus = 'cancelled';
    invoice.cancellationReason = cancellationReason;
    invoice.cancelledBy = req.user.id;
    invoice.cancelledAt = new Date();

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice cancelled successfully',
      data: { invoice }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel invoice', 
      error: error.message 
    });
  }
};

// Get patient's invoices
exports.getPatientInvoices = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;
    const filter = { patient: patientId };
    
    if (status) filter.paymentStatus = status;

    const invoices = await Invoice.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      data: { invoices }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get patient invoices', 
      error: error.message 
    });
  }
};

// Get pending invoices
exports.getPendingInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ paymentStatus: { $in: ['pending', 'partial'] } })
      .populate('patient', 'firstName lastName patientId contact')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: invoices.length,
      data: { invoices }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pending invoices', 
      error: error.message 
    });
  }
};

// Get paid invoices
exports.getPaidInvoices = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { paymentStatus: 'paid' };
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const invoices = await Invoice.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      data: { invoices }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get paid invoices', 
      error: error.message 
    });
  }
};

// Get financial statistics
exports.getFinancialStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { paymentStatus: 'paid' };
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all paid invoices in the period
    const invoices = await Invoice.find(filter);

    // Calculate statistics
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPayments = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    
    // Group by payment method
    const paymentsByMethod = {};
    invoices.forEach(inv => {
      inv.payments.forEach(payment => {
        if (!paymentsByMethod[payment.method]) {
          paymentsByMethod[payment.method] = 0;
        }
        paymentsByMethod[payment.method] += payment.amount;
      });
    });

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

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalPayments,
        paymentsByMethod,
        statusBreakdown,
        invoiceCount: invoices.length,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get financial statistics', 
      error: error.message 
    });
  }
};
