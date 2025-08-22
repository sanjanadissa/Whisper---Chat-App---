import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Icon from 'components/AppIcon';

const AuthenticationRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('login');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/registration-screen') {
      setCurrentView('register');
    } else {
      setCurrentView('login');
    }
  }, [location.pathname]);

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

  const handleEmailSubmit = async (e) => {
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

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      setResendTimer(30); // 30 seconds
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      const nextField = document.getElementById(`otp-${index + 1}`);
      if (nextField) nextField?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      const prevField = document.getElementById(`otp-${index - 1}`);
      if (prevField) prevField?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e?.preventDefault();
    const otpValue = otp?.join('');
    
    if (otpValue?.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    setLoading(true);
    setErrors({});

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Redirect to main chat application
      navigate('/chat');
    }, 2000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setResendTimer(30); // 30 seconds
      setOtp(['', '', '', '', '', '']);
    }, 1000);
  };

  const switchView = (view) => {
    setCurrentView(view);
    setEmail('');
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    setResendTimer(0);
    
    if (view === 'login') {
      navigate('/login-screen');
    } else {
      navigate('/registration-screen');
    }
  };

  const resetFlow = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    setResendTimer(0);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="MessageCircle" size={20} color="white" />
            </div>
            <span className="text-2xl font-semibold text-foreground">RealTime ChatApp</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Secure communication for everyone
          </p>
        </div>

        {/* Main Card */}
        <div className="auth-card p-6">
          {!otpSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {currentView === 'login' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-muted-foreground">
                  {currentView === 'login' ?'Enter your email to sign in to your account' :'Enter your email to create a new account'
                  }
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value)}
                  error={errors?.email}
                  required
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="default"
                  fullWidth
                  loading={loading}
                  iconName={loading ? undefined : "Mail"}
                  iconPosition="left"
                >
                  {loading 
                    ? 'Sending code...' 
                    : `Send verification code`
                  }
                </Button>
              </form>

              {/* Switch View */}
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {currentView === 'login' ? "Don't have an account? " :"Already have an account? "
                  }
                  <button
                    type="button"
                    onClick={() => switchView(currentView === 'login' ? 'register' : 'login')}
                    className="text-primary hover:text-primary/80 font-medium micro-animation"
                    disabled={loading}
                  >
                    {currentView === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Mail" size={24} color="var(--color-accent)" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Check your email
                </h1>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to
                </p>
                <p className="text-foreground font-medium">{email}</p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Verification code
                  </label>
                  <div className="flex space-x-2 justify-center">
                    {otp?.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
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
                    <p className="text-error text-sm mt-1">{errors?.otp}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  fullWidth
                  loading={loading}
                  iconName={loading ? undefined : "Check"}
                  iconPosition="left"
                >
                  {loading ? 'Verifying...' : 'Verify code'}
                </Button>
              </form>

              {/* Resend & Back */}
              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="text-primary hover:text-primary/80 font-medium micro-animation disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 
                      ? `Resend code in ${resendTimer}s`
                      : 'Resend code'
                    }
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="text-muted-foreground hover:text-foreground text-sm micro-animation"
                    disabled={loading}
                  >
                    ← Back to email
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            <Icon name="Shield" size={12} className="inline mr-1" />
            Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationRouter;