import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
   
      {/* <BrowserRouter> */}
       
          <App />
      
      {/* </BrowserRouter> */}
 
  </React.StrictMode>
);
