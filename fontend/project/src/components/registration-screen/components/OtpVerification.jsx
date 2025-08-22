import React, { useState, useEffect } from 'react';

import Icon from '../../../components/AppIcon';

const OtpVerification = ({ 
  email, 
  otp, 
  onOtpChange, 
  onResendOtp, 
  loading, 
  errors, 
  otpSent,
  resendTimer 
}) => {
  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    onOtpChange(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      const nextField = document.getElementById(`reg-otp-${index + 1}`);
      if (nextField) nextField?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      const prevField = document.getElementById(`reg-otp-${index - 1}`);
      if (prevField) prevField?.focus();
    }
  };

  if (!otpSent) return null;

  return (
    <div className="space-y-4">
      {/* OTP Info */}
      <div className="text-center">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="Mail" size={24} color="var(--color-accent)" />
        </div>
        <h3 className="text-lg font-semibold text-white/90 mb-1">
          Verify your email
        </h3>
        <p className="text-sm text-white/50">
          We sent a 6-digit code to
        </p>
        <p className="text-sm font-medium text-white/50">{email}</p>
      </div>
      {/* OTP Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/90">
          Verification code
        </label>
        <div className="flex space-x-2 justify-center">
          {otp?.map((digit, index) => (
            <input
              key={index}
              id={`reg-otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e?.target?.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="otp-field focus:border-primary focus:ring-1 focus:ring-primary micro-animation"
              disabled={loading}
            />
          ))}
        </div>
        {errors?.otp && (
          <p className="text-error text-sm text-center">{errors?.otp}</p>
        )}
      </div>
      {/* Resend OTP */}
      <div className="text-center">
        <button
          type="button"
          onClick={onResendOtp}
          disabled={resendTimer > 0 || loading}
          className="text-primary2/90 hover:text-primary2/75 font-medium micro-animation disabled:text-muted-foreground disabled:cursor-not-allowed text-sm"
        >
          {resendTimer > 0 
            ? `Resend code in ${resendTimer}s`
            : 'Resend verification code'
          }
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;