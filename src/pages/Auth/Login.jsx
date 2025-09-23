import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

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

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Navigate to intended destination or admin dashboard
        const from = location.state?.from?.pathname || "/admin";
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Email or password is incorrect. Please try again.");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
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
          {/* Left Side - Promotional Content (Desktop) */}
          <Col
            lg={6}
            className="d-flex align-items-center justify-content-center p-5 d-none d-lg-flex"
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
            xs={12}
            className="d-flex align-items-center justify-content-center p-3 p-lg-5"
          >
            <div
              className="w-100 login-form-container"
              style={{
                maxWidth: "400px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                padding: "2rem",
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
                {/* Mobile/Tablet Title - Only visible on small screens */}
                <div className="text-center mb-4 d-lg-none">
                  {/* Travel Icon */}
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div className="dashed-line me-3"></div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 16V14L13 9V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                        fill="white"
                      />
                    </svg>
                    <div className="dashed-line ms-3"></div>
                  </div>

                  <h1
                    className="text-white fw-bold mb-2 mobile-title"
                    style={{ 
                      lineHeight: "1.1",
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    AVIATION
                    <br />
                    ACADEMY
                  </h1>
                  <p 
                    className="text-white mb-2 mobile-subtitle" 
                    style={{ 
                      opacity: 0.9,
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    Where Your Dream Destinations Become Reality.
                  </p>
                  <p 
                    className="text-white-50 mobile-description" 
                    style={{ 
                      opacity: 0.8
                    }}
                  >
                    Embark on a journey where every corner of the world is within your reach.
                  </p>
                </div>


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
                      Test Credentials:
                    </small>
                    <div className="text-white-50 small">
                      <div>Admin: michael.brown@admin.com / Admin@123</div>
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
        
        /* Mobile responsive styles */
        .mobile-title {
          font-size: 1.8rem;
        }
        
        .mobile-subtitle {
          font-size: 0.9rem;
        }
        
        .mobile-description {
          font-size: 0.75rem;
        }
        
        /* Tablet styles */
        @media (min-width: 576px) and (max-width: 991.98px) {
          .mobile-title {
            font-size: 2.2rem;
          }
          
          .mobile-subtitle {
            font-size: 1rem;
          }
          
          .mobile-description {
            font-size: 0.85rem;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 575.98px) {
          .dashed-line {
            width: 40px;
          }
          
          .login-form-container {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
