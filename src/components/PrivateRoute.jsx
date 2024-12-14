import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null; // Kiểm tra xem có token không
  const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
  const role = user ? user.role : null; // Lấy role
 
  return (
    isAuthenticated && role === 'admin' ? (
      children // Render children nếu là admin
    ) : (
      <Navigate to="/login" /> // Chuyển hướng đến trang đăng nhập nếu không phải admin
    )
  );
};

export default PrivateRoute;
