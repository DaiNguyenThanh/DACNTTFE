import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    const { email, password } = values;
    const result = await login(email, password);
    
    if (result.success) {
      message.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } else {
      message.error('Đăng nhập thất bại: ' + result.error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '20px' }}>
      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="M���t khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
