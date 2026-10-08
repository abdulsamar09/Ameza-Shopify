/**
 * AMEZA CAR RENTAL SERVICE (USA Standard)
 * Verified sample fleet adhering to U.S. car rental categories
 * Rates in USD ($29 - $119 / day), miles, automatic transmission, CDW insurance, driver age 25+.
 */

export class CarRentalService {
  static SAMPLE_FLEET = [
    {
      id: 'car-1',
      title: 'Toyota Camry / Corolla Hybrid',
      category: 'economy',
      categoryLabel: 'Economy & Compact',
      supplier: 'Enterprise Rent-A-Car',
      supplierRating: 9.2,
      seats: 5,
      doors: 4,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 2,
      mileage: 'Unlimited Miles Included',
      specs: '5 Seats • 4 Doors • Automatic • A/C • 52 MPG • Apple CarPlay',
      features: [
        'Free cancellation up to 48 hours',
        'Unlimited Miles Included',
        'Collision Damage Waiver (CDW) Included',
        'Driver age 25+ standard (young driver fee for under 25)',
        '$200 refundable security deposit in USD'
      ],
      pricePerDay: 39,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=700&q=80',
      badge: 'Best Value'
    },
    {
      id: 'car-2',
      title: 'Tesla Model 3 Long Range',
      category: 'electric',
      categoryLabel: 'Electric & Hybrid',
      supplier: 'Hertz Clean Collection',
      supplierRating: 9.6,
      seats: 5,
      doors: 4,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 3,
      mileage: 'Unlimited Miles Included',
      specs: '5 Seats • 4 Doors • 100% Electric • Autopilot • Supercharger Access',
      features: [
        'Free cancellation anytime',
        'Zero Emissions',
        'Tesla Supercharging Network Access',
        'Collision Damage Waiver (CDW) Included',
        'Driver age 25+ standard'
      ],
      pricePerDay: 68,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80',
      badge: 'Eco Electric'
    },
    {
      id: 'car-3',
      title: 'Ford Explorer / Jeep Grand Cherokee 4WD',
      category: 'suv',
      categoryLabel: 'SUVs & 4x4',
      supplier: 'National Car Rental',
      supplierRating: 9.4,
      seats: 7,
      doors: 5,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 4,
      mileage: 'Unlimited Miles Included',
      specs: '7 Seats • 5 Doors • 4x4 All-Wheel Drive • Automatic • Roof Rails',
      features: [
        'Free cancellation up to 24 hours',
        'Unlimited Miles Included',
        'Full Comprehensive CDW & Theft Protection',
        'Driver age 25+ standard',
        '$250 refundable security deposit in USD'
      ],
      pricePerDay: 85,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      badge: 'Family SUV'
    },
    {
      id: 'car-4',
      title: 'Mercedes-Benz C-Class / BMW 3 Series',
      category: 'luxury',
      categoryLabel: 'Luxury & Premium',
      supplier: 'Avis Signature Fleet',
      supplierRating: 9.5,
      seats: 5,
      doors: 4,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 3,
      mileage: 'Unlimited Miles Included',
      specs: '5 Seats • 4 Doors • Automatic • Premium Leather • Navigation',
      features: [
        'Free cancellation up to 48 hours',
        'Unlimited Miles Included',
        'Full Insurance Waiver (Zero Deductible)',
        'Curbside VIP airport pickup',
        'Driver age 25+ required'
      ],
      pricePerDay: 95,
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=700&q=80',
      badge: 'Premium Sedan'
    },
    {
      id: 'car-5',
      title: 'Chevrolet Suburban / Tahoe Premier',
      category: 'suv',
      categoryLabel: 'SUVs & 4x4',
      supplier: 'Enterprise Rent-A-Car',
      supplierRating: 9.3,
      seats: 8,
      doors: 5,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 6,
      mileage: 'Unlimited Miles Included',
      specs: '8 Seats • 5 Doors • V8 Automatic • Maximum Cargo • Tow Package',
      features: [
        'Free cancellation up to 24 hours',
        'Unlimited Miles Included',
        'Collision Damage Waiver (CDW) Included',
        'Driver age 25+ standard'
      ],
      pricePerDay: 109,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      badge: 'Full-Size Luxury SUV'
    },
    {
      id: 'car-6',
      title: 'Porsche Macan / Cayenne Luxury SUV',
      category: 'luxury',
      categoryLabel: 'Luxury & Premium',
      supplier: 'Sixt Luxury Collection',
      supplierRating: 9.8,
      seats: 5,
      doors: 5,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 3,
      mileage: 'Unlimited Miles Included',
      specs: '5 Seats • 5 Doors • Twin-Turbo AWD • Panoramic Roof • Sport Chrono',
      features: [
        'VIP Airport Desk Priority',
        'Guaranteed Model Reservation',
        'Unlimited Miles Included',
        'Full Insurance Cover Included',
        'Driver age 25+ required'
      ],
      pricePerDay: 119,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
      badge: 'Executive VIP'
    }
  ];

  static async searchCars(params = {}) {
    const { location = '', categories = [], sortBy = 'rec' } = params;

    await new Promise(resolve => setTimeout(resolve, 60));

    let results = [...this.SAMPLE_FLEET];

    if (location && location.trim()) {
      results = results.map(car => ({
        ...car,
        locationDisplay: location
      }));
    }

    if (categories && categories.length > 0) {
      const lowerCats = categories.map(c => c.toLowerCase());
      results = results.filter(car => lowerCats.includes(car.category.toLowerCase()));
    }

    if (sortBy === 'price') {
      results.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.supplierRating - a.supplierRating);
    }

    return results;
  }

  static getCarById(id) {
    return this.SAMPLE_FLEET.find(c => c.id === id) || this.SAMPLE_FLEET[0];
  }
}
