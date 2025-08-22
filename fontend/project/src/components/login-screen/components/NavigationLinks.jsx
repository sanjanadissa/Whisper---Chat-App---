import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationLinks = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="mt-8 text-center">
      <p className="text-white/75 text-sm">
        New user?{' '}
        <button
          type="button"
          onClick={handleRegisterClick}
          className="text-white/75 hover:text-primary2/75 font-medium micro-animation underline"
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default NavigationLinks;