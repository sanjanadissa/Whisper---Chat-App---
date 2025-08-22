import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Checkbox } from '../../ui/Checkbox';
import Icon from '../../AppIcon';

const SecuritySettings = ({ 
  onSecurityChange,
  className = ''
}) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    logoutInactive: true,
    inactiveTime: 30,
    showActiveDevices: true
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, NY",
      lastActive: "Active now",
      current: true
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, NY", 
      lastActive: "2 hours ago",
      current: false
    },
    {
      id: 3,
      device: "Chrome on MacBook",
      location: "New York, NY",
      lastActive: "1 day ago",
      current: false
    }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!passwords?.current) {
      newErrors.current = 'Current password is required';
    }
    
    if (!passwords?.new) {
      newErrors.new = 'New password is required';
    } else if (passwords?.new?.length < 8) {
      newErrors.new = 'Password must be at least 8 characters';
    }
    
    if (passwords?.new !== passwords?.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handlePasswordSubmit = async () => {
    const validationErrors = validatePasswords();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasswords({ current: '', new: '', confirm: '' });
      setShowChangePassword(false);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Failed to change password. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async (enabled) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTwoFactorEnabled(enabled);
    } catch (err) {
      console.error('Failed to toggle 2FA');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutDevice = async (sessionId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Failed to logout device');
    }
  };

  return (
    <div className={`bg-chatbg rounded-lg p-6 border border-dark2 text-white ${className}`}>
      <h2 className="text-lg font-semibold text-white/90 mb-6">Security & Privacy</h2>
      <div className="space-y-8">
        
        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/90">Password</h3>
            <Button
              size="sm"
              iconName="Key"
              iconPosition="left"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className={"bg-white/10 text-white/90 hover:bg-white/25 hover:text-white/80"}
            >
              Change Password
            </Button>
          </div>

          {showChangePassword && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              {errors?.general && (
                <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-md">
                  <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
                  <p className="text-sm text-error">{errors?.general}</p>
                </div>
              )}

              <Input
                type="password"
                label="Current Password"
                placeholder="Enter current password"
                value={passwords?.current}
                onChange={(e) => handlePasswordChange('current', e?.target?.value)}
                error={errors?.current}
                className={"bg-dark2 border border-white/10 placeholder:text-white/75"}
                required
              />

              <Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={passwords?.new}
                onChange={(e) => handlePasswordChange('new', e?.target?.value)}
                className={"bg-dark2 border border-white/10 placeholder:text-white/75"}
                error={errors?.new}
                required
              />

              <Input
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwords?.confirm}
                onChange={(e) => handlePasswordChange('confirm', e?.target?.value)}
                className={"bg-dark2 border border-white/10 placeholder:text-white/75"}
                error={errors?.confirm}
                required
              />

              <div className="flex space-x-3">
                <Button
                  variant="default"
                  iconName="Check"
                  iconPosition="left"
                  onClick={handlePasswordSubmit}
                  loading={saving}
                  className={"bg-primary2 text-black hover:bg-primary2/75"}
                >
                  Update Password
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                    setErrors({});
                  }}
                  disabled={saving}
                  className={"bg-white/10 text-white/90 hover:bg-white/5"}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/90">Two-Factor Authentication</h3>
              <p className="text-xs text-white/50">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                twoFactorEnabled 
                  ? 'bg-white/10 text-success' :'bg-white/10 text-white/75'
              }`}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <Button
                className={twoFactorEnabled ? "bg-red-700/75 text-white/90 hover:bg-red-700" : "bg-primary2 text-black hover:bg-primary2/75"}
                size="sm"
                iconName={twoFactorEnabled ? "Shield" : "ShieldCheck"}
                iconPosition="left"
                onClick={() => handleTwoFactorToggle(!twoFactorEnabled)}
                loading={saving}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
              </Button>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">Session Management</h3>
          
          <Checkbox
            label="Auto-logout inactive sessions"
            description={<span className='text-white/50'>Automatically log out after period of inactivity</span>}
            checked={sessionSettings?.logoutInactive}
            onChange={(e) => setSessionSettings(prev => ({ 
              ...prev, 
              logoutInactive: e?.target?.checked 
            }))}
            className="text-white/90"
          />

          {sessionSettings?.logoutInactive && (
            <div className="pl-6">
              <label className="text-sm text-white/90 mr-5">Inactive time (minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={sessionSettings?.inactiveTime}
                onChange={(e) => setSessionSettings(prev => ({ 
                  ...prev, 
                  inactiveTime: parseInt(e?.target?.value) 
                }))}
                className="w-24 mt-1 p-2 border border-white/10 rounded-md bg-dark2 text-white/75  "
              />
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">Active Sessions</h3>
          
          <div className="space-y-3">
            {activeSessions?.map((session) => (
              <div key={session?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="Monitor" size={16} className="text-primary2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      {session?.device}
                      {session?.current && (
                        <span className="ml-2 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/75">
                      {session?.location} • {session?.lastActive}
                    </p>
                  </div>
                </div>
                
                {!session?.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="LogOut"
                    onClick={() => handleLogoutDevice(session?.id)}
                    className="text-white/90 hover:bg-dark2"
                  >
                    Logout
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="destructive"
            size="sm"
            iconName="LogOut"
            iconPosition="left"
            onClick={() => {/* Handle logout all other sessions */}}
            className={"bg-red-700/75 hover:bg-red-700"}
          >
            Logout All Other Sessions
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-dark2 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Shield" size={16} className="text-primary2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/75 font-medium">Security Notice</p>
              <p className="text-xs text-white/75 mt-1">
                We use industry-standard encryption to protect your data. Your messages are encrypted end-to-end and we never store your passwords in plain text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
