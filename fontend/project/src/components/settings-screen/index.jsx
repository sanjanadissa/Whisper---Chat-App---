import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ProfileImageSection from './components/ProfileImageSection';
import ProfileForm from './components/ProfileForm';
import StatusSettings from './components/StatusSettings';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'status', label: 'Status & Privacy', icon: 'Eye' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' }
  ];

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSave = (profileData) => {
    console.log('Profile saved:', profileData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleImageChange = (file) => {
    console.log('Profile image changed:', file);
  };

  const handleStatusChange = (statusSettings) => {
    console.log('Status settings changed:', statusSettings);
  };

  const handleNotificationChange = (notificationSettings) => {
    console.log('Notification settings changed:', notificationSettings);
  };

  const handleSecurityChange = (securitySettings) => {
    console.log('Security settings changed:', securitySettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfileImageSection 
              onImageChange={handleImageChange}
            />
            <ProfileForm 
              onSave={handleProfileSave}
            />
          </div>
        );
      case 'status':
        return (
          <StatusSettings 
            onSettingsChange={handleStatusChange}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings 
            onSettingsChange={handleNotificationChange}
          />
        );
      case 'security':
        return (
          <SecuritySettings 
            onSecurityChange={handleSecurityChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-darkbg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-darkbg border-b border-chatbg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                iconName="ArrowLeft"
                onClick={handleBackToChat}
                className="text-gray-300 hover:text-white"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-300">Settings</h1>
                <p className="text-sm text-gray-400">Manage your account and preferences</p>
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-md">
                <Icon name="Check" size={16} className="text-success" />
                <span className="text-sm text-success">Settings saved successfully</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-chatbg rounded-lg border border-dark2 p-2">
              <nav className="space-y-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md micro-animation
                      ${activeTab === tab?.id
                        ? 'bg-primary2 text-black'
                        : 'text-white/90  hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon 
                      name={tab?.icon} 
                      size={18} 
                      className={activeTab === tab?.id ? 'text-black' : 'text-white/75'} 
                    />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-chatbg rounded-lg border border-dark2 p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  iconName="Download"
                  iconPosition="left"
                  className="justify-start text-white/90"
                >
                  Export Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  iconName="HelpCircle"
                  iconPosition="left"
                  className="justify-start text-white/90"
                >
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  iconName="LogOut"
                  iconPosition="left"
                  className="justify-start text-white/90 bg-red-700/85 hover:bg-red-700"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden mb-6">
              <div className="bg-black rounded-lg border border-border p-1">
                <div className="grid grid-cols-2 gap-1">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`
                        flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md micro-animation
                        ${activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <Icon 
                        name={tab?.icon} 
                        size={16} 
                        className={activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'} 
                      />
                      <span className="hidden sm:inline">{tab?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-dark2 bg-chatbg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary2 rounded-md flex items-center justify-center">
                  <Icon name="MessageCircle" size={14} color="white" />
                </div>
                <span className="text-sm font-medium text-white/75">Whisper</span>
                <span className="text-sm text-white/75">v0.1.0</span>
              </div>
              
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-white/75">
              <button className="hover:text-white micro-animation">Privacy Policy</button>
              <button className="hover:text-white micro-animation">Terms of Service</button>
              <span>© {new Date()?.getFullYear()} Whisper</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;