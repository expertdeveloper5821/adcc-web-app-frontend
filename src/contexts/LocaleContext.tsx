import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { invalidateCache } from '../utils/apiCache';

export type Locale = 'en' | 'ar';

const STORAGE_KEY = 'locale';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);
  const { t } = useTranslation();

  const setLocale = useCallback(async (newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    // Clear API cache so re-fetches get backend-translated data
    invalidateCache();
    // Await language change so i18n is fully updated before React re-renders
    await i18n.changeLanguage(newLocale);
    setLocaleState(newLocale);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (locale === 'ar') {
      root.dir = 'rtl';
      root.lang = 'ar';
    } else {
      root.dir = 'ltr';
      root.lang = 'en';
    }
  }, [locale]);

  const value: LocaleContextType = {
    locale,
    setLocale,
    t,
    isRtl: locale === 'ar',
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
