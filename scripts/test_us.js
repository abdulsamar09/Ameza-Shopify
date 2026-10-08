/**
 * scripts/test_us.js - Unit tests for US standard helpers
 */

const {
  US_STATES,
  US_REGIONS,
  getRegionForState,
  isValidZip,
  formatPhone,
  isValidPhone,
  formatDate,
  formatTime,
  isValidRoutingNumber,
  maskTin,
  carrierTrackingUrl
} = require('../js/core/us.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Running US Helpers Tests ---');

// 1. States & Regions
assert(US_STATES.length === 51, `US_STATES has 51 entries (50 states + DC): ${US_STATES.length}`);
assert(getRegionForState('TX') === 'South', 'TX is in South region');
assert(getRegionForState('CA') === 'West', 'CA is in West region');
assert(getRegionForState('NY') === 'Northeast', 'NY is in Northeast region');
assert(getRegionForState('IL') === 'Midwest', 'IL is in Midwest region');

// 2. ZIP validation
assert(isValidZip('78701'), '78701 is valid ZIP');
assert(isValidZip('10001-1234'), '10001-1234 is valid ZIP+4');
assert(!isValidZip('2001'), '2001 (4-digit) is invalid');
assert(!isValidZip('ABCDE'), 'ABCDE is invalid');

// 3. Phone formatting & validation
assert(formatPhone('5555550123') === '(555) 555-0123', 'Formats 10 digits to (555) 555-0123');
assert(isValidPhone('(555) 555-0123'), 'Validates formatted phone');
assert(isValidPhone('5550100123'), 'Validates 10-digit unformatted phone');
assert(!isValidPhone('12345'), 'Rejects short phone');

// 4. Date & Time formatting
const testDate = new Date('2026-08-18T14:32:00Z');
assert(/\d{2}\/\d{2}\/\d{4}/.test(formatDate(testDate)), `Date formatted as MM/DD/YYYY: ${formatDate(testDate)}`);
assert(/PM ET|AM ET/.test(formatTime(testDate, 'ET')), `Time formatted in 12-hr with ET: ${formatTime(testDate, 'ET')}`);

// 5. Routing number ABA checksum
// Valid routing: Chase 021000021 -> 3*(0+0+0) + 7*(2+0+2) + 1*(1+0+1) = 0 + 28 + 2 = 30 % 10 === 0
assert(isValidRoutingNumber('021000021'), 'Valid ABA routing 021000021 passes');
// Bank of America: 121000358 -> 3*(1+0+3) + 7*(2+0+5) + 1*(1+0+8) = 12 + 49 + 9 = 70 % 10 === 0
assert(isValidRoutingNumber('121000358'), 'Valid ABA routing 121000358 passes');
assert(!isValidRoutingNumber('123456789'), 'Invalid ABA routing 123456789 rejected');
assert(!isValidRoutingNumber('1234'), 'Short routing rejected');

// 6. TIN masking
assert(maskTin('123456789', 'SSN') === '***-**-6789', 'SSN masked correctly');
assert(maskTin('123456789', 'EIN') === '**-***6789', 'EIN masked correctly');

// 7. Tracking URLs
assert(carrierTrackingUrl('USPS', '94001000').includes('usps.com'), 'USPS tracking URL generated');
assert(carrierTrackingUrl('UPS', '1Z999').includes('ups.com'), 'UPS tracking URL generated');
assert(carrierTrackingUrl('FedEx', '7946').includes('fedex.com'), 'FedEx tracking URL generated');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
