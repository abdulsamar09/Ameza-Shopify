/**
 * AMEZA TRAVEL SERVICES ENGINE
 * Comprehensive Interactive Booking & Reservation System (USA Standard)
 * Services: Stays (Hotels) | Flights | Car Rentals | Attractions | Airport Taxis
 * All pricing in USD, domestic US routes, airports and destinations.
 */

// ==========================================================================
// 1. COMPREHENSIVE DATA STORE (100% USA Standard)
// ==========================================================================

export const TRAVEL_DATA = {
  // 1. STAYS / HOTELS (U.S. Cities)
  stays: [
    {
      id: 'stay-1',
      name: 'The Plaza Hotel Fifth Avenue',
      city: 'New York',
      state: 'NY',
      location: 'Fifth Avenue at Central Park South, New York, NY',
      distance: 'Adjacent to Central Park',
      stars: 5,
      rating: 9.6,
      verdict: 'Exceptional',
      reviewsCount: 3120,
      price: 285,
      taxesAndFees: 38,
      originalPrice: 360,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      badge: 'Iconic Central Park',
      amenities: ['Free High-Speed Wi-Fi', 'Luxury Spa', 'Central Park Views', 'Valet Parking', 'Room Service'],
      perks: 'Free cancellation up to 48 hours before check-in • No deposit required'
    },
    {
      id: 'stay-2',
      name: 'The Beverly Hills Hotel',
      city: 'Los Angeles',
      state: 'CA',
      location: 'Sunset Boulevard, Beverly Hills, CA',
      distance: 'In the heart of Beverly Hills',
      stars: 5,
      rating: 9.7,
      verdict: 'Exceptional',
      reviewsCount: 2450,
      price: 395,
      taxesAndFees: 48,
      originalPrice: 480,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      badge: 'Hollywood Legend',
      amenities: ['Outdoor Heated Pool', 'Private Cabanas', 'Full Spa', 'Fine Dining', 'Free Wi-Fi'],
      perks: 'Free cancellation up to 48 hours before check-in'
    },
    {
      id: 'stay-3',
      name: 'Fontainebleau Miami Beach Resort',
      city: 'Miami',
      state: 'FL',
      location: 'Collins Avenue, Miami Beach, FL',
      distance: 'Direct beachfront access',
      stars: 5,
      rating: 9.3,
      verdict: 'Superb',
      reviewsCount: 3890,
      price: 245,
      taxesAndFees: 32,
      originalPrice: 320,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      badge: 'Oceanfront Luxury',
      amenities: ['Private Beach', 'Multiple Lagoon Pools', 'Lapis Spa', 'Nightclub', 'Free Wi-Fi'],
      perks: 'Free cancellation up to 72 hours before check-in'
    },
    {
      id: 'stay-4',
      name: 'The Venetian Resort Las Vegas',
      city: 'Las Vegas',
      state: 'NV',
      location: 'Las Vegas Boulevard South, Las Vegas, NV',
      distance: 'Center of the Las Vegas Strip',
      stars: 5,
      rating: 9.4,
      verdict: 'Superb',
      reviewsCount: 5210,
      price: 189,
      taxesAndFees: 39,
      originalPrice: 260,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      badge: 'All-Suite Resort',
      amenities: ['Gondola Rides', 'Canyon Ranch Spa', '10+ Outdoor Pools', 'Casino', 'Free Wi-Fi'],
      perks: 'Free cancellation up to 48 hours before check-in'
    },
    {
      id: 'stay-5',
      name: 'The Drake Hotel Michigan Avenue',
      city: 'Chicago',
      state: 'IL',
      location: 'East Walton Place & Michigan Ave, Chicago, IL',
      distance: 'Magnificent Mile Landmark',
      stars: 4,
      rating: 9.1,
      verdict: 'Wonderful',
      reviewsCount: 2980,
      price: 195,
      taxesAndFees: 28,
      originalPrice: 250,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      badge: 'Historic Gold Coast',
      amenities: ['Lake Michigan Views', 'Historic Palm Court', 'Fitness Center', 'Room Service'],
      perks: 'Free cancellation up to 24 hours before check-in'
    },
    {
      id: 'stay-6',
      name: 'Fairmont San Francisco Nob Hill',
      city: 'San Francisco',
      state: 'CA',
      location: 'Mason Street, Nob Hill, San Francisco, CA',
      distance: 'Cable Car lines at front entrance',
      stars: 5,
      rating: 9.5,
      verdict: 'Exceptional',
      reviewsCount: 2150,
      price: 265,
      taxesAndFees: 36,
      originalPrice: 340,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      badge: 'Panoramic Bay Views',
      amenities: ['Bay & City Views', 'Tonga Room & Hurricane Bar', 'Fitness Center', 'Free Wi-Fi'],
      perks: 'Free cancellation up to 48 hours before check-in'
    },
    {
      id: 'stay-7',
      name: 'The Edgewater Hotel Waterfront',
      city: 'Seattle',
      state: 'WA',
      location: 'Alaskan Way, Pier 67, Seattle, WA',
      distance: 'Over Elliott Bay on the water',
      stars: 4,
      rating: 9.3,
      verdict: 'Superb',
      reviewsCount: 1840,
      price: 215,
      taxesAndFees: 29,
      originalPrice: 280,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      badge: 'Overwater Balconies',
      amenities: ['Elliott Bay Views', 'Six Seven Restaurant', 'Fireplace Suites', 'Pet Friendly'],
      perks: 'Free cancellation up to 48 hours before check-in'
    },
    {
      id: 'stay-8',
      name: 'The Driskill Historic Hotel',
      city: 'Austin',
      state: 'TX',
      location: 'Brazos Street & 6th St, Austin, TX',
      distance: 'Historic Downtown Austin',
      stars: 4,
      rating: 9.2,
      verdict: 'Wonderful',
      reviewsCount: 1670,
      price: 205,
      taxesAndFees: 27,
      originalPrice: 270,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      badge: 'Texas Heritage',
      amenities: ['Driskill Bar', 'Artisanal Bakery', 'Downtown Location', 'Free Wi-Fi'],
      perks: 'Free cancellation up to 24 hours before check-in'
    }
  ],

  // 2. FLIGHTS (U.S. Routes, Sample Airlines)
  flights: [
    {
      id: 'fl-1',
      airline: 'Sample Air',
      flightNumber: 'SA-101',
      logo: '✈️',
      from: 'New York (JFK)',
      fromCode: 'JFK',
      to: 'Los Angeles (LAX)',
      toCode: 'LAX',
      deptTime: '08:30 AM',
      arrTime: '11:45 AM',
      duration: '6h 15m',
      durationMinutes: 375,
      stops: 'Non-stop',
      stopsCount: 0,
      price: 289,
      cabinClass: 'Economy',
      baggage: '1 Carry-on (22 lbs) + Personal Item',
      amenities: ['In-seat Power', 'Fast Wi-Fi', 'Complimentary Drinks']
    },
    {
      id: 'fl-2',
      airline: 'Demo Airways',
      flightNumber: 'DA-204',
      logo: '🛫',
      from: 'New York (JFK)',
      fromCode: 'JFK',
      to: 'Los Angeles (LAX)',
      toCode: 'LAX',
      deptTime: '11:15 AM',
      arrTime: '02:40 PM',
      duration: '6h 25m',
      durationMinutes: 385,
      stops: 'Non-stop',
      stopsCount: 0,
      price: 319,
      cabinClass: 'Economy',
      baggage: '1 Carry-on + 1 Checked Bag (50 lbs)',
      amenities: ['Seatback HD Screens', 'Snack Box', 'USB-C Charging']
    },
    {
      id: 'fl-3',
      airline: 'Pacific Coast Air',
      flightNumber: 'PC-302',
      logo: '✈️',
      from: 'Los Angeles (LAX)',
      fromCode: 'LAX',
      to: 'New York (JFK)',
      toCode: 'JFK',
      deptTime: '01:15 PM',
      arrTime: '09:45 PM',
      duration: '5h 30m',
      durationMinutes: 330,
      stops: 'Non-stop',
      stopsCount: 0,
      price: 299,
      cabinClass: 'Economy',
      baggage: '1 Carry-on + Personal Item',
      amenities: ['Live Streaming Entertainment', 'AC Outlets', 'Premium Coffee']
    },
    {
      id: 'fl-4',
      airline: 'American Skies',
      flightNumber: 'AS-501',
      logo: '🇺🇸',
      from: 'Chicago (ORD)',
      fromCode: 'ORD',
      to: 'Los Angeles (LAX)',
      toCode: 'LAX',
      deptTime: '10:30 AM',
      arrTime: '12:45 PM',
      duration: '4h 15m',
      durationMinutes: 255,
      stops: 'Non-stop',
      stopsCount: 0,
      price: 199,
      cabinClass: 'Economy',
      baggage: '1 Carry-on + Personal Item',
      amenities: ['In-flight Entertainment', 'Complimentary Snacks', 'Wi-Fi']
    },
    {
      id: 'fl-5',
      airline: 'United Sample Air',
      flightNumber: 'US-602',
      logo: '✈️',
      from: 'New York (JFK)',
      fromCode: 'JFK',
      to: 'Miami (MIA)',
      toCode: 'MIA',
      deptTime: '07:00 AM',
      arrTime: '10:10 AM',
      duration: '3h 10m',
      durationMinutes: 190,
      stops: 'Non-stop',
      stopsCount: 0,
      price: 149,
      cabinClass: 'Economy',
      baggage: '1 Carry-on + Personal Item',
      amenities: ['Extra Legroom Seating', 'Live TV', 'Snack Service']
    },
    {
      id: 'fl-6',
      airline: 'Pacific Coast Air',
      flightNumber: 'PC-120',
      logo: '✈️',
      from: 'Los Angeles (LAX)',
      fromCode: 'LAX',
      to: 'San Francisco (SFO)',
      toCode: 'SFO',
      deptTime: '07:30 AM',
      arrTime: '08:55 AM',
      duration: '1h 25m',
      durationMinutes: 85,
      stops: 'Non-stop',
      stopsCount: 0,
      price: 89,
      cabinClass: 'Economy',
      baggage: '1 Carry-on + Personal Item',
      amenities: ['California Coastal Shuttle', 'Coffee & Tea', 'USB Power']
    }
  ],

  // 3. CAR RENTALS (U.S. Airports, USD/day, Miles)
  cars: [
    {
      id: 'car-1',
      title: 'Toyota Camry / Corolla Hybrid Sedan',
      category: 'Economy / Compact',
      type: 'economy',
      supplier: 'Enterprise Rent-a-Car',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 2,
      doors: 4,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 39,
      rating: 9.2,
      reviewsCount: 1450,
      location: 'JFK Airport &bull; Terminal Counter',
      mileage: 'Unlimited Miles Included',
      cancellation: 'Free cancellation up to 48 hours'
    },
    {
      id: 'car-2',
      title: 'Tesla Model 3 / Model Y Long Range',
      category: 'Electric / Hybrid',
      type: 'electric',
      supplier: 'Hertz Clean Collection',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 3,
      doors: 4,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 68,
      rating: 9.6,
      reviewsCount: 820,
      location: 'LAX Airport &bull; Express Pickup',
      mileage: 'Unlimited Miles Included &bull; Supercharging Access',
      cancellation: 'Free cancellation anytime'
    },
    {
      id: 'car-3',
      title: 'Ford Explorer / Jeep Grand Cherokee 4WD',
      category: 'SUV / 4x4',
      type: 'suv',
      supplier: 'National Car Rental',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      seats: 7,
      bags: 4,
      doors: 5,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 85,
      rating: 9.4,
      reviewsCount: 930,
      location: 'ORD Airport &bull; Shuttle Service',
      mileage: 'Unlimited Miles Included',
      cancellation: 'Free cancellation up to 24 hours'
    },
    {
      id: 'car-4',
      title: 'Mercedes-Benz C-Class / BMW 3 Series',
      category: 'Luxury / Premium',
      type: 'luxury',
      supplier: 'Avis Signature Fleet',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 3,
      doors: 4,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 95,
      rating: 9.5,
      reviewsCount: 640,
      location: 'MIA Airport &bull; Meet & Greet',
      mileage: 'Unlimited Miles Included',
      cancellation: 'Free cancellation up to 48 hours'
    }
  ],

  // 4. ATTRACTIONS (U.S. Cities, USD, Fahrenheit)
  attractions: [
    {
      id: 'attr-1',
      title: 'Manhattan Skyline Architecture River Cruise',
      city: 'New York',
      country: 'United States',
      category: 'Cruises & Water',
      catType: 'cruises',
      duration: '1.5 - 2 Hours',
      rating: 4.92,
      reviewsCount: 14850,
      price: 42,
      originalPrice: 55,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      badge: 'Best Seller',
      highlights: ['360° views of Empire State & One World Trade', 'Close-up passage by Statue of Liberty', 'Climate-controlled outdoor/indoor decks'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-2',
      title: 'Hollywood Hills & Beverly Hills Celebrity Sightseeing Tour',
      city: 'Los Angeles',
      country: 'United States',
      category: 'Tours & Sightseeing',
      catType: 'tours',
      duration: '2 Hours',
      rating: 4.88,
      reviewsCount: 9840,
      price: 49,
      originalPrice: 65,
      image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
      badge: 'Top LA Tour',
      highlights: ['Open-air panoramic luxury minibus', 'Hollywood Sign exclusive photo stop', 'Celebrity homes along Mulholland Drive'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-3',
      title: 'Everglades Airboat Wildlife Adventure & Gator Show',
      city: 'Miami',
      country: 'United States',
      category: 'Day Trips & Tours',
      catType: 'tours',
      duration: '4 Hours',
      rating: 4.89,
      reviewsCount: 7640,
      price: 54,
      originalPrice: 70,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      badge: 'Family Favorite',
      highlights: ['High-speed guided airboat glide', 'Wild alligator & bird sightings', 'Educational wildlife sanctuary access'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-4',
      title: 'Las Vegas Strip Nighttime Panoramic Open-Top Tour',
      city: 'Las Vegas',
      country: 'United States',
      category: 'Night Tours',
      catType: 'landmarks',
      duration: '3 Hours',
      rating: 4.86,
      reviewsCount: 11200,
      price: 39,
      originalPrice: 50,
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      badge: 'Vegas Nightlife',
      highlights: ['Illuminated Strip resorts & Bellagio Fountains', 'Fremont Street Viva Vision light canopy stop', 'Live entertaining local guide commentary'],
      cancellation: 'Free cancellation up to 12 hours before'
    },
    {
      id: 'attr-5',
      title: 'Chicago Architecture Foundation River Cruise',
      city: 'Chicago',
      country: 'United States',
      category: 'Landmarks & Views',
      catType: 'cruises',
      duration: '1.5 Hours',
      rating: 4.96,
      reviewsCount: 16500,
      price: 52,
      originalPrice: 65,
      image: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80',
      badge: 'Award Winner',
      highlights: ['Narrated by expert certified docents', 'Detailed history of 50+ iconic skyscrapers', 'Covers all 3 branches of the Chicago River'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-6',
      title: 'Golden Gate Bay & Alcatraz Island Sightseeing Cruise',
      city: 'San Francisco',
      country: 'United States',
      category: 'Cruises & Water',
      catType: 'cruises',
      duration: '1 Hour',
      rating: 4.91,
      reviewsCount: 13900,
      price: 38,
      originalPrice: 48,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      badge: 'Bay Classic',
      highlights: ['Sail directly under Golden Gate Bridge', 'Close perimeter cruise past Alcatraz', 'Multi-language audio narration included'],
      cancellation: 'Free cancellation up to 24 hours before'
    }
  ],

  // 5. AIRPORT TAXIS (U.S. Transfers, Miles, USD)
  taxis: [
    {
      id: 'taxi-1',
      vehicleClass: 'Standard Sedan',
      example: 'Toyota Camry / Honda Accord or similar',
      badge: 'Most Economical',
      passengers: 3,
      luggage: 2,
      baseFare: 55,
      routeExample: 'JFK Airport to Midtown Manhattan (~18 miles)',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
      features: [
        'Meet & Greet inside arrivals terminal',
        'Free 60 minutes flight delay waiting time',
        'All highway tolls and airport fees included',
        'Optional driver gratuity (15-20% customary in the U.S.)'
      ]
    },
    {
      id: 'taxi-2',
      vehicleClass: 'Executive Premium Sedan',
      example: 'Cadillac CT6 / Mercedes-Benz E-Class',
      badge: 'Business Class',
      passengers: 3,
      luggage: 3,
      baseFare: 85,
      routeExample: 'LAX Airport to Beverly Hills / Santa Monica (~15 miles)',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      features: [
        'Professional suited chauffeur',
        'Complimentary bottled water & phone chargers',
        'Free 90 minutes flight delay waiting',
        'Quiet luxury interior & smooth ride'
      ]
    },
    {
      id: 'taxi-3',
      vehicleClass: 'Full-Size Family SUV / Minivan',
      example: 'Chevrolet Suburban / Ford Expedition',
      badge: 'Family & Groups',
      passengers: 6,
      luggage: 6,
      baseFare: 110,
      routeExample: "O'Hare (ORD) to Downtown Chicago Loop (~17 miles)",
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      features: [
        'Extra spacious seating with massive trunk capacity',
        'Child car safety seat available upon advance request',
        'Free 60 minutes airport buffer time',
        'Ideal for groups with bulky luggage'
      ]
    },
    {
      id: 'taxi-4',
      vehicleClass: 'Eco Electric Airport Shuttle',
      example: 'Tesla Model Y / Model X',
      badge: '100% Electric',
      passengers: 4,
      luggage: 3,
      baseFare: 68,
      routeExample: 'Miami Airport (MIA) to South Beach (~12 miles)',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
      features: [
        'Zero emissions clean energy journey',
        'Silent ride with high-tech panoramic glass roof',
        'Free flight status GPS tracking',
        'Direct curbside terminal pickup'
      ]
    }
  ]
};

// ==========================================================================
// 2. STATE & STORAGE MANAGEMENT
// ==========================================================================
export const TravelState = {
  bookings: JSON.parse(localStorage.getItem('ameza_travel_bookings')) || [],
  
  saveBooking(booking) {
    this.bookings.unshift(booking);
    localStorage.setItem('ameza_travel_bookings', JSON.stringify(this.bookings));
    showTravelToast(`🎉 Reservation Confirmed! Reference: #${booking.bookingId}`);
  },

  getBookings() {
    return this.bookings;
  },

  cancelBooking(bookingId) {
    this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
    localStorage.setItem('ameza_travel_bookings', JSON.stringify(this.bookings));
    showTravelToast(`Booking #${bookingId} has been cancelled.`);
  }
};

export function showTravelToast(message) {
  let toast = document.getElementById('travel-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'travel-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0F172A;
      border: 2px solid #7FB73C;
      color: #FFFFFF;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 12px 36px rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #7FB73C; font-size: 1.2rem;"></i> <span>${message}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 4000);
}

export function generateBookingId(prefix = 'BK') {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

