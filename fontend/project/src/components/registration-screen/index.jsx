import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RegistrationHeader from './components/RegistrationHeader';
import RegistrationForm from './components/RegistrationForm';
import OtpVerification from './components/OtpVerification';
import OtpSendButton from './components/OtpSendButton';
import SecurityNotice from './components/SecurityNotice';

const RegistrationScreen = () => {
  const navigate = useNavigate();
  const { sendRegistrationOtp, register, loading } = useAuth();
  const formRef = useRef();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    username: '',
    fullName: '',
    profileImageUrl: '',
    description: ''
  });

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // UI state
  const [errors, setErrors] = useState({});

  // Timer effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (otpSent) {
      if (!formData?.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      }

      if (!formData?.username) {
        newErrors.username = 'Username is required';
      } else if (formData?.username?.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData?.fullName) {
        newErrors.fullName = 'Full name is required';
      }

      if (formData?.description && formData?.description?.length > 500) {
        newErrors.description = 'Description must be less than 500 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Handle sending OTP
  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setErrors({});

    try {
      await sendRegistrationOtp(formData.email);
      setOtpSent(true);
      setResendTimer(30); // 30 seconds
    } catch (error) {
      setErrors({ email: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
    }
  };

  // Handle resending OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      await sendRegistrationOtp(formData.email);
      setResendTimer(30); // 30 seconds
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setErrors({ email: error.response?.data?.message || 'Failed to resend OTP. Please try again.' });
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    const otpValue = otp?.join('');

    if (otpValue?.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    setErrors({});

    try {
      console.log('RegistrationScreen: Sending registration data:', formData);
      console.log('RegistrationScreen: Profile Image URL in formData:', formData.profileImageUrl);
      
      // If profileImageUrl is 'pending', set it to null for registration
      const registrationData = {
        ...formData,
        profileImageUrl: formData.profileImageUrl === 'pending' ? null : formData.profileImageUrl
      };
      
      console.log('RegistrationScreen: Final registration data:', registrationData);
      await register(registrationData, otpValue);

      // Try to upload pending image if any
      if (formData.profileImageUrl === 'pending' && formRef.current?.imageUploaderRef?.current?.uploadPendingFile) {
        try {
          console.log('Attempting to upload pending image...');
          console.log('Image uploader ref:', formRef.current?.imageUploaderRef?.current);
          const uploadedUrl = await formRef.current.imageUploaderRef.current.uploadPendingFile();
          console.log('Pending image upload result:', uploadedUrl);

          // Update the user's profile image URL in the database
          if (uploadedUrl) {
            console.log('Updating user profile image URL:', uploadedUrl);
            try {
              // Get the token from localStorage since we just registered
              const token = localStorage.getItem('authToken');
              if (token) {
                const response = await fetch('http://localhost:8080/user/update-profile-image', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ profileImageUrl: uploadedUrl })
                });

                if (response.ok) {
                  console.log('Profile image URL updated successfully in database');
                } else {
                  console.error('Failed to update profile image URL in database');
                }
              }
            } catch (error) {
              console.error('Error updating profile image URL:', error);
            }
          }
        } catch (uploadError) {
          console.error('Failed to upload pending image:', uploadError);
          // Don't block registration if image upload fails
        }
      }

      // Redirect to login after successful registration
      navigate('/login');
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || 'Registration failed. Please try again.' });
    }
  };

  // Check if register button should be shown
  const showRegisterButton = otpSent && otp?.join('')?.length === 6;

  // Check if send OTP button should be disabled
  const sendOtpDisabled = !formData?.email || !validateEmail(formData?.email) || loading;

  return (
    <div className="min-h-screen bg-darkbg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegistrationHeader />

        {/* Main Registration Card */}
        <div className="auth-card p-6 bg-chatbg border-dark2">
          <RegistrationForm
            ref={formRef}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleRegister}
            loading={loading}
            errors={errors}
            otpSent={otpSent}
            showRegisterButton={showRegisterButton}
          />

          {/* OTP Send Button */}
          {!showRegisterButton && (
            <div className="mt-4">
              <OtpSendButton
                onSendOtp={handleSendOtp}
                loading={loading}
                otpSent={otpSent}
                disabled={sendOtpDisabled}
              />
            </div>
          )}

          {/* OTP Verification */}
          <div className="mt-6">
            <OtpVerification
              email={formData?.email}
              otp={otp}
              onOtpChange={setOtp}
              onResendOtp={handleResendOtp}
              loading={loading}
              errors={errors}
              otpSent={otpSent}
              resendTimer={resendTimer}
            />
          </div>
        </div>

        <SecurityNotice />
      </div>
    </div>
  );
};

export default RegistrationScreen; 