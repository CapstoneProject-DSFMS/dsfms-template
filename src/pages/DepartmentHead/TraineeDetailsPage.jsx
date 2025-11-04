import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { Person, ArrowLeft, Envelope, Calendar, Clock, Book, CheckCircle, Award } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSkeleton } from '../../components/Common';
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
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock trainee data
        const mockTrainee = {
          id: traineeId,
          name: 'John Doe',
          email: 'john.doe@email.com',
          employeeId: 'TE001',
          department: 'Operations',
          position: 'Operations Manager',
          phone: '+1-555-0123',
          enrollmentDate: '2024-01-15',
          status: 'active',
          lastActivity: '2024-01-20',
          completedCourses: 3,
          totalCourses: 5,
          completedSubjects: 12,
          totalSubjects: 20,
          averageScore: 85,
          overallProgress: 65,
          enrolledCourses: [
            { 
              id: 1, 
              name: 'Aviation Safety Management', 
              code: 'ASM-101',
              progress: 75, 
              instructor: 'Dr. Smith',
              enrolledDate: '2024-01-15',
              status: 'in_progress',
              completedSubjects: 6,
              totalSubjects: 8
            },
            { 
              id: 2, 
              name: 'Aircraft Maintenance', 
              code: 'AM-201',
              progress: 45, 
              instructor: 'Jane Doe',
              enrolledDate: '2024-01-16',
              status: 'in_progress',
              completedSubjects: 4,
              totalSubjects: 9
            },
            { 
              id: 3, 
              name: 'Emergency Response Training', 
              code: 'ERT-301',
              progress: 100, 
              instructor: 'Mike Johnson',
              enrolledDate: '2024-01-10',
              status: 'completed',
              completedSubjects: 10,
              totalSubjects: 10
            }
          ],
          assessments: [
            { 
              id: 1,
              name: 'Safety Procedures Quiz', 
              course: 'Aviation Safety Management',
              score: 95, 
              maxScore: 100,
              status: 'approved',
              completedDate: '2024-01-20',
              submittedBy: 'Dr. Smith'
            },
            { 
              id: 2,
              name: 'Maintenance Practical Assessment', 
              course: 'Aircraft Maintenance',
              score: 87, 
              maxScore: 100,
              status: 'approved',
              completedDate: '2024-01-19',
              submittedBy: 'Jane Doe'
            },
            { 
              id: 3,
              name: 'Emergency Procedures Test', 
              course: 'Emergency Response Training',
              score: 92, 
              maxScore: 100,
              status: 'pending',
              completedDate: '2024-01-25',
              submittedBy: 'Mike Johnson'
            }
          ],
          certifications: [
            { name: 'Aviation Safety Management', date: '2024-01-20', status: 'completed', issuedBy: 'Training Department' },
            { name: 'Risk Assessment', date: '2024-01-25', status: 'completed', issuedBy: 'Quality Department' },
            { name: 'Emergency Response', date: '2024-02-01', status: 'in_progress', issuedBy: 'Training Department' }
          ]
        };
        
        setTrainee(mockTrainee);
      } catch (err) {
        setError('Failed to load trainee details');
        console.error('Error fetching trainee:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTraineeDetails();
  }, [traineeId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      completed: { variant: 'primary', text: 'Completed' },
      in_progress: { variant: 'info', text: 'In Progress' },
      inactive: { variant: 'warning', text: 'Inactive' },
      suspended: { variant: 'danger', text: 'Suspended' },
      approved: { variant: 'success', text: 'Approved' },
      pending: { variant: 'warning', text: 'Pending' },
      rejected: { variant: 'danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
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
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <button 
              className="btn btn-link p-0 me-3"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="mb-1">{trainee.name}</h2>
              <p className="text-muted mb-0">{trainee.employeeId} • {trainee.department}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Trainee Info Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Person size={24} className="text-primary mb-2" />
              <h6 className="mb-1 text-muted">Status</h6>
              <div className="mt-2">{getStatusBadge(trainee.status)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Book size={24} className="text-success mb-2" />
              <h6 className="mb-1 text-muted">Courses</h6>
              <h4 className="mb-0 text-success">{trainee.completedCourses}/{trainee.totalCourses}</h4>
              <small className="text-muted">Completed</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-info mb-2">
                <Award size={24} />
              </div>
              <h6 className="mb-1 text-muted">Average Score</h6>
              <h4 className="mb-0 text-info">{trainee.averageScore}%</h4>
              <small className="text-muted">Performance</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Calendar size={24} className="text-warning mb-2" />
              <h6 className="mb-1 text-muted">Enrolled</h6>
              <h4 className="mb-0 text-warning">{new Date(trainee.enrollmentDate).toLocaleDateString()}</h4>
              <small className="text-muted">Start Date</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Information & Progress */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Contact Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Envelope size={16} className="me-2 text-muted" />
                <strong>Email:</strong> {trainee.email}
              </div>
              <div className="mb-3">
                <Person size={16} className="me-2 text-muted" />
                <strong>Position:</strong> {trainee.position}
              </div>
              <div className="mb-3">
                <Calendar size={16} className="me-2 text-muted" />
                <strong>Last Activity:</strong> {new Date(trainee.lastActivity).toLocaleDateString()}
              </div>
              <div className="mb-0">
                <Clock size={16} className="me-2 text-muted" />
                <strong>Overall Progress:</strong> {trainee.overallProgress}%
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Progress Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Courses Progress</span>
                  <span className="fw-bold">{trainee.completedCourses}/{trainee.totalCourses}</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${(trainee.completedCourses / trainee.totalCourses) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mb-0">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subjects Progress</span>
                  <span className="fw-bold">{trainee.completedSubjects}/{trainee.totalSubjects}</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: `${(trainee.completedSubjects / trainee.totalSubjects) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Enrolled Courses */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Enrolled Courses</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="scrollable-table-container admin-table">
                <Table hover className="mb-0 table-mobile-responsive sticky-header border-neutral-200 align-middle" style={{ fontSize: '0.875rem' }}>
                  <thead className="sticky-header">
                    <tr>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Course</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold hide-mobile">Code</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Progress</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold hide-mobile">Subjects</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainee.enrolledCourses.map((course, index) => (
                      <tr 
                        key={course.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                      >
                        <td className="align-middle">
                          <div>
                            <h6 className="mb-0 fw-medium">{course.name}</h6>
                            <small className="text-muted">Instructor: {course.instructor}</small>
                          </div>
                        </td>
                        <td className="align-middle hide-mobile">
                          <Badge bg="secondary">{course.code}</Badge>
                        </td>
                        <td className="align-middle">
                          <div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="fw-medium">{course.progress}%</span>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                role="progressbar" 
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="align-middle hide-mobile">
                          <span>{course.completedSubjects}/{course.totalSubjects}</span>
                        </td>
                        <td className="align-middle">
                          {getStatusBadge(course.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assessments */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Assessment History</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="scrollable-table-container admin-table">
                <Table hover className="mb-0 table-mobile-responsive sticky-header border-neutral-200 align-middle" style={{ fontSize: '0.875rem' }}>
                  <thead className="sticky-header">
                    <tr>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Assessment</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold hide-mobile">Course</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Score</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold hide-mobile">Submitted By</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Status</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold hide-mobile">Completed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainee.assessments.map((assessment, index) => (
                      <tr 
                        key={assessment.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                      >
                        <td className="align-middle">
                          <div>
                            <h6 className="mb-0 fw-medium">{assessment.name}</h6>
                          </div>
                        </td>
                        <td className="align-middle hide-mobile">
                          <span>{assessment.course}</span>
                        </td>
                        <td className="align-middle">
                          {assessment.score ? (
                            <span className="fw-bold text-success">{assessment.score}/{assessment.maxScore}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="align-middle hide-mobile">
                          <span className="text-muted">{assessment.submittedBy}</span>
                        </td>
                        <td className="align-middle">
                          {getStatusBadge(assessment.status)}
                        </td>
                        <td className="align-middle hide-mobile">
                          <span>{new Date(assessment.completedDate).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Certifications */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Certifications</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="scrollable-table-container admin-table">
                <Table hover className="mb-0 table-mobile-responsive sticky-header border-neutral-200 align-middle" style={{ fontSize: '0.875rem' }}>
                  <thead className="sticky-header">
                    <tr>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Certification</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Date</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold hide-mobile">Issued By</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainee.certifications.map((cert, index) => (
                      <tr 
                        key={index}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                      >
                        <td className="align-middle">
                          <div>
                            <h6 className="mb-0 fw-medium">{cert.name}</h6>
                          </div>
                        </td>
                        <td className="align-middle">
                          <span>{new Date(cert.date).toLocaleDateString()}</span>
                        </td>
                        <td className="align-middle hide-mobile">
                          <span className="text-muted">{cert.issuedBy}</span>
                        </td>
                        <td className="align-middle">
                          {getStatusBadge(cert.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeDetailsPage;




