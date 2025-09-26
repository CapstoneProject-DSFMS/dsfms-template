import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Key, Eye, EyeSlash } from 'react-bootstrap-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }


    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      // Check if response is ok first
      if (!response.ok) {
        if (response.status === 405) {
          setError('Reset password feature is not available on this server. Please contact support.');
        } else if (response.status === 404) {
          setError('Reset password endpoint not found. Please contact support.');
        } else if (response.status === 400) {
          setError('Invalid token or password. Please request a new reset link.');
        } else {
          setError(`Server error (${response.status}). Please try again later.`);
        }
        return;
      }

      // Try to parse JSON response
      try {
        await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        setError('Server returned invalid response. Please try again later.');
        return;
      }

      // Success case
      toast.success('Password has been reset successfully! You can now login with your new password.');
      navigate('/login');
      
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-secondary) 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0" style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(27, 60, 83, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ 
                    width: '60px', 
                    height: '60px',
                    background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-secondary) 100%)',
                    boxShadow: '0 4px 15px rgba(27, 60, 83, 0.3)'
                  }}>
                    <Key size={24} className="text-white" />
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: 'var(--bs-primary)' }}>Reset Password</h4>
                  <p className="text-muted">Enter your new password below</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--bs-primary)', fontWeight: '600' }}>New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        required
                        disabled={loading}
                        className="py-3 pe-5 border-0 rounded-3"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid var(--bs-neutral-200)',
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(27, 60, 83, 0.1)'
                        }}
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          border: 'none', 
                          background: 'none',
                          color: 'var(--bs-neutral-500)'
                        }}
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--bs-primary)', fontWeight: '600' }}>Confirm New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        required
                        disabled={loading}
                        className="py-3 pe-5 border-0 rounded-3"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid var(--bs-neutral-200)',
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(27, 60, 83, 0.1)'
                        }}
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ 
                          border: 'none', 
                          background: 'none',
                          color: 'var(--bs-neutral-500)'
                        }}
                      >
                        {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </Form.Group>


                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading || !formData.newPassword || !formData.confirmPassword}
                      className="py-3 fw-bold rounded-3"
                      style={{
                        background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-secondary) 100%)',
                        border: 'none',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 15px rgba(27, 60, 83, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(27, 60, 83, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(27, 60, 83, 0.3)';
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                      className="py-3 rounded-3"
                      style={{
                        border: '2px solid var(--bs-neutral-300)',
                        color: 'var(--bs-primary)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--bs-neutral-100)';
                        e.target.style.borderColor = 'var(--bs-primary)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.borderColor = 'var(--bs-neutral-300)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;
