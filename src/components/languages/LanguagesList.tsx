import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, CheckCircle, Languages as LanguagesIcon } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { toast } from 'sonner';

type LanguageCode = 'en' | 'ar';

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  enabled: boolean;
}

const APP_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: true },
];

export function LanguagesList() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  const handleSetDefault = (code: LanguageCode) => {
    setLocale(code);
    toast.success(t('languages.toasts.defaultSet'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('languages.title')}
        </h1>
        <p style={{ color: '#666' }}>{t('languages.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <LanguagesIcon className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('languages.supported')}
            </span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {APP_LANGUAGES.filter((l) => l.enabled).length}
          </p>
        </div>
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('languages.default')}
            </span>
          </div>
          <p className="text-xl font-medium" style={{ color: '#333' }}>
            {locale === 'en' ? t('languages.english') : t('languages.arabic')}
          </p>
        </div>
      </div>

      {/* Language list */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <h2 className="text-xl mb-6" style={{ color: '#333' }}>
          {t('languages.available')}
        </h2>
        <div className="space-y-4">
          {APP_LANGUAGES.map((lang) => {
            const isDefault = locale === lang.code;
            return (
              <div
                key={lang.code}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                style={{ backgroundColor: isDefault ? '#FFF9EF' : undefined }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {lang.code.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#333' }}>
                      {lang.nativeName} ({lang.name})
                    </p>
                    <p className="text-sm" style={{ color: '#666' }}>
                      {t('languages.code')}: {lang.code}
                    </p>
                  </div>
                  {isDefault && (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('languages.defaultBadge')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(lang.code)}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:shadow-md"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      {t('languages.setDefault')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info card */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <p className="text-sm" style={{ color: '#666' }}>
          {t('languages.hint')}
        </p>
      </div>
    </div>
  );
}
