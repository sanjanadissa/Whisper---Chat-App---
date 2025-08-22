import React from 'react';

const WelcomeMessage = () => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-semibold text-[#e9e9e9] mb-2">
        Welcome back
      </h2>
      <p className="text-[#e9e9e9]/75">
        Enter your email to sign in to your account
      </p>
    </div>
  );
};

export default WelcomeMessage;