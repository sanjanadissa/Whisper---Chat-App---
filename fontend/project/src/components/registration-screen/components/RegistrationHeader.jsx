import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const RegistrationHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="inline-flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-primary2 rounded-lg flex items-center justify-center">
          <Icon name="MessageCircle" size={20} color="black" />
        </div>
        <span className="text-2xl font-semibold text-white">Whisper</span>
      </div>

      {/* Header Text */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white/75">
          Create your account
        </h1>
        <p className="text-white/75">
          Join our community and start chatting with friends
        </p>
      </div>

      {/* Login Link */}
      <div className="mt-6">
        <p className="text-white/50 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary2 hover:text-primary2/75 font-medium micro-animation"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationHeader;