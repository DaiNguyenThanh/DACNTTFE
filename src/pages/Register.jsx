import React from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values) => {};

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
        Register
      </h2>
      <Form
        name="register-form"
        onFinish={onFinish}
        layout="vertical"
        style={{
          marginTop: "20px",
        }}
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true }]}
          style={{
            display: "inline-block",
            width: "calc(50% - 8px)",
          }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true }]}
          style={{
            display: "inline-block",
            width: "calc(50% - 8px)",
            margin: "0 8px",
          }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, min: 6 }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, min: 6 }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[{ required: true, min: 6 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              required: true,
              min: 10,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <Typography.Paragraph style={{ textAlign: "center" }}>
          Have an account? <Link to="/login">Sign in here</Link>
        </Typography.Paragraph>
      </div>
    </Card>
  );
};

export default RegisterPage;
