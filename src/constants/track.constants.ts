import { FacilityType } from "../types/track.types";

export const TRACK_FACILITIES: { label: string; value: FacilityType }[] = [
  { label: "Lighting", value: "lights" },
  { label: "Water Stations", value: "water" },
  { label: "Parking", value: "parking" },
  { label: "Restrooms", value: "toilets" },
  { label: "Cafes", value: "cafes" },
  { label: "Bike Rental", value: "bikeRental" },
  { label: "First Aid", value: "firstAid" },
  { label: "Changing Rooms", value: "changingRooms" },
];

/** Map internal facility value to API text (lowercase display labels). */
export const FACILITY_VALUE_TO_API_TEXT: Record<FacilityType, string> = {
  lights: "lighting",
  water: "water stations",
  parking: "parking",
  toilets: "restrooms",
  cafes: "cafes",
  bikeRental: "bike rental",
  firstAid: "first aid",
  changingRooms: "changing rooms",
};

/** Map API text back to internal facility value (for normalizing API response). */
const apiTextEntries = Object.entries(FACILITY_VALUE_TO_API_TEXT) as [FacilityType, string][];
export const API_TEXT_TO_FACILITY_VALUE: Record<string, FacilityType> = Object.fromEntries(
  apiTextEntries.map(([value, text]) => [text.toLowerCase(), value])
);
