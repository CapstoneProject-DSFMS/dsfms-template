import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Person, Envelope, Phone, Calendar, GeoAlt, Building, Book, ClipboardCheck } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { toast } from 'react-toastify';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import traineeAPI from '../../api/trainee';
import TraineeCourseList from './TraineeCourseList';

const TraineeDetailView = ({ traineeId }) => {
  const navigate = useNavigate();
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (traineeId) {
      loadTraineeDetails();
    }
  }, [traineeId]);

  const loadTraineeDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Hardcoded trainee data
      const mockTrainee = {
        id: traineeId,
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phoneNumber: '+1 (555) 123-4567',
        dateOfBirth: '1990-05-15',
        address: '123 Main Street, New York, NY 10001',
        department: {
          id: 1,
          name: 'Flight Operations',
          code: 'FO'
        },
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-02-01T14:30:00.000Z'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTrainee(mockTrainee);
    } catch (error) {
      console.error('Error loading trainee details:', error);
      setError('Failed to load trainee details');
      toast.error('Failed to load trainee details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/trainee/dashboard');
  };


  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading trainee details...</p>
        </div>
      </Container>
    );
  }

  if (error || !trainee) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Trainee not found'}</p>
          <Button variant="outline-danger" onClick={handleBack}>
            <ArrowLeft className="me-2" size={16} />
            Back to Trainees
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="me-3"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
              <h2 className="mb-1 d-flex align-items-center">
                <Person className="me-2" size={28} />
                {trainee.firstName} {trainee.lastName}
              </h2>
                <p className="text-muted mb-0">
                  {trainee.department?.name || 'No Department'}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <PermissionWrapper permission={PERMISSION_IDS.UPDATE_USER}>
                <Button variant="outline-primary" size="sm">
                  Edit Trainee
                </Button>
              </PermissionWrapper>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Academic Details - Top Right */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <Person className="me-2" size={20} />
                Academic Details
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <h4 className="mb-1">
                  {trainee.lastName} {trainee.middleName} {trainee.firstName}
                </h4>
              </div>

              <div className="space-y-3">
                <div className="d-flex align-items-center">
                  <Envelope className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Email</div>
                    <div className="text-muted">{trainee.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Phone className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Phone</div>
                    <div className="text-muted">{trainee.phoneNumber || 'N/A'}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Calendar className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Date of Birth</div>
                    <div className="text-muted">
                      {trainee.dateOfBirth ? new Date(trainee.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <GeoAlt className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Address</div>
                    <div className="text-muted">{trainee.address || 'N/A'}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Building className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Department</div>
                    <div className="text-muted">{trainee.department?.name || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Enrolled Course List - Below Academic Details */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <Book className="me-2" size={20} />
                Enrolled Course List
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <PermissionWrapper permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}>
                <TraineeCourseList traineeId={traineeId} />
              </PermissionWrapper>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Assessment Pending List - Bottom Right */}
        <Col lg={8} className="offset-lg-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <ClipboardCheck className="me-2" size={20} />
                Assessment Pending List
              </h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="text-center text-muted">
                <ClipboardCheck size={48} className="mb-3" />
                <p>Assessment pending list component is being updated.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeDetailView;
