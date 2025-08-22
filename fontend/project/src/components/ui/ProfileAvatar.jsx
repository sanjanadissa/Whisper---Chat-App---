import React, { useMemo } from 'react';

const ProfileAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallbackText = '',
  showOnlineStatus = false,
  isOnline = false
}) => {
  // Generate consistent color based on text
  const backgroundColor = useMemo(() => {
    if (!fallbackText) return '#6B7280';
    
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#F97316', '#06B6D4',
      '#84CC16', '#F43F5E', '#A855F7', '#14B8A6'
    ];
    
    const hash = fallbackText.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }, [fallbackText]);

  // Get initials from text
  const initials = useMemo(() => {
    if (!fallbackText) return '?';
    
    // Check if the text looks like a phone number (contains only digits, spaces, dashes, plus)
    const isPhoneNumber = /^[\d\s\-\+\(\)]+$/.test(fallbackText.trim());
    
    if (isPhoneNumber) {
      return null; // Return null to indicate we should show a person icon
    }
    
    return fallbackText
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [fallbackText]);

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Check if image is valid
  const hasValidImage = src && src !== 'null' && src !== 'undefined' && src !== '';

  return (
    <div className={`relative inline-block ${className}`}>
      {hasValidImage ? (
        // Show profile image
        <img
          src={src}
          alt={alt || 'Profile'}
          className={`${sizeClass} rounded-full object-cover border-2 border-gray-700`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
             {/* Fallback initials or person icon */}
       <div
         className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white border-2 border-gray-700 ${
           hasValidImage ? 'hidden' : 'block'
         }`}
         style={{ backgroundColor }}
       >
         {initials ? (
           initials
         ) : (
           <svg
             className="w-1/2 h-1/2"
             fill="currentColor"
             viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg"
           >
             <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
           </svg>
         )}
       </div>

      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${
          isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      )}
    </div>
  );
};

export default ProfileAvatar;
