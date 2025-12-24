// Helper functions

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'GHS')
 * @param {Function} formatPrice - Optional formatPrice function from CurrencyContext
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'GHS', formatPrice = null) => {
  // If formatPrice function is provided (from CurrencyContext), use it
  if (formatPrice && typeof formatPrice === 'function') {
    return formatPrice(amount, currency);
  }

  // Fallback to basic formatting
  const currencySymbols = {
    GHS: 'GH₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    XOF: 'CFA',
    ZAR: 'R',
    KES: 'KSh',
  };

  const symbol = currencySymbols[currency] || currency;
  
  if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
    return `${symbol}${amount.toFixed(2)}`;
  } else {
    return `${symbol} ${amount.toFixed(2)}`;
  }
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return re.test(phone);
};

