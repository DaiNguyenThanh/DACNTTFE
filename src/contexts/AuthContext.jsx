import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginAPI, getUserInfoAPI, sendOtpAPI } from '../api/authApi';
import { path } from '../utils';
import { message } from 'antd';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(async () => {
    const checkAuth = async () => {
      try {
        if (location.pathname == path.REGISTER || location.pathname == path.VERIFY_OTP) {
          return;
        }
        const token = localStorage.getItem('token');

        if (!token) {
          navigate(path.LOGIN);
          return;
        }

        const userInfo = await getUserInfoAPI();
        if (userInfo.success) {
          setUser(userInfo.data.data);

          if (userInfo.data.data.verified == false) {
            const otpResult = await sendOtpAPI({ email: user.email });
            localStorage.setItem('tempEmail', user.email)
            message.success('Account inactive, Please vertify.');
            navigate(path.VERIFY_OTP);
          }
        } else {
          localStorage.removeItem('token');
          navigate(path.LOGIN);
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate(path.LOGIN);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginAPI({ email, password });

      if (response.status = 200) {
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

  const reload = async () => {
    try {
      const userInfo = await getUserInfoAPI();
      if (userInfo.success) {
        setUser(userInfo.data.data);
      } else {
        throw new Error('Failed to reload user information');
      }
    } catch (error) {
      console.error('Error reloading user information:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    reload,
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
