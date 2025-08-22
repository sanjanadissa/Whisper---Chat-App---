import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityNotice = () => {
  return (
    <div className="mt-8 text-center">
      <div className="inline-flex items-center space-x-2 text-xs text-primary2/75">
        <Icon name="Shield" size={14} />
        <span>Your data is encrypted and secure</span>
      </div>
    </div>
  );
};

export default SecurityNotice;