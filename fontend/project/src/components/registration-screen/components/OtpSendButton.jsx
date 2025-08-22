import React from 'react';
import Button from '../../../components/ui/Button';

const OtpSendButton = ({ 
  onSendOtp, 
  loading, 
  otpSent, 
  disabled 
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      loading={loading}
      disabled={disabled}
      iconName={loading ? undefined : otpSent ? "RotateCcw" : "Mail"}
      iconPosition="left"
      onClick={onSendOtp}
      className={disabled ? "bg-dark2 border-none text-white/75" : "bg-primary2 border-none"}
    >
      {loading 
        ? 'Sending code...' 
        : otpSent 
          ? 'Send OTP again' :'Send OTP'
      }
    </Button>
  );
};

export default OtpSendButton;