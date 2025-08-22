declare module '*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module './components/login-screen/index.jsx' {
  import React from 'react';
  const LoginScreen: React.ComponentType<any>;
  export default LoginScreen;
}

declare module './components/registration-screen/index.jsx' {
  import React from 'react';
  const RegistrationScreen: React.ComponentType<any>;
  export default RegistrationScreen;
}

declare module './components/settings-screen/index.jsx' {
  import React from 'react';
  const SettingsScreen: React.ComponentType<any>;
  export default SettingsScreen;
} 