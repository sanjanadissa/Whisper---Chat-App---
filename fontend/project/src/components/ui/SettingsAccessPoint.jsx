import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const SettingsAccessPoint = ({ 
  user = { 
    name: 'John Doe', 
    email: 'john@example.com', 
    avatar: '/assets/images/avatar-placeholder.png',
    status: 'online'
  },
  className = '',
  variant = 'dropdown' // 'dropdown' | 'sidebar' | 'mobile'
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleSignOut = () => {
    // Handle sign out logic
    navigate('/login');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (variant === 'sidebar') {
    return (
      <div className={`p-4 border-t border-border ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <Image
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
              user?.status === 'online' ? 'bg-success' : 
              user?.status === 'away' ? 'bg-warning' : 'bg-muted'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            iconName="Settings"
            iconPosition="left"
            onClick={handleSettingsClick}
            className="justify-start"
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            iconName="LogOut"
            iconPosition="left"
            onClick={handleSignOut}
            className="justify-start text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center justify-between p-4 bg-card border-b border-border ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card ${
              user?.status === 'online' ? 'bg-success' : 
              user?.status === 'away' ? 'bg-warning' : 'bg-muted'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {user?.name}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="Settings"
          onClick={handleSettingsClick}
        />
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted micro-animation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="relative">
          <Image
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card ${
            user?.status === 'online' ? 'bg-success' : 
            user?.status === 'away' ? 'bg-warning' : 'bg-muted'
          }`} />
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-muted-foreground micro-animation ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-20 animate-fade-in">
            {/* User Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-popover ${
                    user?.status === 'online' ? 'bg-success' : 
                    user?.status === 'away' ? 'bg-warning' : 'bg-muted'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-popover-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      user?.status === 'online' ? 'bg-success' : 
                      user?.status === 'away' ? 'bg-warning' : 'bg-muted'
                    }`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md micro-animation"
              >
                <Icon name="Settings" size={16} />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => {/* Handle status change */}}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md micro-animation"
              >
                <Icon name="Circle" size={16} />
                <span>Change status</span>
              </button>
              
              <div className="border-t border-border my-2" />
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md micro-animation"
              >
                <Icon name="LogOut" size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsAccessPoint;