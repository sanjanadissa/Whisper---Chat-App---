import React from 'react';

function Image({
  src,
  alt = "",
  className = "",
  onError,
  ...props
}) {

  const handleError = (e) => {
    // Call custom onError if provided
    if (onError) {
      onError(e);
    } else {
      // Default fallback behavior
      e.target.style.display = 'none';
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

export default Image;
