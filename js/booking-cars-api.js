/**
 * AMEZA CAR RENTAL SERVICE (DEMO MODE & CLIENT SHOWCASE)
 * Professional vehicle catalog, filtering, and booking simulation.
 * Architecture structured for plug-and-play future integration with 
 * licensed Car Rental APIs / Booking.com Demand API proxy.
 */

export class CarRentalService {
  /**
   * Verified sample fleet adhering to international car rental categories
   */
  static SAMPLE_FLEET = [
    {
      id: 'car-1',
      title: 'Mercedes-Benz S-Class / E-Class AMG',
      category: 'luxury',
      categoryLabel: 'Luxury & Premium',
      supplier: 'Sixt Luxury Collection',
      supplierRating: 9.6,
      seats: 5,
      doors: 4,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 3,
      mileage: 'Unlimited Mileage',
      specs: '5 Seats • 4 Doors • Automatic • A/C • GPS Navigation',
      features: ['Free cancellation up to 48 hours', 'Unlimited Mileage', 'Collision Damage Waiver Included', 'Theft Protection'],
      pricePerDay: 195,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=700&q=80',
      badge: 'Top Luxury Sedan'
    },
    {
      id: 'car-2',
      title: 'Range Rover Sport Dynamic HSE',
      category: 'suv',
      categoryLabel: 'SUVs & 4x4',
      supplier: 'Hertz Prestige Fleet',
      supplierRating: 9.3,
      seats: 5,
      doors: 5,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 4,
      mileage: 'Unlimited Mileage',
      specs: '5 Seats • 5 Doors • 4x4 All-Wheel Drive • Automatic • Sunroof',
      features: ['Free cancellation', 'Unlimited Mileage', 'Chilled Console Box', 'Comprehensive Insurance Included'],
      pricePerDay: 165,
      image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80',
      badge: 'Premium 4x4 SUV'
    },
    {
      id: 'car-3',
      title: 'Tesla Model Y Performance Dual Motor',
      category: 'electric',
      categoryLabel: 'Electric & Hybrid',
      supplier: 'Avis Eco-Drive',
      supplierRating: 9.4,
      seats: 5,
      doors: 5,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 3,
      mileage: 'Unlimited Mileage',
      specs: '5 Seats • 5 Doors • 100% Electric • Autopilot • Supercharging',
      features: ['Free cancellation', 'Zero Emissions', 'Access to Supercharging Network', 'Unlimited Mileage'],
      pricePerDay: 110,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80',
      badge: '100% Clean Electric'
    },
    {
      id: 'car-4',
      title: 'BMW 4 Series Gran Coupé M-Sport',
      category: 'luxury',
      categoryLabel: 'Luxury & Premium',
      supplier: 'Europcar Selection',
      supplierRating: 9.1,
      seats: 4,
      doors: 4,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 2,
      mileage: 'Unlimited Mileage',
      specs: '4 Seats • 4 Doors • Automatic • Harman Kardon Sound • Sport Mode',
      features: ['Free cancellation', 'Unlimited Mileage', 'Airport Terminal Desk Collection', 'Third Party Liability'],
      pricePerDay: 145,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=700&q=80',
      badge: 'High Performance Coupé'
    },
    {
      id: 'car-5',
      title: 'Toyota Camry Hybrid / Corolla Elite',
      category: 'economy',
      categoryLabel: 'Economy & Compact',
      supplier: 'Enterprise Rent-a-Car',
      supplierRating: 9.0,
      seats: 5,
      doors: 4,
      transmission: 'CVT Automatic',
      airConditioning: true,
      bags: 2,
      mileage: 'Unlimited Mileage',
      specs: '5 Seats • 4 Doors • Hybrid CVT • Ultra Low Fuel • Apple CarPlay',
      features: ['Free cancellation', 'Fair Fuel Policy (Full to Full)', 'Unlimited Mileage', '24/7 Roadside Assistance'],
      pricePerDay: 65,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=700&q=80',
      badge: 'Best Value & Eco Fuel'
    },
    {
      id: 'car-6',
      title: 'Porsche Cayenne Turbo GT',
      category: 'luxury',
      categoryLabel: 'Luxury & Premium',
      supplier: 'Sixt Exclusive',
      supplierRating: 9.8,
      seats: 5,
      doors: 5,
      transmission: 'Automatic',
      airConditioning: true,
      bags: 4,
      mileage: 'Unlimited Mileage',
      specs: '5 Seats • 5 Doors • V8 Twin-Turbo • Sport Chrono • Leather',
      features: ['VIP Priority Terminal Collection', 'Guaranteed Exact Model', 'Unlimited Mileage', 'Zero-Deductible Cover'],
      pricePerDay: 280,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
      badge: 'VIP Elite Collection'
    }
  ];

  /**
   * Search available cars (Demo Mode)
   */
  static async searchCars(params = {}) {
    const { location = '', categories = [], sortBy = 'rec' } = params;

    // Simulate standard async fetch delay
    await new Promise(resolve => setTimeout(resolve, 80));

    let results = [...this.SAMPLE_FLEET];

    // Filter by location query (if given)
    if (location && location.trim()) {
      const q = location.toLowerCase().trim();
      // Keep results matching city/depot or return all sample cars with location badge
      results = results.map(car => ({
        ...car,
        locationDisplay: location
      }));
    }

    // Filter by categories
    if (categories && categories.length > 0) {
      const lowerCats = categories.map(c => c.toLowerCase());
      results = results.filter(car => lowerCats.includes(car.category.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'price') {
      results.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.supplierRating - a.supplierRating);
    }

    return results;
  }

  /**
   * Get single vehicle details
   */
  static getCarById(id) {
    return this.SAMPLE_FLEET.find(c => c.id === id) || this.SAMPLE_FLEET[0];
  }
}
