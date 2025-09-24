import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { Person, Camera, Key, Save } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../api/user';
import ResetPasswordModal from '../../components/Common/ResetPasswordModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    avatarUrl: ''
  });


  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await userAPI.getProfile();
        setProfileData(response);
        
        // Update form with API data
        const fullName = [response.firstName, response.middleName, response.lastName]
          .filter(Boolean)
          .join(' ');
        
        setPersonalInfo({
          fullName: fullName || '',
          email: response.email || '',
          phone: response.phoneNumber || '',
          address: response.address || '',
          gender: response.gender || '',
          avatarUrl: response.avatarUrl || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setAlert({
          show: true,
          message: 'Failed to load profile data. Please refresh the page.',
          variant: 'danger'
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update personalInfo when user data is available (fallback)
  useEffect(() => {
    if (user && !profileData) {
      setPersonalInfo({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '',
        gender: '',
        avatarUrl: ''
      });
    }
  }, [user, profileData]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
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

  const handleResetPassword = async (passwordData) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlert({
        show: true,
        message: 'Password updated successfully!',
        variant: 'success'
      });
    } catch (error) {
      setAlert({
        show: true,
        message: 'Failed to update password. Please check your current password.',
        variant: 'danger'
      });
      throw error; // Re-throw to let modal handle it
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

  if (profileLoading) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading profile data...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

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
              
              <h4 className="mb-1">
                {profileData ? 
                  [profileData.firstName, profileData.middleName, profileData.lastName]
                    .filter(Boolean)
                    .join(' ') || 'User Name'
                  : user?.fullName || 'User Name'
                }
              </h4>
              <p className="text-muted mb-2">
                {profileData?.email || user?.email || 'user@example.com'}
              </p>
              <Badge bg={getRoleVariant(profileData?.role?.name || user?.role)} className="mb-3">
                {profileData?.role?.name || user?.role || 'USER'}
              </Badge>
              
              <div className="text-start">
                <div className="mb-2 d-flex align-items-center justify-content-between">
                  <div>
                    <strong>Employee ID:</strong>
                    <br />
                    <span className="text-muted">{profileData?.eid || user?.eid || 'N/A'}</span>
                  </div>
                  <div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowResetPasswordModal(true)}
                      className="d-flex align-items-center"
                    >
                      <Key size={14} className="me-1" />
                      Reset Password
                    </Button>
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Status:</strong>
                  <br />
                  <Badge bg="success">
                    Active
                  </Badge>
                </div>
                {profileData?.address && (
                  <div className="mb-2">
                    <strong>Address:</strong>
                    <br />
                    <span className="text-muted">{profileData.address}</span>
                  </div>
                )}
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
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={personalInfo.gender}
                        onChange={handlePersonalInfoChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={personalInfo.address}
                        onChange={handlePersonalInfoChange}
                        placeholder="Enter your address"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Avatar URL</Form.Label>
                      <Form.Control
                        type="url"
                        name="avatarUrl"
                        value={personalInfo.avatarUrl}
                        onChange={handlePersonalInfoChange}
                        placeholder="Enter avatar image URL"
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


      {/* Reset Password Modal */}
      <ResetPasswordModal
        show={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onSave={handleResetPassword}
        loading={loading}
      />
    </Container>
  );
};

export default ProfilePage;
