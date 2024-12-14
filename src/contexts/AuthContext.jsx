import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI, getUserInfoAPI } from '../api/authApi';
import { path } from '../utils';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
       
        if (!token) {
          navigate(path.LOGIN);
         
          return;
        }

        const userInfo = await getUserInfoAPI();
        if (userInfo.success) {
          setUser(userInfo.data.data);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (email, password) => {
    try {   
      const response = await loginAPI({ email, password });
      
      if (response.status=200) {
        // Lưu token vào localStorage
        localStorage.setItem('token', response.data.access_token);
        // Gọi API lấy thông tin user
        const userInfo = await getUserInfoAPI();
        
        if (userInfo.success) {
          setUser(userInfo.data.data);
          localStorage.setItem('user', JSON.stringify(userInfo.data.data));
          return { success: true };
        } else {
          return { success: false, message: 'Failed to get user information' };
        }
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate(path.LOGIN)
  };

  const value = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
