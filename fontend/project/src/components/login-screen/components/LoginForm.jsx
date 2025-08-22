import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { sendLoginOtp, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e?.target?.value);
    if (errors?.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      await sendLoginOtp(email);
      setOtpSent(true);
      setResendTimer(30); // 30 seconds
      // Focus first OTP input
      if (otpRefs?.current?.[0]) {
        otpRefs?.current?.[0]?.focus();
      }
    } catch (error) {
      setErrors({ email: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
    }
  };

  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (errors?.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    // Auto-focus next field
    if (value && index < 5) {
      otpRefs?.current?.[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      otpRefs?.current?.[index - 1]?.focus();
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const otpValue = otp?.join('');
    
    if (otpValue?.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    setOtpLoading(true);
    setErrors({});

    try {
      await login(email, otpValue);
      // Navigate to chat interface after successful login
      navigate('/chat');
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || 'Invalid OTP. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    try {
      await sendLoginOtp(email);
      setResendTimer(30); // 30 seconds
      setOtp(['', '', '', '', '', '']);
      if (otpRefs?.current?.[0]) {
        otpRefs?.current?.[0]?.focus();
      }
    } catch (error) {
      setErrors({ email: error.response?.data?.message || 'Failed to resend OTP. Please try again.' });
    }
  };

  return (
    <form className="space-y-6 text-white/90">
      {/* Email Input */}
      <Input
        type="email"
        label="Email address"
        placeholder="Enter your email"
        value={email}
        onChange={handleEmailChange}
        error={errors?.email}
        required
        disabled={loading || otpLoading}
      />
      {errors?.otp && (
        <p className="text-error text-sm mt-1">{errors?.otp}</p>
      )}
      {/* Send OTP Button */}
      {!otpSent ? (
        <Button
          type="button"
          variant="default"
          fullWidth
          loading={loading}
          iconName={loading ? undefined : "Mail"}
          iconPosition="left"
          onClick={handleSendOtp}
          className={"bg-primary2 hover:bg-primary2/75 text-black"}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      ) : (
        <>
          {/* OTP Input Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Verification code
            </label>
            <div className="flex space-x-2 justify-center">
              {otp?.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e?.target?.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-field bg-white/90 micro-animation text-black"
                  disabled={loading || otpLoading}
                  
                />
              ))}
            </div>
            {errors?.otp && (
              <p className="text-error text-sm mt-1">{errors?.otp}</p>
            )}
            <p className="text-xs text-white/50 text-center">
              We sent a 6-digit code to {email}
            </p>
          </div>

          {/* Send OTP Again Button */}
          <Button
            type="button"
            fullWidth
            loading={loading}
            disabled={resendTimer > 0}
            iconName={loading ? undefined : "RefreshCw"}
            iconPosition="left"
            onClick={handleResendOtp}
            className={"bg-dark2 hover:bg-primary2 hover:text-black"}
          >
            {loading 
              ? 'Sending...' 
              : resendTimer > 0 
                ? `Send OTP again (${resendTimer}s)`
                : 'Send OTP again'
            }
          </Button>

          {/* Login Button */}
          <Button
            type="button"
            variant="default"
            fullWidth
            loading={otpLoading}
            iconName={otpLoading ? undefined : "LogIn"}
            iconPosition="left"
            onClick={handleLogin}
            className={"bg-primary2 hover:bg-primary2/75 text-black"}
          >
            {otpLoading ? 'Logging in...' : 'Login'}
          </Button>
        </>
      )}
    </form>
  );
};

export default LoginForm;