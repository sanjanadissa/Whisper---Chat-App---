import React, { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';
import Image from '../../AppImage';

const ProfileImageSection = ({ 
  onImageChange,
  className = ''
}) => {
  const { user } = useAuth();
  const [preview, setPreview] = useState(user?.profileImageUrl || '/assets/images/avatar-placeholder.png');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    if (!file?.type?.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file?.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e?.target?.result);
      };
      reader?.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8080/api/upload/profile', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const cloudinaryUrl = await response.text();
      
      // Update the user's profile image URL in the database
      const updateResponse = await fetch('http://localhost:8080/user/update-profile-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileImageUrl: cloudinaryUrl })
      });

      if (updateResponse.ok) {
        console.log('Profile image updated successfully');
        // Update the preview to show the new image
        setPreview(cloudinaryUrl);
        if (onImageChange) {
          onImageChange(cloudinaryUrl);
        }
        // Refresh the page to update user data
        window.location.reload();
      } else {
        throw new Error('Failed to update profile image in database');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setPreview(user?.profileImageUrl || '/assets/images/avatar-placeholder.png');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const openFileDialog = () => {
    document.getElementById('profile-image-input')?.click();
  };

  // Get fallback text for initials
  const fallbackText = user?.fullname || user?.username || user?.userName || user?.userphonenumber || user?.phoneNumber || 'User';
  const initials = fallbackText
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color based on text
  const backgroundColor = fallbackText.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0) % 12;

  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#F97316', '#06B6D4',
    '#84CC16', '#F43F5E', '#A855F7', '#14B8A6'
  ];

  const currentProfileImage = user?.profileImageUrl;
  const hasValidImage = (currentProfileImage && currentProfileImage !== 'null' && currentProfileImage !== 'undefined' && currentProfileImage !== '') || 
                       (preview && preview !== '/assets/images/avatar-placeholder.png');

  return (
    <div className={`bg-chatbg rounded-lg p-6 border border-dark2 ${className}`}>
      <h2 className="text-lg font-semibold text-white/90 mb-4">Profile Photo</h2>
      
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Current Image */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary2">
            {hasValidImage ? (
              <Image
                key={preview !== '/assets/images/avatar-placeholder.png' ? preview : currentProfileImage}
                src={preview !== '/assets/images/avatar-placeholder.png' ? preview : currentProfileImage}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('ProfileImageSection: Image failed to load');
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center font-semibold text-white text-2xl"
                style={{ backgroundColor: colors[Math.abs(backgroundColor)] }}
              >
                {initials}
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
              <Icon name="Loader2" size={20} className="animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 w-full">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed border-white-75 rounded-lg p-4 text-center cursor-pointer micro-animation
              ${isDragging 
                ? 'border-primary bg-primary/5' :'border-white/90 hover:border-primary/50 hover:bg-muted/50'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={openFileDialog}
          >
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Icon 
                  name={uploading ? "Loader2" : "Upload"} 
                  size={20} 
                  className={`text-muted-foreground ${uploading ? 'animate-spin' : ''}`} 
                />
              </div>
              
              <div>
                <p className="text-sm font-medium text-white/85 text-white">
                  {uploading ? 'Uploading...' : 'Drop your image here, or browse'}
                </p>
                <p className="text-xs text-white/75">
                  JPG, PNG or WebP. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 mt-3 p-2 bg-error/10 border border-error/20 rounded-md">
              <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 mt-4">
            <Button
              className="bg-primary2 text-black"
              size="sm"
              iconName="Upload"
              iconPosition="left"
              onClick={openFileDialog}
              disabled={uploading}
            >
              Choose file
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => setPreview(user?.profileImageUrl || '/assets/images/avatar-placeholder.png')}
              disabled={uploading}
              className="text-white/75 bg-dark2 hover:text-error"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageSection;