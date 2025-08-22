import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ProfileImageUploader from '../../ui/ProfileImageUploader';


const RegistrationForm = forwardRef(({ 
  formData, 
  onFormChange, 
  onSubmit, 
  loading, 
  errors,
  otpSent,
  showRegisterButton 
}, ref) => {
  const imageUploaderRef = useRef();
  
  useImperativeHandle(ref, () => ({
    imageUploaderRef
  }));
  
  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit();
  };

  const handleImageUploadComplete = (url) => {
    console.log('RegistrationForm: handleImageUploadComplete called with URL:', url);
    if (url) {
      if (url === 'pending') {
        console.log('RegistrationForm: Image upload is pending - will be uploaded after registration');
        // Set a placeholder to indicate image is selected
        onFormChange({ ...formData, profileImageUrl: 'pending' });
        console.log('RegistrationForm: Set profileImageUrl to "pending" in formData');
      } else {
        console.log('RegistrationForm: Setting profileImageUrl in formData:', url);
        onFormChange({ ...formData, profileImageUrl: url });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white/90">
      {/* Email Field - Always visible */}
      <Input
        type="email"
        label="Email address"
        placeholder="Enter your email"
        value={formData?.email}
        onChange={(e) => handleInputChange('email', e?.target?.value)}
        error={errors?.email}
        required
        disabled={loading || otpSent}
      />
      {/* Additional fields - Show after OTP is sent */}
      {otpSent && (
        <>
          
          <Input
            type="tel"
            label="Phone number"
            placeholder="Enter your phone number"
            value={formData?.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e?.target?.value)}
            error={errors?.phoneNumber}
            required
            disabled={loading}
          />
          
          <Input
            type="text"
            label="Username"
            placeholder="Choose a username"
            value={formData?.username}
            onChange={(e) => handleInputChange('username', e?.target?.value)}
            error={errors?.username}
            required
            disabled={loading}
            description="This will be your unique identifier"
          />

          <Input
            type="text"
            label="Full name"
            placeholder="Enter your full name"
            value={formData?.fullName}
            onChange={(e) => handleInputChange('fullName', e?.target?.value)}
            error={errors?.fullName}
            required
            disabled={loading}
          />
          <ProfileImageUploader 
            ref={imageUploaderRef}
            onUploadComplete={handleImageUploadComplete}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Description
            </label>
            <textarea
              placeholder="Tell us about yourself (optional)"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-white/10 rounded-md bg-dark2 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:border-primary2 focus:ring-primary2 micro-animation resize-none"
            />
            {errors?.description && (
              <p className="text-error text-sm">{errors?.description}</p>
            )}
          </div>
        </>
      )}
      {/* Register Button - Show when OTP is sent and form is complete */}
      {showRegisterButton && (
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={loading}
          iconName={loading ? undefined : "UserPlus"}
          iconPosition="left"
          className={loading ? "bg-dark2" : "bg-primary2 text-black"}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      )}
    </form>
  );
});

export default RegistrationForm;