import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Nav, Tab, Table, Badge, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { Pen, Book, FileText, ExclamationTriangle } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import subjectAPI from '../../api/subject';
import assessmentAPI from '../../api/assessment';
import courseAPI from '../../api/course';
import SortableHeader from './SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const TraineeSignatureRequiredList = ({ traineeId }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('course');
  const [signingAssessmentId, setSigningAssessmentId] = useState(null); // Track which assessment is being signed

  const { sortedData, sortConfig, handleSort } = useTableSort(assessments);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load courses map first
      const coursesMapData = {};
      try {
        const coursesResponse = await courseAPI.getCourses();
        const courses = coursesResponse?.courses || coursesResponse?.data || [];
        courses.forEach(course => {
          if (course.id) {
            coursesMapData[course.id] = course.name || course.code || 'Unknown Course';
          }
        });
      } catch (err) {
        console.error('Error loading courses map:', err);
        // Continue without course names if API fails
      }

      // Get all courses/subjects for the trainee
      const response = await subjectAPI.getTraineeCourseSubjects(user?.id || traineeId);
      const courseData = response?.courses || [];

      if (!Array.isArray(courseData) || courseData.length === 0) {
        setAssessments([]);
        setLoading(false);
        return;
      }

      // Fetch assessments for all courses or subjects based on active tab
      const allAssessments = [];
      // Filter for SIGNATURE_PENDING and READY_TO_SUBMIT statuses
      const allowedStatuses = ['SIGNATURE_PENDING', 'READY_TO_SUBMIT'];

      if (activeTab === 'course') {
        // Fetch assessments for all courses
        for (const item of courseData) {
          const course = item.course;
          if (course?.id) {
            try {
              const assessmentResponse = await assessmentAPI.getCourseAssessments(course.id);
              const courseAssessments = assessmentResponse?.assessments || [];
              
              // Filter SIGNATURE_PENDING and READY_TO_SUBMIT assessments and add course info
              courseAssessments
                .filter(assessment => allowedStatuses.includes(assessment.status))
                .forEach(assessment => {
                  allAssessments.push({
                    ...assessment,
                    courseId: course.id,
                    courseName: coursesMapData[course.id] || course.name || course.code || 'Unknown Course'
                  });
                });
            } catch (err) {
              console.error(`Error loading assessments for course ${course.id}:`, err);
              // Continue with other courses
            }
          }
        }
      } else {
        // Fetch assessments for all subjects
        for (const item of courseData) {
          const subjects = item.subjects || [];
          for (const subject of subjects) {
            if (subject?.id) {
              try {
                const assessmentResponse = await assessmentAPI.getSubjectAssessments(subject.id);
                const subjectAssessments = assessmentResponse?.assessments || [];
                
                // Filter SIGNATURE_PENDING and READY_TO_SUBMIT assessments and add course info
                subjectAssessments
                  .filter(assessment => allowedStatuses.includes(assessment.status))
                  .forEach(assessment => {
                    const courseId = assessment.courseId || item.course?.id;
                    allAssessments.push({
                      ...assessment,
                      courseId: courseId,
                      courseName: coursesMapData[courseId] || item.course?.name || item.course?.code || 'Unknown Course'
                    });
                  });
              } catch (err) {
                console.error(`Error loading assessments for subject ${subject.id}:`, err);
                // Continue with other subjects
              }
            }
          }
        }
      }

      setAssessments(allAssessments);
    } catch (err) {
      console.error('Error loading assessments:', err);
      setError(err.message || 'Failed to load assessments');
      toast.error('Failed to load signature required assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, traineeId, activeTab]);

  useEffect(() => {
    if (user?.id || traineeId) {
      loadAssessments();
    }
  }, [user?.id, traineeId, activeTab, loadAssessments]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SIGNATURE_PENDING': { variant: 'warning', text: 'Signature Pending' },
      'PENDING': { variant: 'warning', text: 'Pending' },
      'COMPLETED': { variant: 'success', text: 'Completed' },
      'OVERDUE': { variant: 'danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    
    return (
      <Badge bg={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const handleSign = async (assessmentId) => {
    if (signingAssessmentId) {
      return; // Prevent multiple simultaneous requests
    }

    try {
      setSigningAssessmentId(assessmentId);
      const response = await assessmentAPI.confirmParticipation(assessmentId);
      
      // Get message from response
      const successMessage = response?.data?.message || response?.message || 'Participation confirmed successfully';
      toast.success(successMessage);
      
      // Auto-refresh the page after 1.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error confirming participation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to confirm participation';
      toast.error(errorMessage);
      setSigningAssessmentId(null);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="text-muted mt-2 mb-0">Loading signature required assessments...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Card className="shadow-sm border-danger">
          <Card.Body>
            <Alert variant="danger" className="mb-0">
              <ExclamationTriangle size={16} className="me-2" />
              {error}
            </Alert>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card className="border-0 shadow-sm">
        <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
          {/* Tab Header */}
          <Card.Header className="border-bottom py-2 bg-primary">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="course"
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'course' ? '600' : '400',
                    opacity: activeTab === 'course' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <Book className="me-2" size={16} />
                  Course
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="subject"
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'subject' ? '600' : '400',
                    opacity: activeTab === 'subject' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <FileText className="me-2" size={16} />
                  Subject
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            {assessments.length === 0 ? (
              <div className="text-center py-5">
                <Pen size={48} className="text-muted mb-3" />
                <p className="text-muted mb-0">No signature required assessments</p>
              </div>
            ) : (
              <div className="scrollable-table-container admin-table">
                <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
                  <thead className="sticky-header">
                    <tr>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">
                        <SortableHeader 
                          title="Assessment Name" 
                          sortKey="name" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">
                        <SortableHeader 
                          title="Course Name" 
                          sortKey="courseName" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">
                        <SortableHeader 
                          title="Date" 
                          sortKey="occuranceDate" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold text-center">Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((assessment, index) => (
                      <tr 
                        key={assessment.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                        style={{
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                        }}
                      >
                        <td className="border-neutral-200 align-middle">
                          <div className="fw-medium text-dark">{assessment.name}</div>
                        </td>
                        <td className="border-neutral-200 align-middle">
                          <div className="fw-medium text-dark">{assessment.courseName}</div>
                        </td>
                        <td className="border-neutral-200 align-middle">
                          <div className="text-dark">
                            {assessment.occuranceDate ? new Date(assessment.occuranceDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                          </div>
                        </td>
                        <td className="border-neutral-200 align-middle text-center">
                          <Form.Check
                            type="checkbox"
                            checked={assessment.status === 'READY_TO_SUBMIT' || signingAssessmentId === assessment.id}
                            disabled={assessment.status === 'READY_TO_SUBMIT' || signingAssessmentId === assessment.id}
                            onChange={() => {
                              if (assessment.status === 'SIGNATURE_PENDING') {
                                handleSign(assessment.id);
                              }
                            }}
                            style={{
                              cursor: assessment.status === 'SIGNATURE_PENDING' ? 'pointer' : 'not-allowed'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Tab.Container>
      </Card>
    </Container>
  );
};

export default TraineeSignatureRequiredList;
