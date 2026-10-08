/**
 * U.S. SAMPLE AIRLINE FLIGHT DATABASE & ROUTE ENGINE
 * All routes, fares, and airports are domestic United States.
 * Airports: JFK, LAX, ORD, ATL, DFW, MIA, SFO, SEA, LAS, BOS, DEN, PHX, MCO.
 * Notice: Sample fares for demonstration.
 */

export const US_AIRPORTS = {
  JFK: { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', state: 'NY', lat: 40.6413, lon: -73.7781 },
  LAX: { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', state: 'CA', lat: 33.9416, lon: -118.4085 },
  ORD: { code: 'ORD', city: 'Chicago', name: "O'Hare International Airport", state: 'IL', lat: 41.9742, lon: -87.9073 },
  ATL: { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', state: 'GA', lat: 33.6407, lon: -84.4277 },
  DFW: { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', state: 'TX', lat: 32.8998, lon: -97.0403 },
  MIA: { code: 'MIA', city: 'Miami', name: 'Miami International Airport', state: 'FL', lat: 25.7959, lon: -80.2870 },
  SFO: { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', state: 'CA', lat: 37.6213, lon: -122.3790 },
  SEA: { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', state: 'WA', lat: 47.4502, lon: -122.3088 },
  LAS: { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International Airport', state: 'NV', lat: 36.0840, lon: -115.1537 },
  BOS: { code: 'BOS', city: 'Boston', name: 'Boston Logan International Airport', state: 'MA', lat: 42.3656, lon: -71.0096 },
  DEN: { code: 'DEN', city: 'Denver', name: 'Denver International Airport', state: 'CO', lat: 39.8561, lon: -104.6737 },
  PHX: { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International Airport', state: 'AZ', lat: 33.4373, lon: -112.0078 },
  MCO: { code: 'MCO', city: 'Orlando', name: 'Orlando International Airport', state: 'FL', lat: 28.4312, lon: -81.3081 }
};

export const AIRLINES_DB = {
  SA: {
    name: 'Sample Air',
    code: 'SA',
    hub: 'New York (JFK)',
    color: '#0052CC',
    logoSvg: `<svg viewBox="0 0 100 40" width="80" height="32"><rect width="100" height="40" rx="6" fill="#0052CC"/><text x="50" y="25" fill="#FFF" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900" font-size="12" text-anchor="middle" letter-spacing="0.5">Sample Air</text></svg>`,
    fleet: ['Boeing 737-800', 'Airbus A321neo'],
    terminal: 'T4',
    rating: 4.8
  },
  DA: {
    name: 'Demo Airways',
    code: 'DA',
    hub: 'Los Angeles (LAX)',
    color: '#D9381E',
    logoSvg: `<svg viewBox="0 0 100 40" width="80" height="32"><rect width="100" height="40" rx="6" fill="#D9381E"/><text x="50" y="25" fill="#FFF" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900" font-size="11" text-anchor="middle" letter-spacing="0.5">Demo Airways</text></svg>`,
    fleet: ['Boeing 787-9', 'Airbus A320neo'],
    terminal: 'T6',
    rating: 4.7
  },
  AS: {
    name: 'American Skies',
    code: 'AS',
    hub: 'Chicago (ORD)',
    color: '#1B365D',
    logoSvg: `<svg viewBox="0 0 100 40" width="80" height="32"><rect width="100" height="40" rx="6" fill="#1B365D"/><text x="50" y="25" fill="#FFF" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="0.5">American Skies</text></svg>`,
    fleet: ['Boeing 777-200', 'Boeing 737 MAX 9'],
    terminal: 'T3',
    rating: 4.9
  },
  PC: {
    name: 'Pacific Coast Air',
    code: 'PC',
    hub: 'San Francisco (SFO)',
    color: '#008080',
    logoSvg: `<svg viewBox="0 0 100 40" width="80" height="32"><rect width="100" height="40" rx="6" fill="#008080"/><text x="50" y="25" fill="#FFF" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="0.5">Pacific Coast</text></svg>`,
    fleet: ['Airbus A321XLR', 'Embraer E175'],
    terminal: 'T2',
    rating: 4.6
  },
  US: {
    name: 'United Sample Air',
    code: 'US',
    hub: 'Atlanta (ATL)',
    color: '#4A154B',
    logoSvg: `<svg viewBox="0 0 100 40" width="80" height="32"><rect width="100" height="40" rx="6" fill="#4A154B"/><text x="50" y="25" fill="#FFF" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="0.5">United Sample</text></svg>`,
    fleet: ['Boeing 757-200', 'Airbus A220-300'],
    terminal: 'South Concourse',
    rating: 4.8
  },
  SM: {
    name: 'SkyMetro Air',
    code: 'SM',
    hub: 'Dallas (DFW)',
    color: '#166534',
    logoSvg: `<svg viewBox="0 0 100 40" width="80" height="32"><rect width="100" height="40" rx="6" fill="#166534"/><text x="50" y="25" fill="#FFF" font-family="'Plus Jakarta Sans',sans-serif" font-weight="900" font-size="11" text-anchor="middle" letter-spacing="0.5">SkyMetro Air</text></svg>`,
    fleet: ['Boeing 737-700', 'Airbus A319'],
    terminal: 'Terminal C',
    rating: 4.5
  }
};

/**
 * Great-circle distance helper between two geo-coordinates in miles
 */
function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate realistic duration in minutes based on distance
 */
function getRealisticDurationMinutes(distMiles) {
  // Average cruising speed 460 mph + 35 mins takeoff/landing/taxi
  const flightHours = distMiles / 460;
  const flightMinutes = Math.round(flightHours * 60) + 35;
  return Math.max(55, flightMinutes);
}

/**
 * Format minutes into "Xh Ym"
 */
function formatDurationStr(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/**
 * Helper to match an input string to a known airport
 */
function resolveAirport(inputStr, defaultCode = 'JFK') {
  if (!inputStr) return US_AIRPORTS[defaultCode];
  const clean = inputStr.toUpperCase().trim();
  
  // Direct IATA match
  for (const code of Object.keys(US_AIRPORTS)) {
    if (clean === code || clean.includes(`(${code})`) || clean.includes(code)) {
      return US_AIRPORTS[code];
    }
  }

  // City or Name match
  for (const airport of Object.values(US_AIRPORTS)) {
    if (airport.city.toUpperCase().includes(clean) || clean.includes(airport.city.toUpperCase()) ||
        airport.name.toUpperCase().includes(clean) || clean.includes(airport.name.toUpperCase())) {
      return airport;
    }
  }

  return US_AIRPORTS[defaultCode] || US_AIRPORTS.JFK;
}

/**
 * Primary search engine for sample flights connecting US hub airports
 */
export function searchRealFlights(fromText = 'JFK', toText = 'LAX', options = {}) {
  const origin = resolveAirport(fromText, 'JFK');
  let destination = resolveAirport(toText, 'LAX');

  // Prevent same airport
  if (origin.code === destination.code) {
    destination = origin.code === 'JFK' ? US_AIRPORTS.LAX : US_AIRPORTS.JFK;
  }

  const distMiles = calculateDistanceMiles(origin.lat, origin.lon, destination.lat, destination.lon);
  const baseDurationMins = getRealisticDurationMinutes(distMiles);

  // Template scheduled departures throughout the day
  const scheduleSlots = [
    { hour: 6, min: 15, airlineKey: 'SA', flightNum: '102', aircraft: 'Boeing 737-800', priceMult: 0.95, stops: 0 },
    { hour: 8, min: 30, airlineKey: 'DA', flightNum: '204', aircraft: 'Airbus A321neo', priceMult: 1.05, stops: 0 },
    { hour: 11, min: 15, airlineKey: 'AS', flightNum: '318', aircraft: 'Boeing 787-9', priceMult: 1.15, stops: 0 },
    { hour: 13, min: 45, airlineKey: 'PC', flightNum: '412', aircraft: 'Airbus A321XLR', priceMult: 1.00, stops: 0 },
    { hour: 16, min: 20, airlineKey: 'US', flightNum: '526', aircraft: 'Boeing 757-200', priceMult: 1.20, stops: 0 },
    { hour: 18, min: 50, airlineKey: 'SM', flightNum: '638', aircraft: 'Boeing 737-700', priceMult: 0.90, stops: 0 },
    { hour: 10, min: 0, airlineKey: 'AS', flightNum: '744', aircraft: 'Airbus A320neo', priceMult: 0.85, stops: 1, stopDurationExtra: 95, stopCity: 'Denver (DEN)' }
  ];

  // Base fare roughly $60 minimum + $0.09 per mile
  const baseFareUSD = Math.round(59 + distMiles * 0.088);

  return scheduleSlots.map((slot, idx) => {
    const airline = AIRLINES_DB[slot.airlineKey] || AIRLINES_DB.SA;
    const durMins = baseDurationMins + (slot.stopDurationExtra || 0);

    // Compute 12-hour formatted departure
    const deptH = slot.hour;
    const deptM = slot.min;
    const deptAmPm = deptH >= 12 ? 'PM' : 'AM';
    const deptH12 = deptH % 12 === 0 ? 12 : deptH % 12;
    const deptTime = `${deptH12.toString().padStart(2, '0')}:${deptM.toString().padStart(2, '0')} ${deptAmPm}`;

    // Compute arrival time
    const arrTotalMins = (deptH * 60 + deptM + durMins) % (24 * 60);
    const arrH = Math.floor(arrTotalMins / 60);
    const arrM = arrTotalMins % 60;
    const arrAmPm = arrH >= 12 ? 'PM' : 'AM';
    const arrH12 = arrH % 12 === 0 ? 12 : arrH % 12;
    const arrTime = `${arrH12.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')} ${arrAmPm}`;

    const fare = Math.max(79, Math.round(baseFareUSD * slot.priceMult));

    return {
      id: `fl-${slot.airlineKey.toLowerCase()}-${origin.code.toLowerCase()}-${destination.code.toLowerCase()}-${idx + 1}`,
      airlineKey: slot.airlineKey,
      airlineName: airline.name,
      airlineLogoSvg: airline.logoSvg,
      flightNumber: `${slot.airlineKey}-${slot.flightNum}`,
      fromCity: origin.city,
      fromCode: origin.code,
      fromAirport: origin.name,
      toCity: destination.city,
      toCode: destination.code,
      toAirport: destination.name,
      deptTime,
      arrTime,
      duration: formatDurationStr(durMins),
      durationMinutes: durMins,
      stops: slot.stops === 0 ? 'Non-stop' : `1 stop (${slot.stopCity || 'ORD'})`,
      stopsCount: slot.stops,
      aircraft: slot.aircraft,
      terminalDept: `Terminal ${airline.terminal || '1'}`,
      terminalArr: 'Main Terminal',
      onTimeRate: `${94 + (idx % 5)}%`,
      price: fare,
      currency: 'USD',
      baggage: slot.stops === 0 ? '1 Carry-on (22 lbs) + Personal Item' : '1 Carry-on + 1 Checked Bag (50 lbs)',
      amenities: ['Fast Wi-Fi', 'Complimentary Beverages', 'In-seat USB Power', 'Streaming Entertainment'],
      cabin: options.cabin || 'Economy',
      isSampleFare: true,
      notice: 'Sample fares for demonstration'
    };
  });
}

export const searchCuratedFlights = searchRealFlights;
