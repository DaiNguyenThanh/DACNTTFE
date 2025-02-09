import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { registerAPI, sendOtpAPI,ForgotPassword } from '../api/authApi';
import { path } from '../utils';
import '../assets/css/Register.css';
import backgroundImage from '../assets/imgaes/background.png'
const ResetPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { password, confirmPassword } = values;
      const email = localStorage.getItem('tempEmail');
      // Check confirm password
      if (password !== confirmPassword) {
        message.error('Passwords do not match!');
        return;
      }

      // Validate data
      if (!confirmPassword || !password) {
        message.error('Please fill in all fields!');
        return;
      }

      // Validate email format
    

      // Validate password length
      if (password.length < 6) {
        message.error('Password must be at least 6 characters!');
        return;
      }
      // Kiểm tra chữ hoa
      if (!/[A-Z]/.test(password)) {
        message.error('Password must contain at least one uppercase letter!');
        return;
      }

      // Kiểm tra số
      if (!/[0-9]/.test(password)) {
        message.error('Password must contain at least one number!');
        return;
      }

      // Kiểm tra ký tự đặc biệt
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        message.error('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)!');
        return;
      }
      // Call register API
      const result = await ForgotPassword({
        email:email,
        new_password:password
        
      });
      console.log(result)

      if (result.message === "Success") {
        //const otpResult = await sendOtpAPI({ email });
        localStorage.setItem('tempEmail', "")
        message.success('Reset password successfully! Please login again.');

        // Reset form
        //form.resetFields();

        // Redirect to login page
        setTimeout(() => {
          navigate(path.LOGIN);
        }, 1500);
      } else {

        message.error(result.message || 'Reset failed!');
      }

    } catch (error) {
      console.error('Register error:', error);
      message.error(error.message || 'Reset failed!');
    } finally {
      setLoading(false);
    }
  };

  return (



    <div className="register-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="register-form">
        <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Reset Password</h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
        

          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
              {
                pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/, 
                message: 'Password must contain at least one uppercase letter, one number, and one special character!'
              }
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              {loading ? 'Processing...' : 'Done'}
            </Button>
          </Form.Item>

          {/* <div style={{ textAlign: 'center' }}>
            Already have an account? {' '}
            <a onClick={() => navigate(path.LOGIN)}>
              Login now
            </a>
          </div> */}
        </Form>
      </div>
    </div>

  );
};

export default ResetPassword;
