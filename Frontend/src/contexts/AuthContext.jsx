import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} [profilePicture]
 * @property {string} [department]
 * @property {string} [degree]
 * @property {number} [year]
 * @property {number} [passoutYear]
 * @property {string} [linkedinProfile]
 * @property {string} [studentIdCard]
 * @property {string} [position]
 * @property {string} [aictcNumber]
 * @property {string} [facultyIdCard]
 * @property {string} [grade]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {boolean} loading
 * @property {(email: string, password: string) => Promise<{success: boolean, error?: string}>} login
 * @property {(formData: FormData) => Promise<{success: boolean, error?: string}>} register
 * @property {() => Promise<void>} logout
 * @property {(formData: FormData) => Promise<{success: boolean, error?: string}>} updateProfile
 */

/** @type {AuthContextType} */
const defaultContext = {
  user: null,
  loading: true,
  login: () => Promise.resolve({ success: false }),
  register: () => Promise.resolve({ success: false }),
  logout: () => Promise.resolve(),
  updateProfile: () => Promise.resolve({ success: false })
};

const AuthContext = createContext(defaultContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/status', {
        withCredentials: true
      });
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });
      setUser(response.data.user);
      
      // Admin users are directed to the admin panel
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
        return { success: true };
      }
      
      // For regular users, check enrollment status and navigate accordingly
      try {
        const enrollmentResponse = await axios.get('http://localhost:8080/api/enrollment/my-colleges', {
          withCredentials: true
        });
        
        if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
          navigate('/my-hub');
        } else {
          navigate('/colleges');
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
        navigate('/colleges');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error
      };
    }
  };

  /**
   * @param {FormData} formData
   */
  const register = async (formData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      // Instead of setting user and navigating to profile, just navigate to login
      navigate('/auth?mode=login');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8080/api/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * @param {FormData} formData
   */
  const updateProfile = async (formData) => {
    try {
      const response = await axios.put('http://localhost:8080/api/profile/update', formData, {
        withCredentials: true
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Failed to update profile. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed. Please try again.' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext; 