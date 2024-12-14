import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { verifyOtpAPI, sendOtpAPI } from "../api/authApi";
import { path } from "../utils";
import "../assets/css//VerifyOtp.css";
import backgroundImage from '../assets/imgaes/background.png'
const { Text } = Typography;
const COUNTDOWN_TIME = 5 * 60; // 5 minutes in seconds

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      // Khi hết thời gian
      message.error("OTP has expired! Please register again.");
      localStorage.removeItem('tempEmail');
      navigate(path.REGISTER);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, navigate]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const email = "daiqbn@gmail.com"//localStorage.getItem('tempEmail');
     
      if (!email) {
        message.error("Email not found. Please register again.");
        navigate(path.REGISTER);
        return;
      }

      const result = await sendOtpAPI({ email});
      
      if (result.status=200) {
        message.success("New OTP has been sent to your email!");
        // Reset countdown khi gửi lại OTP mới
        setCountdown(COUNTDOWN_TIME);
      } else {
        message.error(result.message || "Failed to resend OTP!");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      message.error(error.message || "Failed to resend OTP!");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { otp } = values;

      const result = await verifyOtpAPI({ 
        otp,
        email:localStorage.getItem('tempEmail'),
        is_verify_email:true

      });

      if (result.status=200) {
        message.success("Email verification successful!");
        localStorage.removeItem('tempEmail');
        setTimeout(() => {
          navigate(path.LOGIN);
        }, 1500);
      } else {
        message.error(result.message || "Verification failed!");
      }
    } catch (error) {
      console.error('Verify error:', error);
      message.error(error.message || "Verification failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container" style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className="verify-form">
        <h2>Verify OTP</h2>
        <p>Please enter the 6-digit code sent to your email</p>
        
        <div className="countdown-timer">
          Time remaining: <Text strong type="warning">{formatTime(countdown)}</Text>
        </div>

        <Form
          name="otp-form"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: "Please enter OTP code!" },
              { len: 6, message: "OTP must be 6 digits!" },
              { pattern: /^[0-9]{6}$/, message: "OTP must contain only numbers!" }
            ]}
          >
            <Input.OTP
              length={6}
              autoFocus
              inputType="numeric"
              className="otp-input"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </Form.Item>

          <div className="resend-section">
            <Button 
              type="link" 
              onClick={handleResendOtp}
              disabled={loading}
            >
              Didn't receive the code? Resend
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
