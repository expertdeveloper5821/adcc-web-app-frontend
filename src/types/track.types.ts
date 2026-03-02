export type FacilityType =
  | 'water'
  | 'toilets'
  | 'parking'
  | 'lights'
  | 'cafes'
  | 'bikeRental'
  | 'firstAid'
  | 'changingRooms';

export interface ITrackFacility {
  facilities?: FacilityType[];
}
