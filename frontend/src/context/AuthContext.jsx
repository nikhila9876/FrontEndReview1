import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check token and fetch latest user info on mount
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const { data } = await api.get('/auth/me');
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  /**
   * Register new user (Initiates OTP email verification)
   */
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return {
        success: true,
        message: response.data.message || 'Verification code sent to your email',
        email: response.data.email || email,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please check your details.';
      return {
        success: false,
        message,
      };
    }
  };

  /**
   * Verify OTP code
   */
  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { token: receivedToken, user: receivedUser } = response.data;

      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
      }
      if (receivedUser) {
        localStorage.setItem('user', JSON.stringify(receivedUser));
        setUser(receivedUser);
      }

      return {
        success: true,
        message: response.data.message || 'Email verified successfully',
        data: response.data,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'OTP verification failed. Please try again.';
      return { success: false, message };
    }
  };

  /**
   * Resend OTP code
   */
  const resendOtp = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return {
        success: true,
        message: response.data.message || 'A new verification code has been sent',
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to resend verification code';
      const remainingSeconds = error.response?.data?.remainingSeconds;
      return {
        success: false,
        message,
        remainingSeconds,
      };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
      }
      if (receivedUser) {
        localStorage.setItem('user', JSON.stringify(receivedUser));
        setUser(receivedUser);
      }

      return {
        success: true,
        message: response.data.message || 'Login successful',
        data: response.data,
      };
    } catch (error) {
      const data = error.response?.data;
      const message =
        data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      const isEmailVerified = data?.isEmailVerified !== undefined ? data.isEmailVerified : true;
      return {
        success: false,
        message,
        isEmailVerified,
        email: data?.email || email,
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        register,
        verifyOtp,
        resendOtp,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
