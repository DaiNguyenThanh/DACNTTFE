import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { path } from '../utils';
import '../assets/css//Login.css';
import backgroundImage from '../assets/imgaes/background.png'
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { email, password } = values;

      if (!email || !password) {
        message.error('Please fill in all fields!');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        message.error('Invalid email format!');
        return;
      }

      const result = await login(email, password);

      if (result.success) {
        message.success('Login successful!');
        
        form.resetFields();
        
        setTimeout(() => {
          navigate(path.HOME);
        }, 500);
      } else {
        message.error(result.message || 'Login failed!');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className="login-form">
        <h2>Login</h2>
        <p>Welcome back! Please login to your account.</p>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Invalid email format!' }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>

          <div className="form-footer">
            <Link to="/forgot-password">Forgot Password?</Link>
            <div className="register-link">
              Don't have an account? <Link to={path.REGISTER}>Register now</Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
