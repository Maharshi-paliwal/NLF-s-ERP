// src/LoginForm.jsx - CLEANED VERSION (role removed)
import { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import axios from "axios";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ❌ Removed role validation
      if (!email || !password) {
        setError("Please fill in both fields");
        setLoading(false);
        return;
      }

      // 🔥 API CALL
      const response = await axios.post(
        "https://nlfs.in/erp/index.php/Api/login",
        { email, password }
      );

      const res = response.data;
      console.log("LOGIN RESPONSE:", res);

      // 🚨 Validation for correct API response (still needed!)
      if (!res || res.status !== "true" || res.success !== 1 || !res.data) {
        setError(res.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const user = res.data;

      // 🧠 Store session data
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userName", user?.name || email.split("@")[0]);
      sessionStorage.setItem("userId", user?.id);

      console.log("✅ Session stored successfully!");

      // 🔓 Call success callback (to navigate)
      onLoginSuccess();

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card className="login-card shadow-lg" style={{ width: "400px" }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/NLF.gif" width="300px" className="pb-3" alt="Logo" />
              <h5 className="fw-bold mb-2">ERP System</h5>
              <p className="text-muted">Please login to continue</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleLogin}>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-500">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-500">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </Form.Group>

              <Button
                className="add-customer-btn w-100 py-2"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginForm;
