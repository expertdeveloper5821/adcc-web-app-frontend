import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { TopBarNotifications } from './TopBarNotifications';
import { toast } from 'sonner';
interface TopBarProps {
  roleTitle: string;
}

export function TopBar({ roleTitle }: TopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { userProfile, logout } = useAuth();
  const { locale, setLocale, isRtl } = useLocale();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/login');
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const handleNotificationsClick = () => {
    toast.info('No data found');
  };

 

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 flex items-center justify-between px-8">
      <div className={`flex items-center gap-4 flex-1 max-w-2xl ${isRtl ? 'mr-64' : 'ml-64'}`}>
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${isRtl ? 'right-3' : 'left-3'}`} style={{ color: '#999' }} />
          <input
            type="text"
            placeholder={t('topbar.search')}
            dir={isRtl ? 'rtl' : 'ltr'}
            lang={locale}
            className={`w-full py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            style={{ focusRing: '#C12D32' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Language toggle */}
        {/* <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setLocale('en')}
            className="px-3 py-1.5 text-xs font-bold transition-all duration-200"
            style={locale === 'en'
              ? { backgroundColor: '#C12D32', color: '#fff' }
              : { backgroundColor: '#fff', color: '#666' }}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale('ar')}
            className="px-3 py-1.5 text-xs font-bold transition-all duration-200"
            style={locale === 'ar'
              ? { backgroundColor: '#C12D32', color: '#fff' }
              : { backgroundColor: '#fff', color: '#666' }}
          >
            AR
          </button>
        </div> */}

        <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#ECC180', color: '#333' }}>
          <span className="text-sm">{roleTitle}</span>
        </div>

        <TopBarNotifications isRtl={isRtl} />

        {/* User Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: '#C12D32' }}>
              {userProfile?.fullName 
                ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : 'U'}
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: '#666' }} />
          </button>

          {userMenuOpen && (
            <div className={`absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${isRtl ? 'left-0' : 'right-0'}`}>
              {userProfile && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className={`text-sm font-semibold ${isRtl ? 'text-right' : 'text-left'}`} style={{ color: '#333' }}>
                    {userProfile.fullName}
                  </div>
                  <div className={`text-xs mt-1 ${isRtl ? 'text-right' : 'text-left'}`} style={{ color: '#666' }}>
                    {userProfile.email || userProfile.phone}
                  </div>
                  <div className={`text-xs mt-1 capitalize ${isRtl ? 'text-right' : 'text-left'}`} style={{ color: '#999' }}>
                    {t('topbar.role')} {userProfile.role}
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                style={{ color: '#C12D32' }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{t('topbar.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
