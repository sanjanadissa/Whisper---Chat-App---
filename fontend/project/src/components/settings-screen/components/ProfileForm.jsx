import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Icon from '../../AppIcon';

const ProfileForm = ({ 
  onSave,
  className = ''
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    description: ''
  });
  const [editingField, setEditingField] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data with current user data
  useEffect(() => {
    if (user) {
      const initialData = {
        username: user.username || user.userName || '',
        fullName: user.fullname || '',
        email: user.useremail || user.email || '',
        phoneNumber: user.userphonenumber || user.phoneNumber || '',
        description: user.discription || ''
      };
      setFormData(initialData);
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'username':
        if (!value?.trim()) return 'Username is required';
        if (value?.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/?.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      case 'fullName':
        if (!value?.trim()) return 'Full name is required';
        if (value?.length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!value?.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phoneNumber':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/?.test(value?.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      default:
        return '';
    }
  };

  const handleFieldSave = async (field) => {
    const error = validateField(field, formData?.[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Map frontend field names to backend field names
      const backendFieldMap = {
        username: 'userName',
        fullName: 'fullname',
        description: 'description'
      };

      const backendField = backendFieldMap[field] || field;
      const updateData = { [backendField]: formData[field] };

      const response = await fetch('http://localhost:8080/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        setEditingField(null);
        setHasChanges(false);
        if (onSave) {
          onSave(formData);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors(prev => ({ ...prev, [field]: err.message || 'Failed to save. Please try again.' }));
    } finally {
      setSaving(false);
    }
  };

  const handleFieldCancel = (field) => {
    // Reset to original user data
    if (user) {
      const originalValue = user[field === 'username' ? 'userName' : field === 'fullName' ? 'fullname' : field === 'description' ? 'discription' : field] || '';
      setFormData(prev => ({ ...prev, [field]: originalValue }));
    }
    setEditingField(null);
    setErrors(prev => ({ ...prev, [field]: '' }));
    setHasChanges(false);
  };

  const handleSaveAll = async () => {
    const newErrors = {};
    Object.keys(formData)?.forEach(field => {
      const error = validateField(field, formData?.[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Map frontend field names to backend field names
      const updateData = {
        userName: formData.username,
        fullname: formData.fullName,
        description: formData.description
      };

      const response = await fetch('http://localhost:8080/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        setHasChanges(false);
        if (onSave) {
          onSave(formData);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ general: err.message || 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field, label, type = 'text', placeholder = '') => {
    const isEditing = editingField === field;
    const fieldError = errors?.[field];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/90">{label}</label>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              iconName="Edit2"
              onClick={() => setEditingField(field)}
              className="text-white hover:text-white"
            />
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type={type}
              value={formData?.[field]}
              onChange={(e) => handleInputChange(field, e?.target?.value)}
              placeholder={placeholder}
              error={fieldError}
              className="w-full bg-white/10 text-white border border-primary2/50"
            />
            <div className="flex space-x-2">
              <Button
                variant="default"
                className="bg-primary2 text-black hover:bg-primary2/75"
                size="sm"
                iconName="Check"
                iconPosition="left"
                onClick={() => handleFieldSave(field)}
                loading={saving}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                className="bg-white/10 text-white hover:bg-[#505050]/75"
                size="sm"
                iconName="X"
                iconPosition="left"
                onClick={() => handleFieldCancel(field)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-dark2 rounded-md">
            <p className="text-sm text-white/75">
              {formData?.[field] || user?.[field === 'username' ? 'username' : field === 'fullName' ? 'fullname' : field === 'email' ? 'useremail' : field === 'phoneNumber' ? 'userphonenumber' : field === 'description' ? 'discription' : field] || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-chatbg rounded-lg p-6 border border-dark2 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/90">Profile Information</h2>
        {hasChanges && (
          <Button
            variant="default"
            size="sm"
            className="bg-primary2 text-black hover:bg-primary2/75"
            onClick={handleSaveAll}
            loading={saving}
          >
            Save All Changes
          </Button>
        )}
      </div>
      {errors?.general && (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
          <p className="text-sm text-error">{errors?.general}</p>
        </div>
      )}
      <div className="space-y-6 text-black">
        {renderField('username', 'Username', 'text', 'Enter your username')}
        {renderField('fullName', 'Full Name', 'text', 'Enter your full name')}
        {renderField('email', 'Email Address', 'email', 'Enter your email address')}
        {renderField('phoneNumber', 'Phone Number', 'tel', 'Enter your phone number')}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/90">Description</label>
            {editingField !== 'description' && (
              <Button
                variant="ghost"
                size="sm"
                iconName="Edit2"
                onClick={() => setEditingField('description')}
                className="text-white hover:text-foreground"
              />
            )}
          </div>
          
          {editingField === 'description' ? (
            <div className="space-y-2">
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full p-3 border border-primary2/50 rounded-md bg-dark2 text-white/90 placeholder:text-white/75 micro-animation resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  iconName="Check"
                  iconPosition="left"
                  onClick={() => handleFieldSave('description')}
                  loading={saving}
                  className="bg-primary2 text-black hover:bg-primary2/75"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  iconPosition="left"
                  onClick={() => handleFieldCancel('description')}
                  disabled={saving}
                  className="bg-white/10 text-white hover:bg-[#505050]/75"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-dark2 rounded-md">
              <p className="text-sm text-white/75 whitespace-pre-wrap">
                {formData?.description || user?.discription || <span className="text-foreground italic">No description added</span>}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;