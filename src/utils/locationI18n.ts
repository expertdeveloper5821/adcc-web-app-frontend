import type { TFunction } from 'i18next';

/** GCC country label — keys live under `data.countries` in locale files */
export function translateGccCountry(t: TFunction, country: string): string {
  return String(t(`data.countries.${country}`, { defaultValue: country }));
}

/** City label — keys live under `data.locations` in locale files */
export function translateGccCity(t: TFunction, city: string): string {
  return String(t(`data.locations.${city}`, { defaultValue: city }));
}
