const fs = require('fs');

console.log('--- Cleaning Travel Content to 100% USA Standard ---');

// 1. stays.html
if (fs.existsSync('stays.html')) {
  let content = fs.readFileSync('stays.html', 'utf8');
  content = content.replace(/Verified Worldwide Stays/g, 'Verified U.S. Stays');
  content = content.replace(/travellers worldwide/g, 'travelers across the United States');
  content = content.replace(/Worldwide Flight Bookings/g, 'Domestic U.S. Flight Bookings');
  content = content.replace(/e\.g\. Miami, Chicago, Paris/g, 'e.g. New York, Los Angeles, Miami');
  content = content.replace(/Seattle, United States/g, 'New York, NY');
  content = content.replace(/Philadelphia, United States/g, 'Los Angeles, CA');
  content = content.replace(/Miami, United States/g, 'Miami, FL');
  content = content.replace(/Houston, United States/g, 'Las Vegas, NV');
  content = content.replace(/Phoenix, United States/g, 'Chicago, IL');
  content = content.replace(/Istanbul, Turkey/g, 'San Francisco, CA');
  content = content.replace(/Kuala Lumpur, Malaysia/g, 'Seattle, WA');
  content = content.replace(/Chicago, United Kingdom/g, 'Austin, TX');
  content = content.replace(/Paris, France/g, 'Nashville, TN');
  content = content.replace(/Tokyo, Japan/g, 'Orlando, FL');

  content = content.replace(/<div class="popover-primary">Seattle<\/div>/g, '<div class="popover-primary">New York</div>');
  content = content.replace(/<div class="popover-primary">Philadelphia<\/div>/g, '<div class="popover-primary">Los Angeles</div>');
  content = content.replace(/<div class="popover-primary">Miami<\/div>/g, '<div class="popover-primary">Miami</div>');
  content = content.replace(/<div class="popover-primary">Houston<\/div>/g, '<div class="popover-primary">Las Vegas</div>');
  content = content.replace(/<div class="popover-primary">Phoenix<\/div>/g, '<div class="popover-primary">Chicago</div>');
  content = content.replace(/<div class="popover-primary">Istanbul<\/div>/g, '<div class="popover-primary">San Francisco</div>');
  content = content.replace(/<div class="popover-primary">Kuala Lumpur<\/div>/g, '<div class="popover-primary">Seattle</div>');
  content = content.replace(/<div class="popover-primary">Chicago<\/div>/g, '<div class="popover-primary">Austin</div>');
  content = content.replace(/<div class="popover-primary">Paris<\/div>/g, '<div class="popover-primary">Nashville</div>');

  content = content.replace(/<div class="popover-sub">United States<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">United States<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">United Kingdom<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">France<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">Turkey<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">Malaysia<\/div>/g, '<div class="popover-sub">United States</div>');

  // Trending cards
  content = content.replace(/data-city="Miami" title="Explore Miami Stays"/g, 'data-city="New York" title="Explore New York Stays"');
  content = content.replace(/<h3 class="dest-card-name">Miami 🇦🇪<\/h3>/g, '<h3 class="dest-card-name">New York 🇺🇸</h3>');
  content = content.replace(/data-city="Chicago" title="Explore Chicago Stays"/g, 'data-city="Los Angeles" title="Explore Los Angeles Stays"');
  content = content.replace(/<h3 class="dest-card-name">Chicago 🇬🇧<\/h3>/g, '<h3 class="dest-card-name">Los Angeles 🇺🇸</h3>');
  content = content.replace(/data-city="Paris" title="Explore Paris Stays"/g, 'data-city="Miami" title="Explore Miami Stays"');
  content = content.replace(/<h3 class="dest-card-name">Paris 🇫🇷<\/h3>/g, '<h3 class="dest-card-name">Miami 🇺🇸</h3>');
  content = content.replace(/data-city="Tokyo" title="Explore Tokyo Stays"/g, 'data-city="Las Vegas" title="Explore Las Vegas Stays"');
  content = content.replace(/<h3 class="dest-card-name">Tokyo 🇯🇵<\/h3>/g, '<h3 class="dest-card-name">Las Vegas 🇺🇸</h3>');

  fs.writeFileSync('stays.html', content, 'utf8');
  console.log('  stays.html updated');
}

// 2. stays-search.html
if (fs.existsSync('stays-search.html')) {
  let content = fs.readFileSync('stays-search.html', 'utf8');
  content = content.replace(/Seattle, United States/g, 'New York, NY');
  content = content.replace(/Philadelphia, United States/g, 'Los Angeles, CA');
  content = content.replace(/Miami, United States/g, 'Miami, FL');
  content = content.replace(/Houston, United States/g, 'Las Vegas, NV');
  content = content.replace(/Phoenix, United States/g, 'Chicago, IL');
  content = content.replace(/Istanbul, Turkey/g, 'San Francisco, CA');
  content = content.replace(/Kuala Lumpur, Malaysia/g, 'Seattle, WA');
  content = content.replace(/Chicago, United Kingdom/g, 'Austin, TX');
  content = content.replace(/Paris, France/g, 'Nashville, TN');
  content = content.replace(/Tokyo, Japan/g, 'Orlando, FL');

  content = content.replace(/<div class="popover-primary">Seattle<\/div>/g, '<div class="popover-primary">New York</div>');
  content = content.replace(/<div class="popover-primary">Philadelphia<\/div>/g, '<div class="popover-primary">Los Angeles</div>');
  content = content.replace(/<div class="popover-primary">Miami<\/div>/g, '<div class="popover-primary">Miami</div>');
  content = content.replace(/<div class="popover-primary">Houston<\/div>/g, '<div class="popover-primary">Las Vegas</div>');
  content = content.replace(/<div class="popover-primary">Phoenix<\/div>/g, '<div class="popover-primary">Chicago</div>');
  content = content.replace(/<div class="popover-primary">Istanbul<\/div>/g, '<div class="popover-primary">San Francisco</div>');
  content = content.replace(/<div class="popover-primary">Kuala Lumpur<\/div>/g, '<div class="popover-primary">Seattle</div>');
  content = content.replace(/<div class="popover-primary">Chicago<\/div>/g, '<div class="popover-primary">Austin</div>');
  content = content.replace(/<div class="popover-primary">Paris<\/div>/g, '<div class="popover-primary">Nashville</div>');

  content = content.replace(/<div class="popover-sub">United States<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">United States<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">United Kingdom<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">France<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">Turkey<\/div>/g, '<div class="popover-sub">United States</div>');
  content = content.replace(/<div class="popover-sub">Malaysia<\/div>/g, '<div class="popover-sub">United States</div>');

  fs.writeFileSync('stays-search.html', content, 'utf8');
  console.log('  stays-search.html updated');
}

// 3. car-rental.html
if (fs.existsSync('car-rental.html')) {
  let content = fs.readFileSync('car-rental.html', 'utf8');
  content = content.replace(/Worldwide Flight Bookings/g, 'Domestic U.S. Flight Bookings');
  content = content.replace(/Miami International Airport \(DXB\)/g, 'John F. Kennedy Int\'l Airport (JFK)');
  content = content.replace(/Miami International \(DXB\)/g, 'John F. Kennedy Int\'l (JFK)');
  content = content.replace(/Orlando International Airport \(AUH\)/g, 'Los Angeles Int\'l Airport (LAX)');
  content = content.replace(/Chicago O'Hare Airport \(LHR\)/g, 'Chicago O\'Hare Int\'l (ORD)');
  content = content.replace(/Chicago O'Hare \(LHR\)/g, 'Chicago O\'Hare (ORD)');
  content = content.replace(/Jinnah International Airport \(KHI\)/g, 'Miami International Airport (MIA)');
  content = content.replace(/Allama Iqbal Int'l Airport \(LHE\)/g, 'San Francisco Int\'l Airport (SFO)');
  content = content.replace(/Philadelphia International Airport \(ISB\)/g, 'Seattle-Tacoma Int\'l Airport (SEA)');
  content = content.replace(/Miami, United States/g, 'New York, United States');
  content = content.replace(/Orlando, United States/g, 'Los Angeles, United States');
  content = content.replace(/Chicago, United Kingdom/g, 'Chicago, United States');
  content = content.replace(/Houston, United States/g, 'Miami, United States');
  content = content.replace(/Phoenix, United States/g, 'San Francisco, United States');
  content = content.replace(/Philadelphia, United States/g, 'Seattle, United States');

  content = content.replace(/Miami Downtown & Marina/g, 'Manhattan Downtown & Midtown');
  content = content.replace(/Orlando Corniche & Yas/g, 'Santa Monica & Beverly Hills');
  content = content.replace(/Chicago Central & West End/g, 'Chicago The Loop & Michigan Ave');
  content = content.replace(/value="Miami International Airport \(DXB\)"/g, 'value="John F. Kennedy Int\'l Airport (JFK)"');
  content = content.replace(/value="Miami \(DXB\)"/g, 'value="New York (JFK)"');

  fs.writeFileSync('car-rental.html', content, 'utf8');
  console.log('  car-rental.html updated');
}

// 4. attractions.html
if (fs.existsSync('attractions.html')) {
  let content = fs.readFileSync('attractions.html', 'utf8');
  content = content.replace(/Worldwide Flight Bookings/g, 'Domestic U.S. Flight Bookings');
  content = content.replace(/Miami Red Dunes Desert Safari[^<]*/g, 'Manhattan Skyline Architecture River Cruise');
  content = content.replace(/Burj Khalifa At The Top[^<]*/g, 'Hollywood Hills & Celebrity Sightseeing Tour');
  content = content.replace(/Tower of Chicago[^<]*/g, 'Chicago Architecture Foundation River Cruise');
  content = content.replace(/The Chicago Eye[^<]*/g, 'Golden Gate Bay & Alcatraz Island Sightseeing Cruise');
  content = content.replace(/Miami/g, 'New York');
  content = content.replace(/Chicago/g, 'Los Angeles');

  fs.writeFileSync('attractions.html', content, 'utf8');
  console.log('  attractions.html updated');
}

// 5. airport-taxis.html
if (fs.existsSync('airport-taxis.html')) {
  let content = fs.readFileSync('airport-taxis.html', 'utf8');
  content = content.replace(/Worldwide Flight Bookings/g, 'Domestic U.S. Flight Bookings');
  content = content.replace(/Miami International Airport \(DXB\)/g, 'John F. Kennedy Int\'l Airport (JFK)');
  content = content.replace(/Miami \(DXB\)/g, 'New York (JFK)');
  content = content.replace(/DXB/g, 'JFK');
  content = content.replace(/Chicago O'Hare Airport \(LHR\)/g, 'Los Angeles Int\'l Airport (LAX)');
  content = content.replace(/Chicago O'Hare \(LHR\)/g, 'Los Angeles (LAX)');
  content = content.replace(/Chicago \(LHR\)/g, 'Los Angeles (LAX)');
  content = content.replace(/LHR/g, 'LAX');
  content = content.replace(/Miami/g, 'New York');
  content = content.replace(/Chicago/g, 'Los Angeles');

  fs.writeFileSync('airport-taxis.html', content, 'utf8');
  console.log('  airport-taxis.html updated');
}

// 6. flights.html
if (fs.existsSync('flights.html')) {
  let content = fs.readFileSync('flights.html', 'utf8');
  content = content.replace(/Book genuine scheduled flights with Emirates, Qatar Airways, British Airways, PIA, flydubai and global airlines on AMEZA\./g, 'Book domestic U.S. flights with sample airfares, real-time availability, and instant electronic tickets on AMEZA.');
  content = content.replace(/Worldwide Flight Bookings/g, 'Domestic U.S. Flight Bookings');
  content = content.replace(/value="Miami \(DXB\)"/g, 'value="New York (JFK)"');
  content = content.replace(/value="Chicago O'Hare \(LHR\)"/g, 'value="Los Angeles (LAX)"');
  content = content.replace(/Available Flights: Miami \(DXB\) &rarr; Chicago \(LHR\)/g, 'Available Flights: New York (JFK) &rarr; Los Angeles (LAX)');
  content = content.replace(/Miami \(DXB\)/g, 'New York (JFK)');
  content = content.replace(/Chicago O'Hare \(LHR\)/g, 'Los Angeles (LAX)');
  content = content.replace(/Miami International Airport \(DXB\)/g, 'John F. Kennedy Int\'l Airport (JFK)');
  content = content.replace(/Miami International \(DXB\)/g, 'John F. Kennedy Int\'l (JFK)');
  content = content.replace(/Jinnah International Airport \(KHI\)/g, 'Chicago O\'Hare International Airport (ORD)');
  content = content.replace(/Houston, United States/g, 'Chicago, Illinois');
  content = content.replace(/Allama Iqbal Int'l Airport \(LHE\)/g, 'Hartsfield-Jackson Atlanta Int\'l (ATL)');
  content = content.replace(/Allama Iqbal Int'l \(LHE\)/g, 'Atlanta Int\'l (ATL)');
  content = content.replace(/Phoenix, United States/g, 'Atlanta, Georgia');
  content = content.replace(/Philadelphia International Airport \(ISB\)/g, 'Dallas/Fort Worth Int\'l Airport (DFW)');
  content = content.replace(/Philadelphia Int'l \(ISB\)/g, 'Dallas/Fort Worth (DFW)');
  content = content.replace(/Philadelphia, United States/g, 'Dallas, Texas');
  content = content.replace(/Chicago O'Hare Airport \(LHR\)/g, 'Miami International Airport (MIA)');
  content = content.replace(/Chicago, United Kingdom/g, 'Miami, Florida');
  content = content.replace(/Hamad International Airport \(DOH\)/g, 'San Francisco Int\'l Airport (SFO)');
  content = content.replace(/Doha, Qatar/g, 'San Francisco, California');
  content = content.replace(/King Abdulaziz Int'l \(JED\)/g, 'Seattle-Tacoma Int\'l (SEA)');
  content = content.replace(/Jeddah, Saudi Arabia/g, 'Seattle, Washington');
  content = content.replace(/Istanbul Airport \(IST\)/g, 'Harry Reid Int\'l (LAS)');
  content = content.replace(/Istanbul, Turkey/g, 'Las Vegas, Nevada');
  content = content.replace(/Paris Charles de Gaulle \(CDG\)/g, 'Logan International Airport (BOS)');
  content = content.replace(/Paris, France/g, 'Boston, Massachusetts');
  content = content.replace(/Tokyo Haneda \(HND\)/g, 'Denver International Airport (DEN)');
  content = content.replace(/Tokyo, Japan/g, 'Denver, Colorado');
  content = content.replace(/Singapore Changi Airport \(SIN\)/g, 'Phoenix Sky Harbor Int\'l (PHX)');
  content = content.replace(/Singapore Changi \(SIN\)/g, 'Phoenix Sky Harbor (PHX)');
  content = content.replace(/Singapore/g, 'Phoenix, Arizona');
  content = content.replace(/Suvarnabhumi Airport \(BKK\)/g, 'Orlando International Airport (MCO)');
  content = content.replace(/Bangkok Suvarnabhumi \(BKK\)/g, 'Orlando Int\'l (MCO)');
  content = content.replace(/Bangkok, Thailand/g, 'Orlando, Florida');

  // Relative Date: 30 days from now
  const thirtyDaysAhead = new Date();
  thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = thirtyDaysAhead.toLocaleDateString('en-US', options);
  content = content.replace(/value="Thu, Oct 15 &mdash; Fri, Oct 23, 2026"/g, `value="${dateStr}"`);

  // Default search fallback
  content = content.replace(/'Miami \(DXB\)'/g, "'New York (JFK)'");
  content = content.replace(/'Chicago O'Hare \(LHR\)'/g, "'Los Angeles (LAX)'");

  fs.writeFileSync('flights.html', content, 'utf8');
  console.log('  flights.html updated');
}

console.log('--- Travel Content Clean Complete ---');
