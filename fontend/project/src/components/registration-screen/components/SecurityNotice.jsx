import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityNotice = () => {
  return (
    <div className="mt-6 text-center">
      <p className="text-xs text-white/75 flex items-center justify-center space-x-1">
        <Icon name="Shield" size={12} />
        <span>Your data is encrypted and secure</span>
      </p>
      <p className="text-xs text-white/75 mt-1">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default SecurityNotice;