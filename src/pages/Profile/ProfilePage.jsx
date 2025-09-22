import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { Person, Camera, Key, Save, Eye, EyeSlash } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);

  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Password Reset Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update personalInfo when user data is available
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlert({
        show: true,
        message: 'Personal information updated successfully!',
        variant: 'success'
      });
    } catch (error) {
      setAlert({
        show: true,
        message: 'Failed to update personal information. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        show: true,
        message: 'New password and confirm password do not match.',
        variant: 'danger'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setAlert({
        show: true,
        message: 'New password must be at least 6 characters long.',
        variant: 'danger'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlert({
        show: true,
        message: 'Password updated successfully!',
        variant: 'success'
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setAlert({
        show: true,
        message: 'Failed to update password. Please check your current password.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleVariant = (role) => {
    const variants = {
      'ADMIN': 'danger',
      'DEPT_HEAD': 'primary',
      'TRAINER': 'info',
      'TRAINEE': 'success',
      'ACADEMIC_DEPT': 'warning',
      'SQA_AUDITOR': 'secondary'
    };
    return variants[role] || 'secondary';
  };

  return (
    <Container fluid className="py-4">


      {alert.show && (
        <Row className="mb-4">
          <Col lg={12}>
            <Alert 
              variant={alert.variant} 
              dismissible 
              onClose={() => setAlert({ show: false, message: '', variant: 'success' })}
            >
              {alert.message}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        {/* Avatar and Basic Info */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="position-relative d-inline-block mb-3">
                <div 
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                  style={{ width: '120px', height: '120px', margin: '0 auto' }}
                >
                  <Person size={48} className="text-white" />
                </div>
                <button
                  className="position-absolute rounded-circle border border-2 border-white shadow-sm"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    bottom: '0px',
                    right: '0px',
                    transform: 'translate(40%, 30%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#456882',
                    fontWeight: 'bold',
                    backgroundColor: '#d2c1b6',
                    lineHeight: '1'
                  }}
                >
                  📷
                </button>
              </div>
              
              <h4 className="mb-1">{user?.fullName || 'User Name'}</h4>
              <p className="text-muted mb-2">{user?.email || 'user@example.com'}</p>
              <Badge bg={getRoleVariant(user?.role)} className="mb-3">
                {user?.role || 'USER'}
              </Badge>
              
              <div className="text-start">
                <div className="mb-2">
                  <strong>Employee ID:</strong>
                  <br />
                  <span className="text-muted">{user?.eid || 'N/A'}</span>
                </div>
                <div className="mb-2">
                  <strong>Status:</strong>
                  <br />
                  <Badge bg={user?.status === 'Active' ? 'success' : 'secondary'}>
                    {user?.status || 'Active'}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Personal Information */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center">
                <Person size={20} className="me-2 text-primary" />
                <h5 className="mb-0">Personal Information</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSavePersonalInfo}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName}
                        onChange={handlePersonalInfoChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <Save size={16} className="me-1" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Reset */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center">
                <Key size={20} className="me-2 text-primary" />
                <h5 className="mb-0">Reset Password</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleResetPassword}>
                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Current Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="position-absolute end-0 top-50 translate-middle-y border-0"
                          style={{ background: 'none', right: '8px' }}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="position-absolute end-0 top-50 translate-middle-y border-0"
                          style={{ background: 'none', right: '8px' }}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Confirm New Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="position-absolute end-0 top-50 translate-middle-y border-0"
                          style={{ background: 'none', right: '8px' }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    variant="warning"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : (
                      <>
                        <Key size={16} className="me-1" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
