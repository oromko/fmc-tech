/**
 * Generate unique Lab Request ID
 * Format: LAB-YYYYMMDD-XXXX
 */
const generateLabId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `LAB-${dateStr}-${randomNum}`;
};

/**
 * Generate unique Certificate ID
 * Format: CERT-YYYYMMDD-XXXX
 */
const generateCertificateId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CERT-${dateStr}-${randomNum}`;
};

/**
 * Generate unique MRN (Medical Record Number)
 * Format: MRN-YYYY-XXXX
 */
const generateMRN = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MRN-${year}-${randomNum}`;
};

/**
 * Generate unique Invoice ID
 * Format: INV-YYYYMMDD-XXXX
 */
const generateInvoiceId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomNum}`;
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if a value is within reference range
 */
const isWithinRange = (value, min, max) => {
  const numValue = parseFloat(value);
  return numValue >= min && numValue <= max;
};

/**
 * Determine result status based on reference range
 */
const getResultStatus = (value, min, max) => {
  const numValue = parseFloat(value);
  if (numValue < min) return 'LOW';
  if (numValue > max) return 'HIGH';
  return 'NORMAL';
};

module.exports = {
  generateLabId,
  generateCertificateId,
  generateMRN,
  generateInvoiceId,
  calculateAge,
  formatCurrency,
  formatDate,
  isWithinRange,
  getResultStatus
};
