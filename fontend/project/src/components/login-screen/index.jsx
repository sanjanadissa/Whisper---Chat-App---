import React from 'react';
import AppLogo from './components/AppLogo';
import WelcomeMessage from './components/WelcomeMessage';
import LoginForm from './components/LoginForm';
import NavigationLinks from './components/NavigationLinks';
import SecurityNotice from './components/SecurityNotice';

const LoginScreen = () => {
  return (
    <div className="min-h-screen bg-darkbg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Logo */}
        <AppLogo />

        {/* Main Authentication Card */}
        <div className="auth-card p-8 sm:p-6 bg-chatbg border-dark2">
          {/* Welcome Message */}
          <WelcomeMessage />

          {/* Login Form */}
          <LoginForm />

          {/* Navigation Links */}
          <NavigationLinks />
        </div>

        {/* Security Notice */}
        <SecurityNotice />
      </div>
    </div>
  );
};

export default LoginScreen;