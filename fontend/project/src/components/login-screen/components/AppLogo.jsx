import React from 'react';
import Icon from '../../../components/AppIcon';

const AppLogo = () => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-primary2 rounded-xl flex items-center justify-center shadow-lg">
          <Icon name="MessageCircle" size={28} color="black" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold text-white tracking-wide justify-center">Whisper</h1>
          <p className="text-sm text-white/90">Secure communication</p>
        </div>
      </div>
    </div>
  );
};

export default AppLogo;