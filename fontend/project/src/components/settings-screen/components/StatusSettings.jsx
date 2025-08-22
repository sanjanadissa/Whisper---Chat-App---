import React, { useState } from 'react';
import Button from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import Icon from '../../AppIcon';

const StatusSettings = ({ 
  initialSettings = {
    isOnline: true,
    showLastSeen: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    autoLogout: false
  },
  onSettingsChange,
  className = ''
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    } catch (err) {
      console.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getStatusText = () => {
    if (!settings?.isOnline) return 'Offline';
    return 'Online';
  };

  const getStatusColor = () => {
    if (!settings?.isOnline) return 'bg-muted';
    return 'bg-success';
  };

  const lastSeenTime = new Date(Date.now() - 300000)?.toLocaleString();

  return (
    <div className={`bg-chatbg text-white/90 rounded-lg p-6 border border-dark2 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Status & Privacy</h2>
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
        {/* Current Status Display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <div>
              <p className="text-sm font-medium text-white/90">{getStatusText()}</p>
              <p className="text-xs text-white/50">
                Last seen: {lastSeenTime}
              </p>
            </div>
          </div>
        </div>

        {/* Online Status Toggles */}
        <div className="space-y-4">
          <Checkbox
            label={<span className="text-white/90 ">Show as online</span>}
            description={
              <span className="text-white/50">Let others see when you're active</span>
            }
            checked={settings?.isOnline}
            onChange={(e) => handleSettingChange('isOnline', e?.target?.checked)}
          />

          <Checkbox
            label={<span className="text-white/90">Show last seen</span>}
            description={
              <span className="text-white/50">Allow others to see when you were last active</span>
            }
            checked={settings?.showLastSeen}
            onChange={(e) => handleSettingChange('showLastSeen', e?.target?.checked)}
          />

          <Checkbox
            label={<span className="text-white/90">Show online status</span>}
            description={
              <span className="text-white/50">Display your online/offline status to other users</span>
            }
            checked={settings?.showOnlineStatus}
            onChange={(e) => handleSettingChange('showOnlineStatus', e?.target?.checked)}
          />

          <Checkbox
            label={<span className="text-white/90">Allow direct messages</span>}
            description={
              <span className="text-white/50">Let other users send you direct messages</span>
            }
            checked={settings?.allowDirectMessages}
            onChange={(e) => handleSettingChange('allowDirectMessages', e?.target?.checked)}
          />

          {/* NEW Auto-logout Option */}
          <Checkbox
            label={<span className="text-white/90">Auto-logout inactive sessions</span>}
            description={
              <span className="text-white/50">Automatically log you out after a period of inactivity</span>
            }
            checked={settings?.autoLogout}
            onChange={(e) => handleSettingChange('autoLogout', e?.target?.checked)}
          />
        </div>

        {/* Status Presets */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/90">Quick Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button

              size="sm"
              iconName="Circle"
              iconPosition="left"
              onClick={() => {
                handleSettingChange('isOnline', true);
                handleSettingChange('showOnlineStatus', true);
              }}
              className="justify-start bg-dark2 text-white/90 hover:bg-primary2 hover:text-black"
            >
              <span className="w-2 h-2 bg-success rounded-full mr-2" />
              Available
            </Button>

            <Button
              size="sm"
              iconName="Clock"
              iconPosition="left"
              onClick={() => {
                handleSettingChange('isOnline', true);
                handleSettingChange('showOnlineStatus', true);
              }}
              className="justify-start bg-dark2 text-white/90 hover:bg-primary2 hover:text-black"
            >
              <span className="w-2 h-2 bg-warning rounded-full mr-2" />
              Away
            </Button>

            <Button
              size="sm"
              iconName="Moon"
              iconPosition="left"
              onClick={() => {
                handleSettingChange('isOnline', false);
                handleSettingChange('showOnlineStatus', false);
              }}
              className="justify-start bg-dark2 text-white/90 hover:bg-primary2 hover:text-black"
            >
              <span className="w-2 h-2 bg-muted rounded-full mr-2" />
              Do not disturb
            </Button>

            <Button
              size="sm"
              iconName="EyeOff"
              iconPosition="left"
              onClick={() => {
                handleSettingChange('isOnline', false);
                handleSettingChange('showOnlineStatus', false);
                handleSettingChange('showLastSeen', false);
              }}
              className="justify-start bg-dark2 text-white/90 hover:bg-primary2 hover:text-black"
            >
              <span className="w-2 h-2 bg-muted rounded-full mr-2" />
              Invisible
            </Button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-dark2 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary2 font-medium">Privacy Notice</p>
              <p className="text-xs text-white/90 mt-1">
                Your status and last seen information will only be visible to users you've interacted with or those in your contact list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusSettings;
