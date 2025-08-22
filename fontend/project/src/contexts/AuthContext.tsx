import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (email: string, otp: string) => Promise<void>;
  register: (userData: any, otp: string) => Promise<void>;
  sendLoginOtp: (email: string) => Promise<void>;
  sendRegistrationOtp: (email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Check for existing token on app load and validate it
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("authToken");

      if (savedToken) {
        setToken(savedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

        // Validate the token
        const isValid = await validateToken();
        if (isValid) {
          setIsAuthenticated(true);
          // Fetch user data
          try {
            const response = await axios.get("http://localhost:8080/auth/me");
            setUser(response.data);
          } catch (error) {
            console.error("Error fetching user data:", error);
            logout(); // Clear invalid token
          }
        } else {
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Effect to track user activity and send heartbeat
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Function to update online status
    const updateOnlineStatus = async () => {
      try {
        await axios.post("http://localhost:8080/user/heartbeat", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };

    // Update online status immediately
    updateOnlineStatus();

    // Set up interval to update online status every 2 minutes
    const heartbeatInterval = setInterval(updateOnlineStatus, 2 * 60 * 1000);

    // Set up activity listeners to reset online status
    const handleActivity = () => {
      updateOnlineStatus();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(heartbeatInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, token]);

  const validateToken = async (): Promise<boolean> => {
    try {
      const response = await axios.get("http://localhost:8080/auth/me");
      return response.status === 200;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  const sendLoginOtp = async (email: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/auth/send-login-otp",
        {
          email: email,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending login OTP:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendRegistrationOtp = async (email: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/auth/send-registration-otp",
        {
          email: email,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending registration OTP:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email: email,
        otp: otp,
      });

      const { token: authToken } = response.data;

      // Always save token to localStorage (automatic remember me)
      localStorage.setItem("authToken", authToken);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      setToken(authToken);
      setIsAuthenticated(true);

      // Fetch user data
      const userResponse = await axios.get("http://localhost:8080/auth/me");
      setUser(userResponse.data);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, otp: string) => {
    setLoading(true);
    try {
      console.log("Sending registration data to backend:", {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        profileImageUrl: userData.profileImageUrl,
        userName: userData.username,
        fullname: userData.fullName,
        discription: userData.description,
        otp: otp,
      });

      const response = await axios.post("http://localhost:8080/auth/register", {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        profileImageUrl: userData.profileImageUrl,
        userName: userData.username, // Frontend uses 'username', backend expects 'userName'
        fullname: userData.fullName, // Frontend uses 'fullName', backend expects 'fullname'
        discription: userData.description,
        otp: otp,
      });

      console.log("Registration response:", response.data);
      console.log("Registration response status:", response.status);

      // Save the token after successful registration
      const { token: authToken } = response.data;
      if (authToken) {
        localStorage.setItem("authToken", authToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        setToken(authToken);
        console.log(
          "Token saved after registration:",
          authToken.substring(0, 20) + "..."
        );
      }

      // After successful registration, redirect to login
      // The user will need to login with their credentials
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Call the logout endpoint to update online status
    if (token) {
      axios
        .post("http://localhost:8080/auth/logout", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .catch((error) => {
          console.error("Error during logout API call:", error);
        });
    }

    localStorage.removeItem("authToken");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    user,
    login,
    register,
    sendLoginOtp,
    sendRegistrationOtp,
    logout,
    loading,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
