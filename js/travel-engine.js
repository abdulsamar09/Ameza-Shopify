/**
 * AMEZA TRAVEL SERVICES ENGINE
 * Comprehensive Interactive Booking & Reservation System
 * Services: Stays (Hotels) | Flights | Car Rentals | Attractions | Airport Taxis
 */

// ==========================================================================
// 1. COMPREHENSIVE DATA STORE
// ==========================================================================

export const TRAVEL_DATA = {
  // 1. STAYS / HOTELS
  stays: [
    {
      id: 'stay-1',
      name: 'The Ritz-Carlton Grand Resort & Spa',
      city: 'Dubai',
      location: 'Jumeirah Beach Residence, Dubai',
      distance: '350m from beach',
      stars: 5,
      rating: 9.6,
      verdict: 'Exceptional',
      reviewsCount: 2840,
      price: 285,
      originalPrice: 380,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      badge: 'Beachfront Luxury',
      amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Airport Shuttle', 'Breakfast Included'],
      perks: 'Free cancellation before 48 hrs &bull; No prepayment needed'
    },
    {
      id: 'stay-2',
      name: 'The Savoy Luxury Heritage Hotel',
      city: 'London',
      location: 'Strand, Westminster, London',
      distance: '500m from Covent Garden',
      stars: 5,
      rating: 9.4,
      verdict: 'Superb',
      reviewsCount: 1920,
      price: 340,
      originalPrice: 420,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      badge: 'Top City Center',
      amenities: ['Free WiFi', 'Michelin Dining', 'Fitness Center', 'Breakfast Included'],
      perks: 'Breakfast included &bull; Free cancellation'
    },
    {
      id: 'stay-3',
      name: 'Grand Hyatt Eiffel View Suites',
      city: 'Paris',
      location: '16th Arrondissement, Paris',
      distance: '800m from Eiffel Tower',
      stars: 5,
      rating: 9.2,
      verdict: 'Wonderful',
      reviewsCount: 1650,
      price: 295,
      originalPrice: 360,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      badge: 'Eiffel Tower View',
      amenities: ['Balcony View', 'Free WiFi', 'Swimming Pool', 'Room Service'],
      perks: 'Free cancellation &bull; Pay at property'
    },
    {
      id: 'stay-4',
      name: 'Mandarin Oriental Skyline Oasis',
      city: 'Tokyo',
      location: 'Nihonbashi, Chuo City, Tokyo',
      distance: 'In Financial District',
      stars: 5,
      rating: 9.7,
      verdict: 'Exceptional',
      reviewsCount: 1480,
      price: 380,
      originalPrice: 490,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      badge: 'Skyline Panorama',
      amenities: ['Sky View Bath', 'Free WiFi', 'Spa & Onsen', 'Breakfast Included'],
      perks: 'Breakfast included &bull; Free cancellation'
    },
    {
      id: 'stay-5',
      name: 'The Plaza Hotel Fifth Avenue',
      city: 'New York',
      location: '5th Avenue at Central Park, New York',
      distance: 'Adjacent to Central Park',
      stars: 4,
      rating: 9.3,
      verdict: 'Superb',
      reviewsCount: 3120,
      price: 240,
      originalPrice: 350,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      badge: 'Iconic Landmark',
      amenities: ['Central Park Views', 'Free WiFi', 'Luxury Spa', 'Breakfast Included'],
      perks: 'Early check-in available &bull; Free cancellation'
    },
    {
      id: 'stay-6',
      name: 'Ayana Cliffside Rock Villas & Spa',
      city: 'Bali',
      location: 'Jimbaran Bay, Bali',
      distance: 'Private Cliffside Beach',
      stars: 5,
      rating: 9.8,
      verdict: 'Exceptional',
      reviewsCount: 4200,
      price: 230,
      originalPrice: 320,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      badge: 'Best Villa Resort',
      amenities: ['Swimming Pool', 'Private Beach', 'Sunset Rock Bar', 'Free WiFi'],
      perks: 'All-inclusive breakfast &bull; Free cancellation'
    }
  ],

  // 2. FLIGHTS
  flights: [
    {
      id: 'fl-1',
      airline: 'Emirates',
      flightNumber: 'EK-201',
      logo: '✈️',
      from: 'Dubai (DXB)',
      fromCode: 'DXB',
      to: 'London Heathrow (LHR)',
      toCode: 'LHR',
      deptTime: '07:45',
      arrTime: '12:20',
      duration: '7h 35m',
      durationMinutes: 455,
      stops: 'Direct',
      stopsCount: 0,
      price: 485,
      cabinClass: 'Economy',
      baggage: '30 kg Check-in &bull; 7 kg Cabin',
      amenities: ['Gourmet Meal', 'Ice 5,000 Channels', 'Free WiFi']
    },
    {
      id: 'fl-2',
      airline: 'Qatar Airways',
      flightNumber: 'QR-007',
      logo: '🇶🇦',
      from: 'Dubai (DXB)',
      fromCode: 'DXB',
      to: 'New York (JFK)',
      toCode: 'JFK',
      deptTime: '08:15',
      arrTime: '15:10',
      duration: '13h 55m',
      durationMinutes: 835,
      stops: 'Direct',
      stopsCount: 0,
      price: 720,
      cabinClass: 'Economy',
      baggage: '2 x 23 kg Check-in &bull; 7 kg Cabin',
      amenities: ['World Best Airline', 'Oryx Screen', 'USB Ports']
    },
    {
      id: 'fl-3',
      airline: 'British Airways',
      flightNumber: 'BA-112',
      logo: '🇬🇧',
      from: 'Dubai (DXB)',
      fromCode: 'DXB',
      to: 'London Heathrow (LHR)',
      toCode: 'LHR',
      deptTime: '11:30',
      arrTime: '16:15',
      duration: '7h 45m',
      durationMinutes: 465,
      stops: 'Direct',
      stopsCount: 0,
      price: 450,
      cabinClass: 'Economy',
      baggage: '23 kg Check-in &bull; 7 kg Cabin',
      amenities: ['Complimentary Bar & Snacks', 'High-speed Wi-Fi', 'Personal Screen']
    },
    {
      id: 'fl-4',
      airline: 'Singapore Airlines',
      flightNumber: 'SQ-318',
      logo: '🇸🇬',
      from: 'Singapore (SIN)',
      fromCode: 'SIN',
      to: 'Tokyo Haneda (HND)',
      toCode: 'HND',
      deptTime: '01:20',
      arrTime: '09:05',
      duration: '6h 45m',
      durationMinutes: 405,
      stops: 'Direct',
      stopsCount: 0,
      price: 460,
      cabinClass: 'Economy',
      baggage: '25 kg Check-in &bull; 7 kg Cabin',
      amenities: ['KrisWorld Entertainment', 'Asian Menu', 'Wide Seats']
    },
    {
      id: 'fl-5',
      airline: 'Turkish Airlines',
      flightNumber: 'TK-711',
      logo: '🇹🇷',
      from: 'Dubai (DXB)',
      fromCode: 'DXB',
      to: 'Paris CDG (CDG)',
      toCode: 'CDG',
      deptTime: '06:00',
      arrTime: '13:45',
      duration: '9h 45m',
      durationMinutes: 585,
      stops: '1 Stop',
      stopsCount: 1,
      price: 340,
      cabinClass: 'Economy',
      baggage: '30 kg Check-in &bull; 8 kg Cabin',
      amenities: ['Flying Chef Meal', 'Live TV Streaming', 'Complimentary Drinks']
    },
    {
      id: 'fl-6',
      airline: 'Emirates',
      flightNumber: 'EK-609',
      logo: '✈️',
      from: 'Dubai (DXB)',
      fromCode: 'DXB',
      to: 'Lahore (LHE)',
      toCode: 'LHE',
      deptTime: '14:10',
      arrTime: '18:15',
      duration: '3h 05m',
      durationMinutes: 185,
      stops: 'Direct',
      stopsCount: 0,
      price: 240,
      cabinClass: 'Economy',
      baggage: '30 kg Check-in &bull; 7 kg Cabin',
      amenities: ['Hot Meal Included', 'Full Ice System', 'Power Outlets']
    }
  ],

  // 3. CAR RENTALS
  cars: [
    {
      id: 'car-1',
      title: 'Mercedes-Benz C-Class Automatic',
      category: 'Luxury / Premium',
      type: 'luxury',
      supplier: 'Avis Signature',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 3,
      doors: 4,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 75,
      rating: 9.4,
      reviewsCount: 840,
      location: 'Airport Terminal &bull; Shuttle Provided',
      mileage: 'Unlimited Mileage Included',
      cancellation: 'Free cancellation up to 48 hours'
    },
    {
      id: 'car-2',
      title: 'Tesla Model 3 Long Range',
      category: 'Electric / Hybrid',
      type: 'electric',
      supplier: 'Hertz Green Collection',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 2,
      doors: 4,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 68,
      rating: 9.6,
      reviewsCount: 620,
      location: 'In Terminal &bull; Fast Key Pick-up',
      mileage: 'Unlimited Mileage &bull; Free Supercharging',
      cancellation: 'Free cancellation anytime'
    },
    {
      id: 'car-3',
      title: 'Range Rover Evoque 4WD',
      category: 'SUV / 4x4',
      type: 'suv',
      supplier: 'Sixt Premium',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 4,
      doors: 5,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 89,
      rating: 9.5,
      reviewsCount: 930,
      location: 'Airport Meet & Greet',
      mileage: 'Unlimited Mileage Included',
      cancellation: 'Free cancellation up to 24 hours'
    },
    {
      id: 'car-4',
      title: 'Toyota Corolla Sedan Hybrid',
      category: 'Economy / Compact',
      type: 'economy',
      supplier: 'Enterprise',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
      seats: 5,
      bags: 2,
      doors: 4,
      transmission: 'Automatic',
      airCon: true,
      pricePerDay: 39,
      rating: 9.0,
      reviewsCount: 1450,
      location: 'Direct In-Terminal Counter',
      mileage: 'Unlimited Mileage Included',
      cancellation: 'Free cancellation'
    }
  ],

  // 4. ATTRACTIONS
  attractions: [
    {
      id: 'attr-1',
      title: 'Burj Khalifa At The Top (Levels 124, 125 & 148 Sky Entry)',
      city: 'Dubai',
      country: 'United Arab Emirates',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '1.5 - 2 Hours',
      rating: 4.9,
      reviewsCount: 14850,
      price: 52,
      originalPrice: 65,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      badge: 'Best Seller',
      highlights: ['Skip-the-line elevator pass', '360° panoramic outdoor deck', 'Free digital telescope access'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-2',
      title: 'Dubai Red Dunes Desert Safari, Dune Bashing & BBQ Buffet Dinner',
      city: 'Dubai',
      country: 'United Arab Emirates',
      category: 'Desert Tours & Safaris',
      catType: 'tours',
      duration: '6 - 7 Hours',
      rating: 4.95,
      reviewsCount: 11200,
      price: 64,
      originalPrice: 85,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      badge: 'All-Inclusive',
      highlights: ['4x4 Land Cruiser hotel pickup', 'Sandboarding & Camel trekking', 'Fire show, Tanoura dance & 5★ BBQ'],
      cancellation: 'Free cancellation up to 12 hours before'
    },
    {
      id: 'attr-3',
      title: 'Museum of the Future Priority Entry Ticket & Hologram Experience',
      city: 'Dubai',
      country: 'United Arab Emirates',
      category: 'Museums & Art',
      catType: 'museums',
      duration: '2 - 3 Hours',
      rating: 4.88,
      reviewsCount: 7640,
      price: 49,
      originalPrice: 60,
      image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
      badge: 'Top Rated',
      highlights: ['Dedicated entry timeslot', 'Interactive AI & space exhibits', 'Stunning architectural viewing deck'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-4',
      title: 'Atlantis Aquaventure Waterpark & Lost Chambers Aquarium Pass',
      city: 'Dubai',
      country: 'United Arab Emirates',
      category: 'Theme Parks & Fun',
      catType: 'theme_parks',
      duration: 'Full Day',
      rating: 4.85,
      reviewsCount: 9320,
      price: 89,
      originalPrice: 110,
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      badge: 'World #1 Waterpark',
      highlights: ['105 record-breaking slides', 'Private 1km white sand beach', 'Access to 65,000 marine animals'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-5',
      title: 'Louvre Museum Paris: Reserved Timed-Entry & Mona Lisa Guide',
      city: 'Paris',
      country: 'France',
      category: 'Museums & Art',
      catType: 'museums',
      duration: '3 - 4 Hours',
      rating: 4.82,
      reviewsCount: 16500,
      price: 42,
      originalPrice: 50,
      image: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80',
      badge: 'Bestseller',
      highlights: ['Guaranteed fast-track entry', 'Direct pathway to Mona Lisa & Venus', 'Permanent & temporary collections'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-6',
      title: 'Eiffel Tower Summit Direct Access & Seine River Cruise',
      city: 'Paris',
      country: 'France',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '2.5 - 3 Hours',
      rating: 4.78,
      reviewsCount: 13900,
      price: 78,
      originalPrice: 95,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      badge: 'Must Do',
      highlights: ['Summit elevator pass (Top floor)', '1-hour illuminated cruise pass', 'Host assistance at priority gate'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-7',
      title: 'Palace of Versailles Passport: Full Estate, Gardens & Musical Fountains',
      city: 'Paris',
      country: 'France',
      category: 'Day Trips & Tours',
      catType: 'day_trips',
      duration: '5 - 6 Hours',
      rating: 4.87,
      reviewsCount: 8940,
      price: 58,
      originalPrice: 72,
      image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80',
      badge: 'UNESCO Heritage',
      highlights: ['Hall of Mirrors audio tour', 'King & Queen State Apartments', 'Access to Famous Royal Gardens'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-8',
      title: 'Disneyland Paris: 1-Day 2-Parks Flexible Admission Ticket',
      city: 'Paris',
      country: 'France',
      category: 'Theme Parks & Fun',
      catType: 'theme_parks',
      duration: 'Full Day',
      rating: 4.89,
      reviewsCount: 12400,
      price: 94,
      originalPrice: 115,
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      badge: 'Family Favorite',
      highlights: ['Disneyland Park & Walt Disney Studios', 'Skip-the-line turnstile QR barcode', 'Nighttime fireworks show'],
      cancellation: 'Free cancellation up to 3 days before'
    },
    {
      id: 'attr-9',
      title: 'Colosseum, Roman Forum & Palatine Hill Priority Access Tour',
      city: 'Rome',
      country: 'Italy',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '2.5 - 3 Hours',
      rating: 4.91,
      reviewsCount: 18200,
      price: 48,
      originalPrice: 62,
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      badge: 'Top Choice in Rome',
      highlights: ['Direct Gladiator arena entrance', 'Expert archaeologist guide', 'Palatine Hill imperial ruins'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-10',
      title: 'Vatican Museums, Sistine Chapel & St. Peter\'s Basilica Guided Pass',
      city: 'Rome',
      country: 'Italy',
      category: 'Museums & Art',
      catType: 'museums',
      duration: '3.5 Hours',
      rating: 4.93,
      reviewsCount: 15400,
      price: 65,
      originalPrice: 80,
      image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
      badge: 'Skip The Long Queue',
      highlights: ['Michelangelo\'s Sistine Chapel ceiling', 'Raphael Rooms & Gallery of Maps', 'Priority St. Peter\'s entrance'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-11',
      title: 'Pompeii Ruins & Mt. Vesuvius Volcano Day Trip with Italian Lunch',
      city: 'Rome',
      country: 'Italy',
      category: 'Day Trips & Tours',
      catType: 'day_trips',
      duration: '9 Hours',
      rating: 4.86,
      reviewsCount: 5120,
      price: 119,
      originalPrice: 145,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      badge: 'Day Trip Excursion',
      highlights: ['Roundtrip luxury coach from Rome', 'Guided tour of Pompeii excavation', 'Hike up to Vesuvius crater summit'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-12',
      title: 'Tower of London & Crown Jewels Exhibition Fast-Track Ticket',
      city: 'London',
      country: 'United Kingdom',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '2.5 Hours',
      rating: 4.84,
      reviewsCount: 11800,
      price: 39,
      originalPrice: 48,
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
      badge: 'Historic Royal Palace',
      highlights: ['Direct access to Crown Jewels', 'Yeoman Warder (Beefeater) tour', 'White Tower medieval armory'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-13',
      title: 'The London Eye Standard & Fast Track Flight Experience',
      city: 'London',
      country: 'United Kingdom',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '45 Minutes',
      rating: 4.79,
      reviewsCount: 14200,
      price: 44,
      originalPrice: 55,
      image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=800&q=80',
      badge: 'Iconic London',
      highlights: ['30-minute rotation in glass pod', '360° views up to 40km away', 'Complimentary 4D cinema experience'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-14',
      title: 'Warner Bros. Studio Tour London - The Making of Harry Potter',
      city: 'London',
      country: 'United Kingdom',
      category: 'Theme Parks & Fun',
      catType: 'theme_parks',
      duration: '4 - 5 Hours',
      rating: 4.96,
      reviewsCount: 16800,
      price: 79,
      originalPrice: 95,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      badge: 'Top UK Experience',
      highlights: ['Authentic Great Hall & Diagon Alley sets', 'Platform 9¾ & Hogwarts Express', 'Interactive wand duel experience'],
      cancellation: 'Free cancellation up to 48 hours before'
    },
    {
      id: 'attr-15',
      title: 'Stonehenge, Windsor Castle & City of Bath Full-Day Guided Tour',
      city: 'London',
      country: 'United Kingdom',
      category: 'Day Trips & Tours',
      catType: 'day_trips',
      duration: '10 Hours',
      rating: 4.88,
      reviewsCount: 6300,
      price: 110,
      originalPrice: 135,
      image: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?auto=format&fit=crop&w=800&q=80',
      badge: 'Best England Tour',
      highlights: ['State Apartments at Windsor Castle', 'Mysterious Neolithic Stonehenge stone circle', 'Roman Baths visit in Bath'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-16',
      title: 'SUMMIT One Vanderbilt Experiential Sky Deck & Glass Box Ticket',
      city: 'New York',
      country: 'United States',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '2 Hours',
      rating: 4.92,
      reviewsCount: 13400,
      price: 54,
      originalPrice: 65,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
      badge: 'NYC #1 Skydeck',
      highlights: ['Immersive Kenzo Digital mirror rooms', 'Levitation glass boxes over Madison Ave', 'Air balloon reflection experience'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-17',
      title: 'Statue of Liberty & Ellis Island Priority Ferry & Pedestal Ticket',
      city: 'New York',
      country: 'United States',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '4 Hours',
      rating: 4.86,
      reviewsCount: 17200,
      price: 36,
      originalPrice: 45,
      image: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80',
      badge: 'National Monument',
      highlights: ['Roundtrip Reserve Ferry cruise', 'Liberty Island Museum admission', 'Ellis Island Immigration Museum audio tour'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-18',
      title: 'The Metropolitan Museum of Art (The Met) Guided Masterpiece Tour',
      city: 'New York',
      country: 'United States',
      category: 'Museums & Art',
      catType: 'museums',
      duration: '2.5 Hours',
      rating: 4.9,
      reviewsCount: 8700,
      price: 52,
      originalPrice: 65,
      image: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80',
      badge: 'World Premier Art',
      highlights: ['Temple of Dendur & Egyptian wing', 'European Paintings & Impressionists', 'Pass included for Met Cloisters'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-19',
      title: 'teamLab Planets TOKYO Digital Art Interactive Exhibition',
      city: 'Tokyo',
      country: 'Japan',
      category: 'Museums & Art',
      catType: 'museums',
      duration: '2 Hours',
      rating: 4.97,
      reviewsCount: 19100,
      price: 38,
      originalPrice: 48,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      badge: 'World Highest Rated',
      highlights: ['Walk through water & infinite crystal universe', 'Floating flower garden exhibit', 'Instant digital mobile barcode pass'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-20',
      title: 'Mt. Fuji, Lake Ashi Sightseeing Cruise & Hakone Ropeway Day Tour',
      city: 'Tokyo',
      country: 'Japan',
      category: 'Day Trips & Tours',
      catType: 'day_trips',
      duration: '10 Hours',
      rating: 4.91,
      reviewsCount: 10400,
      price: 98,
      originalPrice: 120,
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80',
      badge: 'Best Japan Tour',
      highlights: ['Mt. Fuji 5th Station panoramic views', 'Pirate ship cruise on Lake Ashi', 'Hakone Ropeway volcanic valley'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-21',
      title: 'Tokyo Skytree Tembo Deck & Galleria Admission Ticket',
      city: 'Tokyo',
      country: 'Japan',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '2 Hours',
      rating: 4.83,
      reviewsCount: 8200,
      price: 26,
      originalPrice: 34,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      badge: 'Highest Tower',
      highlights: ['Access to 350m & 450m observation decks', 'Glass flooring walk thrill', 'Mount Fuji view on clear days'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-22',
      title: 'Sagrada Familia Fast-Track Guided Tour & Tower Access',
      city: 'Barcelona',
      country: 'Spain',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '2 Hours',
      rating: 4.94,
      reviewsCount: 15600,
      price: 49,
      originalPrice: 60,
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
      badge: 'Gaudí Masterpiece',
      highlights: ['Skip-the-ticket-line fast access', 'Nativity or Passion facade tower lift', 'Official licensed architectural guide'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-23',
      title: 'Park Güell Timed Entry & Monumental Zone Guided Tour',
      city: 'Barcelona',
      country: 'Spain',
      category: 'Landmarks & Views',
      catType: 'landmarks',
      duration: '1.5 Hours',
      rating: 4.81,
      reviewsCount: 7800,
      price: 24,
      originalPrice: 30,
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
      badge: 'Top Barcelona',
      highlights: ['Guaranteed monumental zone entry', 'Dragon stairway & Hypostyle room', 'Spectacular Mediterranean panorama'],
      cancellation: 'Free cancellation up to 24 hours before'
    },
    {
      id: 'attr-24',
      title: 'Amsterdam 1-Hour Luxury Open-Top Canal Cruise with Drinks & Cheese',
      city: 'Amsterdam',
      country: 'Netherlands',
      category: 'Cruises & Water',
      catType: 'cruises',
      duration: '1 Hour',
      rating: 4.89,
      reviewsCount: 9200,
      price: 28,
      originalPrice: 36,
      image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
      badge: 'Scenic Cruise',
      highlights: ['UNESCO canal ring historic route', 'Complimentary local Dutch cheeses & beer/wine', 'Live Captain commentary in English'],
      cancellation: 'Free cancellation up to 24 hours before'
    }
  ],

  // 5. AIRPORT TAXIS
  taxis: [
    {
      id: 'taxi-1',
      vehicleClass: 'Standard Sedan',
      example: 'Toyota Camry / Skoda Octavia or similar',
      badge: 'Most Economical',
      passengers: 3,
      luggage: 2,
      baseFare: 45,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
      features: ['Meet & Greet with name sign inside arrivals', 'Free 60 mins flight delay waiting time', 'All airport tolls & parking fees included', 'Air-conditioned clean modern sedan']
    },
    {
      id: 'taxi-2',
      vehicleClass: 'Executive Business',
      example: 'Mercedes-Benz E-Class / BMW 5 Series',
      badge: 'Business Class',
      passengers: 3,
      luggage: 2,
      baseFare: 75,
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      features: ['Professional chauffeur in suit & tie', 'Complimentary bottled water & phone chargers', 'Free 90 mins flight delay waiting', 'Premium leather interior & quiet ride']
    },
    {
      id: 'taxi-3',
      vehicleClass: 'Minivan / People Carrier',
      example: 'Mercedes-Benz V-Class / Volkswagen Multivan',
      badge: 'Family & Groups',
      passengers: 7,
      luggage: 6,
      baseFare: 90,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      features: ['Extra spacious seating with generous luggage space', 'Conference seating arrangement available', 'Ideal for families with kids & bulky bags', 'Free child seat upon request']
    },
    {
      id: 'taxi-4',
      vehicleClass: 'VIP Luxury SUV',
      example: 'Range Rover Autobiography / Cadillac Escalade',
      badge: 'VIP Signature',
      passengers: 4,
      luggage: 4,
      baseFare: 120,
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      features: ['VIP Priority pickup lane right outside terminal', 'Ultra luxury leather interior with panoramic roof', 'Flight live GPS tracking & dedicated concierge', 'Free cancellation anytime']
    },
    {
      id: 'taxi-5',
      vehicleClass: 'First Class Ultra Luxury',
      example: 'Mercedes-Benz S-Class / Maybach',
      badge: 'First Class',
      passengers: 3,
      luggage: 2,
      baseFare: 160,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      features: ['Top-tier executive VIP chauffeur service', 'Reclining massage seats & privacy blinds', 'Champagne/refreshments setup on request', 'VIP terminal meet & escort']
    },
    {
      id: 'taxi-6',
      vehicleClass: 'Eco Electric Green',
      example: 'Tesla Model Y / Mercedes EQE Sedan',
      badge: '100% Electric',
      passengers: 4,
      luggage: 3,
      baseFare: 65,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
      features: ['Zero emissions green airport journey', 'Silent smooth electric powertrain', 'Free 60 mins flight delay waiting', 'High-speed device charging included']
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

// Toast notification styled with AMEZA Green
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
      transform: translateY(120px);
      opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:#7FB73C; font-size:1.2rem;">✓</span> ${message}`;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(120px)';
    toast.style.opacity = '0';
  }, 4500);
}

// Generate unique booking confirmation code
export function generateBookingId(prefix = 'AMZ') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${res}`;
}
