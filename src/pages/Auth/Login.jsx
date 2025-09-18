import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/admin";
    navigate(from, { replace: true });
    return null;
  }

  // Hardcoded credentials for demo
  const validCredentials = {
    "admin@dsfms.com": "admin123",
    "trainer@dsfms.com": "trainer123",
    "trainee@dsfms.com": "trainee123",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check credentials
      if (validCredentials[email] && validCredentials[email] === password) {
        // Set user data based on email
        const userRole = email.includes("admin")
          ? "ADMIN"
          : email.includes("trainer")
          ? "TRAINER"
          : "TRAINEE";

        const userData = {
          id: 1,
          email: email,
          fullName: email.includes("admin")
            ? "Admin User"
            : email.includes("trainer")
            ? "Trainer User"
            : "Trainee User",
          role: userRole,
          department: "IT",
          lastLogin: new Date().toISOString(),
        };

        // Set auth state
        setUser(userData);
        setIsAuthenticated(true);

        // Store in localStorage for persistence
        localStorage.setItem("authToken", "mock-token-" + Date.now());
        localStorage.setItem("user", JSON.stringify(userData));

        // Navigate to intended destination or admin dashboard
        const from = location.state?.from?.pathname || "/admin";
        navigate(from, { replace: true });
      } else {
        setError("Email or password is incorrect. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex position-relative overflow-hidden">
      {/* Background Image */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage: 'url("./login-background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(1px)",
          zIndex: -1,
        }}
      />

      {/* Overlay */}
      <div
        className="position-absolute w-100 h-100 bg-dark"
        style={{
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container fluid className="position-relative" style={{ zIndex: 1 }}>
        <Row className="min-vh-100">
          {/* Left Side - Promotional Content */}
          <Col
            lg={6}
            className="d-flex align-items-center justify-content-center p-5"
          >
            <div
              className="text-white text-start"
              style={{ maxWidth: "500px" }}
            >
              {/* Travel Icon with dashed line */}
              <div className="d-flex align-items-center mb-4">
                <div className="dashed-line me-3"></div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 16V14L13 9V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                    fill="white"
                  />
                </svg>
              </div>

              <h1
                className="display-4 fw-bold mb-4 custom-title"
                style={{ lineHeight: "1.1" }}
              >
                AVIATION
                <br />
                ACADEMY
              </h1>
              <p className="fs-5 mb-3" style={{ opacity: 0.9 }}>
                Where Your Dream Destinations Become Reality.
              </p>
              <p className="fs-6" style={{ opacity: 0.8 }}>
                Embark on a journey where every corner of the world is within
                your reach.
              </p>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col
            lg={6}
            className="d-flex align-items-center justify-content-center p-5"
          >
            <div
              className="w-100"
              style={{
                maxWidth: "400px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                padding: "2.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Liquid glass gradient overlays */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "20%",
                  left: "-50%",
                  width: "200%",
                  height: "60%",
                  background:
                    "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
                  transform: "rotate(-15deg)",
                  zIndex: 0,
                }}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                {error && (
                  <Alert variant="danger" className="py-2 mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label
                      className="text-white fw-medium"
                      style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
                    >
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-white border-0 rounded-3 py-3"
                      style={{ fontSize: "1rem" }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label
                      className="text-white fw-medium"
                      style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
                    >
                      Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="bg-white border-0 rounded-3 py-3 pe-5"
                        style={{ fontSize: "1rem" }}
                        required
                      />
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowPassword((v) => !v)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setShowPassword((v) => !v);
                        }}
                        aria-label="Toggle password visibility"
                        className="position-absolute top-50 translate-middle-y end-0 me-3 d-flex align-items-center justify-content-center"
                        style={{ width: 24, height: 24, cursor: "pointer" }}
                      >
                        {showPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: "block", margin: "auto" }}
                          >
                            <path
                              d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                              stroke="#6b7280"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              stroke="#6b7280"
                              strokeWidth="1.5"
                            />
                            <line
                              x1="3"
                              y1="3"
                              x2="21"
                              y2="21"
                              stroke="#6b7280"
                              strokeWidth="1.5"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: "block", margin: "auto" }}
                          >
                            <path
                              d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                              stroke="#6b7280"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              stroke="#6b7280"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                      </span>
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-4 fw-bold rounded-3 mb-3"
                    style={{
                      fontSize: "1.1rem",
                    }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-2" /> Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center mb-2">
                    <a
                      href="#"
                      className="text-decoration-none fw-semibold px-2"
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(201, 212, 229, 0.8)",
                        boxShadow: "none",
                        textShadow: "none",
                        cursor: "pointer",
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  <div className="text-center mb-4">
                    <div className="d-flex align-items-center">
                      <hr
                        className="flex-grow-1"
                        style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                      />
                      <hr
                        className="flex-grow-1"
                        style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                      />
                    </div>
                  </div>

                  {/* Demo credentials info */}
                  <div className="text-center">
                    <small className="text-white-50 d-block mb-2">
                      Demo Accounts:
                    </small>
                    <div className="text-white-50 small">
                      <div>Admin: admin@dsfms.com / admin123</div>
                      <div>Trainer: trainer@dsfms.com / trainer123</div>
                      <div>Trainee: trainee@dsfms.com / trainee123</div>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Custom Styles */}
      <style>{`
        .dashed-line {
          width: 60px;
          height: 2px;
          background: repeating-linear-gradient(
            to right,
            white 0px,
            white 8px,
            transparent 8px,
            transparent 16px
          );
        }
      `}</style>
    </div>
  );
}

export default Login;
