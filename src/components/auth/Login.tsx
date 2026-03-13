import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/** Google "G" logo SVG for Sign in with Google button */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export function Login({ onSwitchToRegister, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [completeProfileGender, setCompleteProfileGender] = useState<'Male' | 'Female'>('Male');
  const [completeProfileAge, setCompleteProfileAge] = useState('');
  const [completeProfileDob, setCompleteProfileDob] = useState('');
  const [completeProfileCountry, setCompleteProfileCountry] = useState('UAE');
  const [completeProfileLoading, setCompleteProfileLoading] = useState(false);
  const { login, loginWithGoogle, pendingGoogleProfile, completeGoogleRegistration } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t('auth.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // If existing user, AuthContext sets userProfile and parent will redirect.
      // If new user, pendingGoogleProfile is set and we show complete-profile form.
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(completeProfileAge, 10);
    if (isNaN(age) || age < 0 || age > 150) {
      toast.error(t('auth.invalidAge'));
      return;
    }
    if (!completeProfileDob) {
      toast.error(t('auth.dobRequired'));
      return;
    }
    if (!completeProfileCountry) {
      toast.error(t('auth.countryRequired'));
      return;
    }
    setCompleteProfileLoading(true);
    try {
      await completeGoogleRegistration(completeProfileGender, age, completeProfileDob, completeProfileCountry);
      onLoginSuccess();
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setCompleteProfileLoading(false);
    }
  };

  // Show "Complete your profile" form for new Google users
  if (pendingGoogleProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#333' }}>
                {t('auth.completeProfile')}
              </h1>
              <p className="text-sm" style={{ color: '#666' }}>
                {t('auth.completeProfileSubtitle')}
              </p>
              <p className="text-sm mt-2 font-medium" style={{ color: '#333' }}>
                {pendingGoogleProfile.fullName || pendingGoogleProfile.email}
              </p>
            </div>

            <form onSubmit={handleCompleteProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('auth.gender')}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={completeProfileGender === 'Male'}
                      onChange={() => setCompleteProfileGender('Male')}
                      className="w-4 h-4"
                    />
                    <span style={{ color: '#333' }}>{t('auth.male')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={completeProfileGender === 'Female'}
                      onChange={() => setCompleteProfileGender('Female')}
                      className="w-4 h-4"
                    />
                    <span style={{ color: '#333' }}>{t('auth.female')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('auth.age')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                  <input
                    type="number"
                    min={0}
                    max={150}
                    value={completeProfileAge}
                    onChange={(e) => setCompleteProfileAge(e.target.value)}
                    placeholder={t('auth.agePlaceholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('auth.dob')}
                </label>
                <input
                  type="date"
                  value={completeProfileDob}
                  onChange={(e) => setCompleteProfileDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('auth.country')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                  <select
                    value={completeProfileCountry}
                    onChange={(e) => setCompleteProfileCountry(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                    required
                  >
                    <option value="UAE">{t('common.country.uae')}</option>
                    <option value="Saudi Arabia">{t('common.country.saudiArabia')}</option>
                    <option value="Kuwait">{t('common.country.kuwait')}</option>
                    <option value="Bahrain">{t('common.country.bahrain')}</option>
                    <option value="Oman">{t('common.country.oman')}</option>
                    <option value="Qatar">{t('common.country.qatar')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={completeProfileLoading}
                className="w-full py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#C12D32' }}
              >
                {completeProfileLoading ? t('auth.creatingAccount') : t('auth.signIn')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#333' }}>
              {t('auth.welcome')}
            </h1>
            <p style={{ color: '#666' }}>{t('auth.signInSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C12D32' }}
            >
              {isLoading ? (
                t('auth.signingIn')
              ) : (
                <>
                  {t('auth.signIn')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white" style={{ color: '#666' }}>
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 rounded-lg border border-gray-200 bg-white transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ color: '#333' }}
          >
            <GoogleIcon />
            {googleLoading ? t('auth.signingIn') : t('auth.signInWithGoogle')}
          </button>

          <div className="mt-6 text-center">
            <p style={{ color: '#666' }}>
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold hover:underline"
                style={{ color: '#C12D32' }}
              >
                {t('auth.signUp')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
