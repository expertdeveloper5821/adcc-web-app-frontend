import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login
          onSwitchToRegister={() => setIsLogin(false)}
          onLoginSuccess={onAuthSuccess}
        />
      ) : (
        <Register
          onSwitchToLogin={() => setIsLogin(true)}
          onRegisterSuccess={onAuthSuccess}
        />
      )}
    </>
  );
}
