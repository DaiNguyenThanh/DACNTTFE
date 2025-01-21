import React from 'react';



import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceProvider';
import { UserContext } from './contexts/UserContext';
import { ConfigProvider } from 'antd';
import MainLayout from './components/layout/MainLayout';

import { path } from './utils';
import PrivateRoute from './components/PrivateRoute';

import MainBoard from './pages/MainBoard';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import VerifyOtpPage from './pages/VerifyOtp';
import Configration from './pages/Configration';
import RequestPage from './pages/Request';
import './App.css'
import Dashboard from './pages/Dasboard';



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
        <WorkspaceProvider>
          <UserContext.Provider value={{}}>
            <ConfigProvider theme={theme}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route path={path.WORKSPACE} element={<MainBoard />} />
                  <Route path={path.DASHBOARD} element={<Dashboard />} />
                  <Route index path={path.HOME} element={<Home />} />
                  <Route path={path.CONFIGRRATION} element={<Configration />} />
                  <Route path={path.REQUEST} element={<RequestPage />} />
                </Route>
                <Route path={path.LOGIN} element={<LoginPage />} />
                <Route path={path.REGISTER} element={<RegisterPage />} />
                <Route path={path.VERIFY_OTP} element={<VerifyOtpPage />} />
              </Routes>
            </ConfigProvider>
          </UserContext.Provider>
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;