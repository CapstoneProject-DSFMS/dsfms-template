import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Person, ArrowLeft, Envelope, Calendar, Phone, GeoAlt, Passport, Building } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../../api/user';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

const TraineeDetailsPage = () => {
  const { traineeId } = useParams();
  const navigate = useNavigate();
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTraineeDetails = async () => {
      if (!traineeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call API GET /users/{userId}
        const response = await userAPI.getUserById(traineeId);
        
        // Handle response format: { message: "...", data: {...} }
        const userData = response.data || response;

        // Map user data to trainee format
        const mappedTrainee = {
          id: userData.id,
          eid: userData.eid,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          middleName: userData.middleName || '',
          name: `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim().replace(/\s+/g, ' '),
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || 'N/A',
          status: userData.status || 'ACTIVE',
          gender: userData.gender || 'N/A',
          address: userData.address || 'N/A',
          avatarUrl: userData.avatarUrl,
          role: userData.role?.name || 'N/A',
          department: userData.department?.name || 'N/A',
          departmentId: userData.department?.id,
          // Trainee Profile
          dob: userData.traineeProfile?.dob,
          enrollmentDate: userData.traineeProfile?.enrollmentDate,
          trainingBatch: userData.traineeProfile?.trainingBatch || 'N/A',
          passportNo: userData.traineeProfile?.passportNo || 'N/A',
          nation: userData.traineeProfile?.nation || 'N/A',
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        };
        
        setTrainee(mappedTrainee);
      } catch (err) {
        console.error('Error fetching trainee details:', err);
        setError('Failed to load trainee details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTraineeDetails();
  }, [traineeId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { variant: 'success', text: 'Active' },
      INACTIVE: { variant: 'secondary', text: 'Inactive' },
      SUSPENDED: { variant: 'danger', text: 'Suspended' },
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
      suspended: { variant: 'danger', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status || 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading trainee details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!trainee) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Trainee Not Found</Alert.Heading>
          <p>The requested trainee could not be found.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3 py-md-4 px-3 px-md-4">
      {/* Header */}
      <Row className="mb-3 mb-md-4">
        <Col>
          <div className="d-flex align-items-center flex-wrap">
            <button 
              className="btn btn-link p-0 me-2 me-md-3 mb-2 mb-md-0"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={18} className="d-md-none" />
              <ArrowLeft size={20} className="d-none d-md-block" />
            </button>
            <div className="flex-grow-1">
              <h2 className="mb-1 h4 h-md-2">{trainee.name}</h2>
              <p className="text-muted mb-0 small">{trainee.eid} • {trainee.department}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Trainee Info Cards */}
      <div style={{ marginBottom: '4rem' }}>
        <Row className="g-2 g-md-3">
          <Col xs={6} sm={6} md={3} lg={3} className="d-flex mb-2 mb-md-0">
            <Card className="h-100 border-0 shadow-sm w-100">
              <Card.Body className="text-center d-flex flex-column justify-content-center p-3 p-md-4" style={{ minHeight: '120px' }}>
                <div className="d-flex justify-content-center mb-2">
                  <Person size={20} className="text-primary d-md-none" />
                  <Person size={24} className="text-primary d-none d-md-block" />
                </div>
                <h6 className="mb-2 text-muted small fw-normal">Status</h6>
                <div className="mt-auto d-flex justify-content-center">{getStatusBadge(trainee.status)}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={6} md={3} lg={3} className="d-flex mb-2 mb-md-0">
            <Card className="h-100 border-0 shadow-sm w-100">
              <Card.Body className="text-center d-flex flex-column justify-content-center p-3 p-md-4" style={{ minHeight: '120px' }}>
                <div className="d-flex justify-content-center mb-2">
                  <Building size={20} className="text-info d-md-none" />
                  <Building size={24} className="text-info d-none d-md-block" />
                </div>
                <h6 className="mb-2 text-muted small fw-normal">Department</h6>
                <h6 className="mb-0 text-info small d-md-none" style={{ minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', wordBreak: 'break-word' }}>{trainee.department}</h6>
                <h6 className="mb-0 text-info d-none d-md-block" style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{trainee.department}</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={6} md={3} lg={3} className="d-flex mb-2 mb-md-0">
            <Card className="h-100 border-0 shadow-sm w-100">
              <Card.Body className="text-center d-flex flex-column justify-content-center p-3 p-md-4" style={{ minHeight: '120px' }}>
                <div className="d-flex justify-content-center mb-2">
                  <Calendar size={20} className="text-success d-md-none" />
                  <Calendar size={24} className="text-success d-none d-md-block" />
                </div>
                <h6 className="mb-2 text-muted small fw-normal">Enrollment Date</h6>
                <h6 className="mb-0 text-success small d-md-none" style={{ minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', wordBreak: 'break-word' }}>{formatDate(trainee.enrollmentDate)}</h6>
                <h6 className="mb-0 text-success d-none d-md-block" style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{formatDate(trainee.enrollmentDate)}</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={6} md={3} lg={3} className="d-flex mb-2 mb-md-0">
            <Card className="h-100 border-0 shadow-sm w-100">
              <Card.Body className="text-center d-flex flex-column justify-content-center p-3 p-md-4" style={{ minHeight: '120px' }}>
                <div className="d-flex justify-content-center mb-2">
                  <Passport size={20} className="text-warning d-md-none" />
                  <Passport size={24} className="text-warning d-none d-md-block" />
                </div>
                <h6 className="mb-2 text-muted small fw-normal">Training Batch</h6>
                <h6 className="mb-0 text-warning small d-md-none" style={{ minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', wordBreak: 'break-word' }}>{trainee.trainingBatch}</h6>
                <h6 className="mb-0 text-warning d-none d-md-block" style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{trainee.trainingBatch}</h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Personal Information & Trainee Profile */}
      <Row className="mb-4 g-3 g-md-4 align-items-stretch">
        <Col xs={12} sm={12} md={6} lg={6} className="mb-3 mb-md-0 d-flex">
          <Card className="border-0 shadow-sm w-100 d-flex flex-column">
            <Card.Header className="department-head-section-header bg-primary text-white border-0">
              <h5 className="mb-0 text-white h6 h-md-5">Personal Information</h5>
            </Card.Header>
            <Card.Body className="p-3 p-md-4 flex-grow-1">
              <div className="mb-3 d-flex align-items-start">
                <Person size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Employee ID:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.eid}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Envelope size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Email:</strong> <span className="d-block d-md-inline ms-md-1 text-break">{trainee.email}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Phone size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Phone Number:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.phoneNumber}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Person size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Gender:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.gender}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Calendar size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Date of Birth:</strong> <span className="d-block d-md-inline ms-md-1">{formatDate(trainee.dob)}</span>
                </div>
              </div>
              <div className="mb-0 d-flex align-items-start">
                <GeoAlt size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Address:</strong> <span className="d-block d-md-inline ms-md-1 text-break">{trainee.address}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} className="mb-0 d-flex">
          <Card className="border-0 shadow-sm w-100 d-flex flex-column">
            <Card.Header className="department-head-section-header bg-primary text-white border-0">
              <h5 className="mb-0 text-white h6 h-md-5">Trainee Profile</h5>
            </Card.Header>
            <Card.Body className="p-3 p-md-4 flex-grow-1">
              <div className="mb-3 d-flex align-items-start">
                <Building size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Department:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.department}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Person size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Role:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.role}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Calendar size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Enrollment Date:</strong> <span className="d-block d-md-inline ms-md-1">{formatDate(trainee.enrollmentDate)}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Passport size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Training Batch:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.trainingBatch}</span>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <Passport size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Passport No:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.passportNo}</span>
                </div>
              </div>
              <div className="mb-0 d-flex align-items-start">
                <GeoAlt size={16} className="me-2 text-muted mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <strong className="d-block d-md-inline">Nation:</strong> <span className="d-block d-md-inline ms-md-1">{trainee.nation}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default TraineeDetailsPage;




