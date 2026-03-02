// GCC Countries and Cities Mapping
export const gccCountries = [
  'UAE',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain'
] as const;

export type GCCCountry = typeof gccCountries[number];

export const gccCities: Record<GCCCountry, string[]> = {
  'UAE': [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
    'Al Ain'
  ],
  'Saudi Arabia': [
    'Riyadh',
    'Jeddah',
    'Mecca',
    'Medina',
    'Dammam',
    'Khobar',
    'Dhahran',
    'Taif',
    'Tabuk',
    'Abha',
    'Jubail',
    'Yanbu'
  ],
  'Qatar': [
    'Doha',
    'Al Wakrah',
    'Al Khor',
    'Al Rayyan',
    'Mesaieed',
    'Dukhan'
  ],
  'Oman': [
    'Muscat',
    'Salalah',
    'Sohar',
    'Nizwa',
    'Sur',
    'Ibri',
    'Barka',
    'Rustaq'
  ],
  'Kuwait': [
    'Kuwait City',
    'Hawalli',
    'Salmiya',
    'Farwaniya',
    'Jahra',
    'Ahmadi',
    'Mangaf',
    'Fahaheel'
  ],
  'Bahrain': [
    'Manama',
    'Muharraq',
    'Riffa',
    'Hamad Town',
    'Isa Town',
    'Sitra',
    'Budaiya',
    'Jidhafs'
  ]
};

// Helper function to get cities by country
export function getCitiesByCountry(country: GCCCountry | ''): string[] {
  if (!country) return [];
  return gccCities[country] || [];
}

// Helper function to validate country-city combination
export function isValidCountryCity(country: GCCCountry | '', city: string): boolean {
  if (!country || !city) return false;
  return gccCities[country]?.includes(city) || false;
}