import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { path } from './utils';
import PrivateRoute from './components/PrivateRoute';
import { ConfigProvider } from 'antd';
import Task from './pages/Task';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import VerifyOtpPage from './pages/VerifyOtp';
import Configration from './pages/Configration'
import './App.css'
const App = () => {
  const theme = {
    token: {
      colorPrimary: '#2f80ed',
      borderRadius: 8,
      colorLink: '#2f80ed',
      fontSizeBase: '14px',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorText: '#333',
      colorBackground: '#f0f2f5',
    },
  };

  return (
    <Router>
      <AuthProvider>
        <ConfigProvider theme={theme}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route  path={path.Task} element={<Task />} />
              <Route  path={path.DASHBOARD} element={<PrivateRoute element={<Home />} />} />
              <Route index path={path.HOME} element={<Home />} />
              <Route  path={path.CONFIGRRATION} element={<Configration />} />
            </Route>

            <Route path={path.LOGIN} element={<LoginPage />} />
            <Route path={path.REGISTER} element={<RegisterPage />} />
            <Route path={path.VERIFY_OTP} element={<VerifyOtpPage />} />

          </Routes>
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;