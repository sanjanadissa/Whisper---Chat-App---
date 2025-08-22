import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Button from './Button';
import Icon from '../AppIcon';
import Image from '../AppImage';
import { useAuth } from '../../contexts/AuthContext';

const ProfileImageUploader = forwardRef(({ 
  currentImage = '/assets/images/avatar-placeholder.png',
  onImageChange,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  onUploadComplete
}, ref) => {
  const { token } = useAuth();
  const [preview, setPreview] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!acceptedTypes?.includes(file?.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file?.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    return null;
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Get token from localStorage in case it's not available in context yet
    const currentToken = token || localStorage.getItem('authToken');

    if (!currentToken) {
      // During registration, we'll store the file locally and upload later
      console.log('No token available - storing file for later upload');
      return null; // Return null to indicate no upload happened yet
    }

    console.log('Uploading with token:', currentToken.substring(0, 20) + '...');

    try {
      const response = await fetch('http://localhost:8080/api/upload/profile', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${currentToken}`
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        }
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        if (response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const cloudinaryUrl = await response.text();
      return cloudinaryUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const processFile = useCallback(async (file) => {
    console.log('ProfileImageUploader: processFile called with file:', file?.name);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e?.target?.result);
      };
      reader?.readAsDataURL(file);

      // Upload to Cloudinary (if token is available)
      console.log('ProfileImageUploader: Token available:', !!token);
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      if (cloudinaryUrl) {
        // Upload was successful
        console.log('ProfileImageUploader: Upload successful, URL:', cloudinaryUrl);
        setUploadedUrl(cloudinaryUrl);
        setPendingFile(null); // Clear pending file
        if (onUploadComplete) {
          onUploadComplete(cloudinaryUrl);
        }
      } else {
        // No token available - store file for later upload
        console.log('ProfileImageUploader: No token, storing file for later upload');
        setUploadedUrl('pending'); // Mark as pending upload
        setPendingFile(file); // Store file for later upload
        if (onUploadComplete) {
          onUploadComplete('pending'); // Signal that image is selected but pending upload
        }
      }
      
      // Call parent callbacks
      if (onImageChange) {
        console.log('ProfileImageUploader: Calling onImageChange with file:', file?.name);
        onImageChange(file);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
      setPreview(currentImage);
      setUploadedUrl(null);
    } finally {
      setUploading(false);
    }
  }, [currentImage, maxSize, onImageChange, onUploadComplete, token]);

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Prevent processing if file is already selected and not pending
      if (uploadedUrl && uploadedUrl !== 'pending') {
        console.log('ProfileImageUploader: Preventing file processing - file already selected');
        return;
      }
      processFile(file);
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

  const handleRemoveImage = () => {
    setPreview('/assets/images/avatar-placeholder.png');
    setError('');
    setUploadedUrl(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null);
    }
    if (onUploadComplete) {
      onUploadComplete(null);
    }
  };

  const openFileDialog = () => {
    console.log('ProfileImageUploader: openFileDialog called, uploadedUrl:', uploadedUrl, 'uploading:', uploading);
    
    // Prevent opening if file is already selected and not pending
    if (uploadedUrl && uploadedUrl !== 'pending') {
      console.log('ProfileImageUploader: Preventing file dialog - file already selected');
      return;
    }
    
    // Prevent opening if currently uploading
    if (uploading) {
      console.log('ProfileImageUploader: Preventing file dialog - currently uploading');
      return;
    }
    
    console.log('ProfileImageUploader: Opening file dialog');
    fileInputRef?.current?.click();
  };

  // Expose the uploaded URL to parent components
  useImperativeHandle(ref, () => ({
    getUploadedUrl: () => uploadedUrl,
    reset: () => {
      setPreview('/assets/images/avatar-placeholder.png');
      setUploadedUrl(null);
      setError('');
      if (fileInputRef?.current) {
        fileInputRef.current.value = '';
      }
    },
    openFileDialog: () => {
      if (fileInputRef?.current) {
        fileInputRef.current.click();
      }
    },
    uploadPendingFile: async () => {
      // Get token from localStorage in case it's not available in context yet
      const currentToken = token || localStorage.getItem('authToken');
      console.log('ProfileImageUploader: uploadPendingFile - pendingFile:', !!pendingFile, 'token:', !!currentToken);
      
      if (pendingFile && currentToken) {
        try {
          setUploading(true);
          console.log('ProfileImageUploader: Starting pending file upload...');
          const cloudinaryUrl = await uploadToCloudinary(pendingFile);
          console.log('ProfileImageUploader: Pending file upload result:', cloudinaryUrl);
          if (cloudinaryUrl) {
            setUploadedUrl(cloudinaryUrl);
            setPendingFile(null); // Clear pending file
            if (onUploadComplete) {
              onUploadComplete(cloudinaryUrl);
            }
            return cloudinaryUrl;
          }
        } catch (error) {
          console.error('ProfileImageUploader: Pending file upload error:', error);
          setError(error.message);
          throw error;
        } finally {
          setUploading(false);
        }
      } else {
        console.log('ProfileImageUploader: Cannot upload pending file - pendingFile:', !!pendingFile, 'token:', !!currentToken);
      }
      return null;
    }
  }));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {preview && preview !== '/assets/images/avatar-placeholder.png' ? (
            <Image
              key={preview}
              src={preview}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
              onLoad={() => console.log('ProfileImageUploader: Image loaded successfully')}
              onError={(e) => {
                console.error('ProfileImageUploader: Image failed to load');
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center">
              <Icon name="User" size={24} className="text-muted-foreground" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
              <Icon name="Loader2" size={20} className="animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white/90 mb-1">
            Profile photo
          </h3>
          <p className="text-xs text-white/90">
            JPG, PNG or WebP. Max size {Math.round(maxSize / (1024 * 1024))}MB.
          </p>
        </div>
      </div>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // Only allow clicks if no file is selected or if we're in pending state
          if (uploadedUrl && uploadedUrl !== 'pending') {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          
          // Only allow clicks if not currently uploading
          if (uploading) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          
          // Open file dialog
          openFileDialog();
        }}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center micro-animation 
          ${isDragging 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${uploading || (uploadedUrl && uploadedUrl !== 'pending') ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes?.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || (uploadedUrl && uploadedUrl !== 'pending')}
        />
        
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Icon 
              name={uploading ? "Loader2" : "Upload"} 
              size={24} 
              className={`text-muted-foreground ${uploading ? 'animate-spin' : ''}`} 
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-white/75">
              {uploading ? 'Uploading...' : 
               uploadedUrl && uploadedUrl !== 'pending' ? 'File selected successfully!' :
               'Drop your image here, or click to browse'}
            </p>
            <p className="text-xs text-white/75 mt-1">
              {uploadedUrl && uploadedUrl !== 'pending' ? 
               'Your profile picture is ready' :
               `Supports: ${acceptedTypes?.map(type => type?.split('/')?.[1]?.toUpperCase())?.join(', ')}`
              }
            </p>
          </div>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-md">
          <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          iconName={uploadedUrl && uploadedUrl !== 'pending' ? "Check" : "Upload"}
          iconPosition="left"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Only open dialog if no file is selected or if we're in pending state
            if (!uploadedUrl || uploadedUrl === 'pending') {
              openFileDialog();
            }
          }}
          disabled={uploading}
          className={uploadedUrl && uploadedUrl !== 'pending' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-dark2 border-none  hover:scale-105 transition-transform'}
        >
          {uploadedUrl && uploadedUrl !== 'pending' ? 'File Selected' : 'Choose file'}
        </Button>
        
        {preview !== '/assets/images/avatar-placeholder.png' && (
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            iconPosition="left"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="text-muted-foreground hover:text-error"
          >
            Remove
          </Button>
        )}
      </div>
      {/* Upload Progress Indicator */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading to Cloudinary...</span>
            <span className="text-primary">Processing</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full animate-pulse-gentle w-3/4"></div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {uploadedUrl && uploadedUrl !== 'pending' && !uploading && (
        <div className="flex items-center space-x-2 p-3 bg-success/10 border border-success/20 rounded-md">
          <Icon name="CheckCircle" size={16} className="text-success flex-shrink-0" />
          <p className="text-sm text-success">Image uploaded successfully!</p>
        </div>
      )}
      

    </div>
  );
});

export default ProfileImageUploader;