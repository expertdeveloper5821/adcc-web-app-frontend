import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useTranslation } from 'react-i18next';

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export function Login({ onSwitchToRegister, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
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

          <div className="mt-6 text-center">
            <p style={{ color: '#666' }}>
              {t('auth.noAccount')}{' '}
              <button
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
