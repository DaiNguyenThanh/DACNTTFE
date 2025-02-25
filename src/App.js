import React from 'react';



import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceProvider';
//import { UserProvider } from './contexts/UserContext';
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
import ErrorPage from './pages/Error';
import ForgotPassword from './pages/ForgotPassword'
import VertifyOtpPasswordPage from './pages/VertifyOtpPassword';
import ResetPassword from './pages/ResetPassword';
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
          {/* <UserProvider > */}
            <ConfigProvider theme={theme}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route path={path.WORKSPACE + "/:workspaceId"} element={<MainBoard />} />
                  <Route path={path.WORKSPACE + "/:workspaceId" +path.Task + "/:taskID"} element={<MainBoard />} />
                  <Route path={path.DASHBOARD} element={<Dashboard />} />
                  <Route index path={path.HOME} element={<Home />} />
                  <Route path={path.CONFIGRRATION} element={<Configration />} />
                  <Route path={path.REQUEST +"/:id"} element={<RequestPage />} />
                  <Route path={path.REQUEST} element={<RequestPage />} />
                </Route>
                <Route path={path.LOGIN} element={<LoginPage />} />
                <Route path={path.REGISTER} element={<RegisterPage />} />
                <Route path={path.VERIFY_OTP} element={<VerifyOtpPage />} />
                <Route path={path.FORGOT_PASSWORD} element={<ForgotPassword />} />
                <Route path={path.VERIFY_OTP_PASSWORD} element={<VertifyOtpPasswordPage />} />
                <Route path={path.RESETPASSWORD} element={<ResetPassword />} />
                <Route path={path.ERROR} element={<ErrorPage />} />
              </Routes>
            </ConfigProvider>
          {/* </UserProvider> */}
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;