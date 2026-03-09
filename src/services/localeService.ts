import { api } from './api';

export type Locale = 'en' | 'ar';

/**
 * Backend multi-language: the API uses Accept-Language (set in api.ts request interceptor
 * from localStorage 'locale'). Backend languageMiddleware sets req.lang and returns translated
 * success/error messages (see backend src/utils/i18n.ts and src/locales/en.json | ar.json).
 *
 * If the backend later exposes a GET endpoint for UI translation keys, set it here.
 */
const TRANSLATIONS_ENDPOINT = '/v1/translations';

/**
 * Replace with the actual user preference endpoint from backend when ready.
 * Example: PUT /api/user/preferences/locale
 */
const USER_PREFERENCE_ENDPOINT = '/v1/user/preferences/locale';

/**
 * Fetches translations for the given locale.
 * Placeholder: returns empty object until backend is ready.
 * When backend provides the endpoint, use: api.get(TRANSLATIONS_ENDPOINT, { params: { lang: locale } })
 * and map the response to Record<string, string>.
 */
export async function getTranslations(locale: Locale): Promise<Record<string, string>> {
  try {
    const { data } = await api.get<Record<string, string>>(TRANSLATIONS_ENDPOINT, {
      params: { lang: locale },
    });
    return data ?? {};
  } catch {
    // Backend not ready or endpoint not implemented; return empty so t(key) falls back to key
    return {};
  }
}

/**
 * Saves the user's language preference on the backend.
 * Placeholder: no-op until backend provides the endpoint.
 * When ready, use: api.put(USER_PREFERENCE_ENDPOINT, { locale }).
 */
export async function setUserPreference(locale: Locale): Promise<void> {
  try {
    await api.put(USER_PREFERENCE_ENDPOINT, { locale });
  } catch {
    // Backend not ready; preference is still persisted in localStorage by LocaleContext
  }
}
