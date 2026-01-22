import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export function Register({ onSwitchToLogin, onRegisterSuccess }: RegisterProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    gender: 'Male' as 'Male' | 'Female',
    age: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 150) {
      toast.error('Please enter a valid age (0-150)');
      return;
    }

    setIsLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.gender,
        age
      );
      onRegisterSuccess();
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#333' }}>
              Create Account
            </h1>
            <p style={{ color: '#666' }}>Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                    min="0"
                    max="150"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
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
                'Creating account...'
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: '#666' }}>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-semibold hover:underline"
                style={{ color: '#C12D32' }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
