import React from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values) => {
    const { email, password } = values;
    const result = await login(email, password);

    if (result.success) {
      message.success("Đăng nhập thành công!");
      navigate(from, { replace: true });
    } else {
      message.error("Đăng nhập thất bại: " + result.error);
    }
  };

  return (
    <Card
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#2f80ed",
        }}
      >
        Login
      </h2>
      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        style={{
          marginTop: "20px",
        }}
      >
        <Form.Item
          label="Username"
          name="email"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <Typography.Paragraph style={{ textAlign: "center" }}>
          Forgot <Link to="/forgot-username">Username</Link>/
          <Link to="/forgot-password">Password</Link> ?
        </Typography.Paragraph>
        <Typography.Paragraph style={{ textAlign: "center" }}>
          Not registered? <Link to="/register">Create an account</Link>
        </Typography.Paragraph>
      </div>
    </Card>
  );
};

export default LoginPage;
