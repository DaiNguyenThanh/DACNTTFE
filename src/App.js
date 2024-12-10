

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './contexts/AuthContext';

import { path } from './utils';
import PrivateRoute from './components/PrivateRoute';



import { ConfigProvider } from 'antd';
import Task from './pages/Task';




const App = () => {
  const theme = {
    token: {
      colorPrimary: '#1DA57A', // Primary color
      borderRadius: 8, // Global border radius
      colorLink: '#1DA57A', // Link color
      fontSizeBase: '14px', // Base font size
      colorSuccess: '#52c41a', // Success color
      colorWarning: '#faad14', // Warning color
      colorError: '#f5222d', // Error color
      colorText: '#333', // Default text color
      colorBackground: '#f0f2f5', // Default background color
    },
  };
  return (

    <AuthProvider>
      <ConfigProvider theme={theme}>
        {/* <Router history={reduxHistory}> */}
        <Router >
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index path={path.HOME} element={<Home />} />
              {/* <Route path={path.LOGIN} element={<LoginPage />} /> */}
              <Route  path={path.Task} element={<Task />} />
            </Route>
            <Route element={<PrivateRoute />}>
              {/* <Route path="/quan-ly" element={<Layout />}> */}
              {/* <Route path="" element={<PaymentPage />} /> */}

              {/* </Route> */}

            </Route>
            {/* Thêm các route vào bên dưới */}
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;