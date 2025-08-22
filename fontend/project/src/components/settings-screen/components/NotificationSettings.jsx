import React, { useState } from 'react';
import Button from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import Select from '../../ui/Select';
import Icon from '../../AppIcon';

const NotificationSettings = ({ 
  initialSettings = {
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    messagePreview: true,
    groupNotifications: true,
    mentionNotifications: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
    notificationSound: 'default'
  },
  onSettingsChange,
  className = ''
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const soundOptions = [
    { value: 'default', label: 'Default' },
    { value: 'chime', label: 'Chime' },
    { value: 'bell', label: 'Bell' },
    { value: 'pop', label: 'Pop' },
    { value: 'none', label: 'None' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    } catch (err) {
      console.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is how your notifications will appear.',
        icon: '/favicon.ico'
      });
    } else {
      alert('Test notification: This is how your notifications will appear.');
    }
  };

  return (
    <div className={`bg-chatbg rounded-lg p-6 border border-dark2 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/90">Notifications</h2>
        {hasChanges && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            loading={saving}
            className="bg-primary2 text-black hover:bg-primary2/75"
          >
            Save Changes
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {/* General Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">General</h3>
          
          <Checkbox
            className="text-white/90"
            label="Email notifications"
            description={
              <span className="text-white/50">Receive notifications via email</span>}
            checked={settings?.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e?.target?.checked)}
          />

          <Checkbox
            className="text-white/90"
            label="Push notifications"
            description={
              <span className="text-white/50">"Receive push notifications in your browser"</span>}
            checked={settings?.pushNotifications}
            onChange={(e) => handleSettingChange('pushNotifications', e?.target?.checked)}
          />

          <Checkbox
            className="text-white/90"
            label="Sound notifications"
            description={
              <span className="text-white/50">"Play sound when receiving messages"</span>}
            checked={settings?.soundEnabled}
            onChange={(e) => handleSettingChange('soundEnabled', e?.target?.checked)}
          />

          <Checkbox
            className="text-white/90"
            label="Message preview"
            description={
              <span className="text-white/50">"Show message content in notifications"</span>}
            checked={settings?.messagePreview}
            onChange={(e) => handleSettingChange('messagePreview', e?.target?.checked)}
          />
        </div>

        {/* Message Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">Message Types</h3>
          
          <Checkbox
            label="Group messages"
            description={
              <span className="text-white/50">Notifications for group conversations</span>}
            checked={settings?.groupNotifications}
            onChange={(e) => handleSettingChange('groupNotifications', e?.target?.checked)}
            className="text-white/90"
          />

          <Checkbox
            label="Mentions only"
            description={
              <span className="text-white/50">Only notify when you're mentioned in groups</span>}
            checked={settings?.mentionNotifications}
            onChange={(e) => handleSettingChange('mentionNotifications', e?.target?.checked)}
            className="text-white/90"
          />
        </div>

        {/* Sound Settings */}
        {settings?.soundEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90">Sound Settings</h3>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Select
                  label="Notification sound"
                  options={soundOptions}
                  value={settings?.notificationSound}
                  onChange={(value) => handleSettingChange('notificationSound', value)}
                  className="text-white/90"
                />
              </div>
              <Button
                size="sm"
                iconName="Volume2"
                onClick={testNotification}
                className="mt-6 bg-primary2 text-black hover:bg-primary2/75"
              >
                Test
              </Button>
            </div>
          </div>
        )}

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/90">Quiet Hours</h3>
            <Checkbox
              checked={settings?.quietHours}
              onChange={(e) => handleSettingChange('quietHours', e?.target?.checked)}
            />
          </div>
          
          {settings?.quietHours && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <label className="text-sm text-white/90">Start time</label>
                <input
                  type="time"
                  value={settings?.quietStart}
                  onChange={(e) => handleSettingChange('quietStart', e?.target?.value)}
                  className="w-full mt-1 p-1 border border-white/10 rounded-md bg-dark2 text-white/90 focus:border-white/10 focus:ring-1 focus:ring-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-white/90">End time</label>
                <input
                  type="time"
                  value={settings?.quietEnd}
                  onChange={(e) => handleSettingChange('quietEnd', e?.target?.value)}
                  className="w-full mt-1 p-1 border border-white/10 rounded-md bg-dark2 text-white/90 focus:ring-1 focus:ring-white/10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Permission Status */}
        <div className="p-3 bg-muted/50 rounded-md">
          <div className="flex items-center space-x-2">
            <Icon name="Bell" size={16} className="text-white/90" />
            <div>
              <p className="text-sm font-medium text-white/90">Browser Permissions</p>
              <p className="text-xs text-white/50">
                {typeof window !== 'undefined' && 'Notification' in window 
                  ? Notification.permission === 'granted' 
                    ? 'Notifications are enabled' 
                    : 'Click to enable browser notifications' 
                  : 'Notifications not supported'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Test Notification */}
        <div className="flex justify-center">
          <Button
            iconName="Bell"
            iconPosition="left"
            onClick={testNotification}
            className={"bg-primary2 text-black hover:bg-primary2/75"}
          >
            Send Test Notification
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
