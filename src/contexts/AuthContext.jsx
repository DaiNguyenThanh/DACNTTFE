import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { loginAPI, verifyTokenAPI } from '../api/authApi';
const AuthContext = createContext();

const initialState = {
  isLoggedIn: false,
  user: null,
  token: localStorage.getItem('token') || null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        token: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra token khi khởi động
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await verifyTokenAPI(token);
          dispatch({
            type: 'LOGIN',
            payload: { user: response.user, token }
          });
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Verify token failed:', error.message);
        }
      }
    };
  
    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      // Gọi API login của bạn
      const response = await loginAPI({ email, password });
      localStorage.setItem('token', response.token);
      
      dispatch({
        type: 'LOGIN',
        payload: { user: response.user, token: response.token }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
