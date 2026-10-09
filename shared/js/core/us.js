/**
 * AMEZA US Standard Helpers & Constants — js/core/us.js
 * Source of truth for US states, zip validation, phone formatting,
 * ABA routing validation, date/time formatting, and shipping constants.
 */

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

export const US_REGIONS = {
  Northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  Midwest: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
  South: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'],
  West: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA']
};

export function getRegionForState(stateCode) {
  if (!stateCode) return 'Other';
  const code = stateCode.toUpperCase().trim();
  for (const [region, states] of Object.entries(US_REGIONS)) {
    if (states.includes(code)) return region;
  }
  return 'Other';
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // $100.00

export const SHIPPING_METHODS = [
  { id: 'standard', name: 'USPS Standard (5-7 business days)', carrier: 'USPS', priceCents: 599, days: '5-7 business days' },
  { id: 'express', name: 'UPS Express (2-3 business days)', carrier: 'UPS', priceCents: 1299, days: '2-3 business days' },
  { id: 'overnight', name: 'FedEx Overnight (1 business day)', carrier: 'FedEx', priceCents: 2499, days: '1 business day' }
];

/**
 * Validates US ZIP code (5 digits or ZIP+4)
 */
export function isValidZip(zip) {
  if (!zip) return false;
  return /^\d{5}(-\d{4})?$/.test(String(zip).trim());
}

/**
 * Formats a 10-digit number into standard US phone: (555) 555-0123
 */
export function formatPhone(input) {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  const clean = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
  if (clean.length < 10) return input;
  const area = clean.slice(0, 3);
  const mid = clean.slice(3, 6);
  const last = clean.slice(6, 10);
  return `(${area}) ${mid}-${last}`;
}

/**
 * Validates US phone number
 */
export function isValidPhone(str) {
  if (!str) return false;
  const digits = String(str).replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

/**
 * Formats date into MM/DD/YYYY
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Formats time into 12-hour format with timezone label (e.g. 02:30 PM ET)
 */
export function formatTime(dateInput, tz = 'ET') {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm} ${tz}`;
}

/**
 * Formats date and time: MM/DD/YYYY 12:34 PM ET
 */
export function formatDateTime(dateInput, tz = 'ET') {
  if (!dateInput) return '';
  return `${formatDate(dateInput)} ${formatTime(dateInput, tz)}`;
}

/**
 * Validates 9-digit ABA routing transit number using weighted checksum
 * (3*(d1+d4+d7) + 7*(d2+d5+d8) + 1*(d3+d6+d9)) % 10 === 0
 */
export function isValidRoutingNumber(routing) {
  if (!routing) return false;
  const str = String(routing).replace(/\D/g, '');
  if (str.length !== 9) return false;
  const d = str.split('').map(Number);
  const checksum = (
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8])
  ) % 10;
  return checksum === 0;
}

/**
 * Masks TIN / SSN / EIN for display
 */
export function maskTin(tin, type = 'SSN') {
  if (!tin) return '';
  const digits = String(tin).replace(/\D/g, '');
  const last4 = digits.slice(-4).padStart(4, '0');
  if (type.toUpperCase() === 'EIN') {
    return `**-***${last4}`;
  }
  return `***-**-${last4}`;
}

/**
 * Returns tracking URL for major US carriers
 */
export function carrierTrackingUrl(carrier, trackingNumber) {
  if (!trackingNumber) return '#';
  const c = String(carrier || '').toUpperCase();
  if (c.includes('USPS')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('UPS')) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('FEDEX')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  }
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
}

// Attach to window if running in browser
if (typeof window !== 'undefined') {
  window.AmezaUS = {
    US_STATES,
    US_REGIONS,
    getRegionForState,
    FREE_SHIPPING_THRESHOLD_CENTS,
    SHIPPING_METHODS,
    isValidZip,
    formatPhone,
    isValidPhone,
    formatDate,
    formatTime,
    formatDateTime,
    isValidRoutingNumber,
    maskTin,
    carrierTrackingUrl
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    US_STATES,
    US_REGIONS,
    getRegionForState,
    FREE_SHIPPING_THRESHOLD_CENTS,
    SHIPPING_METHODS,
    isValidZip,
    formatPhone,
    isValidPhone,
    formatDate,
    formatTime,
    formatDateTime,
    isValidRoutingNumber,
    maskTin,
    carrierTrackingUrl
  };
}
