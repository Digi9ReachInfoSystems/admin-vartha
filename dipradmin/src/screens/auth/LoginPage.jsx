import React, { useState } from "react";
import { Input, Button, Checkbox, Form, Typography, message } from "antd";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LoginWrapper } from "./LoginPage,styles.js";

const BaseUrl = import.meta.env.VITE_BASE_URL;
const { Title } = Typography;

function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${BaseUrl}/api/auth/login-with-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      return data;
    } catch (error) {
      message.error(error.message || "Login failed.");
      throw error;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const loginApiResponse = await loginUser(values.email, values.password);

      if (loginApiResponse && loginApiResponse.success) {
        const token = loginApiResponse.token;

        if (!token || typeof token !== "string") {
          throw new Error("Invalid token received");
        }

        localStorage.setItem("token", token);

        try {
          const decoded = jwtDecode(token);
          const role = decoded.role;

          if (!role) {
            throw new Error("Role not found in token");
          }

          localStorage.setItem("role", role);

          const userId =
            decoded.id ||
            decoded.userId ||
            loginApiResponse?.data?._id;
          if (userId) {
            localStorage.setItem("userId", String(userId));
          }

          const email =
            decoded.email ||
            loginApiResponse?.data?.email ||
            values.email;
          if (email) {
            localStorage.setItem("userEmail", String(email).toLowerCase());
          }

          message.success("Login successful!");

          if (role === "admin") navigate("/dashboard");
          else if (role === "moderator") navigate("/dashboard");
          else if (role === "content") navigate("/manage-articles");
          else navigate("/");
        } catch (decodeErr) {
          console.error("Token decode failed:", decodeErr);
          message.error("Failed to decode token");
        }
      } else {
        message.error(loginApiResponse?.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Login error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginWrapper>
      <div className="login-card page-fade">
        <div className="login-brand">
          <img src={Logo} alt="DIPR Logo" className="login-logo" />
          <p className="login-dept">Government of Karnataka · DIPR</p>
        </div>

        <Title level={3} className="login-title">
          Vartha Admin
        </Title>
        <p className="login-sub">Sign in to the Enterprise Content Management System</p>

        <Form name="login" layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="officer@karnataka.gov.in" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input
              size="large"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter password"
              suffix={
                passwordVisible ? (
                  <EyeOff
                    size={16}
                    style={{ cursor: "pointer", color: "#6B7280" }}
                    onClick={() => setPasswordVisible(false)}
                  />
                ) : (
                  <Eye
                    size={16}
                    style={{ cursor: "pointer", color: "#6B7280" }}
                    onClick={() => setPasswordVisible(true)}
                  />
                )
              }
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <p className="login-footer">
          Official use only · Department of Information & Public Relations
        </p>
      </div>
    </LoginWrapper>
  );
}

export default LoginPage;
