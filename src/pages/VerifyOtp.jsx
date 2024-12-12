import React from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values) => {
    
  };

  return (
    <Card
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#2f80ed",
        }}
      >
        Verify OTP
      </h2>
      <Form
        name="otp-form"
        onFinish={onFinish}
        layout="vertical"
        style={{
          marginTop: "20px",
        }}
      >
        <Form.Item
          label="OTP"
          name="otp"
          rules={[{ required: true, min: 6, message: "Please enter OTP" }]}
        >
          <Input.OTP length={6} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Verify
          </Button>
        </Form.Item>
      </Form>
      <div
              style={{
                textAlign: "center",
              }}
            >
              <Typography.Paragraph style={{ textAlign: "center" }}>
                Not received the OTP? <Link>Resend</Link>
              </Typography.Paragraph>
            </div>
    </Card>
  );
};

export default VerifyOtpPage;
