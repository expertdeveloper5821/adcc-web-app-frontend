import { FacilityType } from '@/types/track.types';

export const TRACK_FACILITIES: { label: string; value: FacilityType }[] = [
  { label: 'Lighting', value: 'lights' },
  { label: 'Water Stations', value: 'water' },
  { label: 'Parking', value: 'parking' },
  { label: 'Restrooms', value: 'toilets' },
  { label: 'Cafes', value: 'cafes' },
  { label: 'Bike Rental', value: 'bikeRental' },
  { label: 'First Aid', value: 'firstAid' },
  { label: 'Changing Rooms', value: 'changingRooms' },
];
