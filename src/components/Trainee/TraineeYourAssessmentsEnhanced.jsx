import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Nav, Tab, Spinner, Alert, Table, Badge, Button } from 'react-bootstrap';
import { ExclamationTriangle, Book, FileText, CheckCircle, Clock, Play, FileEarmarkPdf } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import subjectAPI from '../../api/subject';
import assessmentAPI from '../../api/assessment';
import { ROUTES } from '../../constants/routes';
import SortableHeader from './SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import PDFModal from '../Common/PDFModal';
import '../../styles/scrollable-table.css';
import '../../styles/trainee-your-assessments.css';

const TraineeYourAssessmentsEnhanced = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('course');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);

  const { sortedData, sortConfig, handleSort } = useTableSort(assessments);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all courses/subjects for the trainee
      const response = await subjectAPI.getTraineeCourseSubjects(user.id);
      const courseData = response?.courses || [];

      if (!Array.isArray(courseData) || courseData.length === 0) {
        setAssessments([]);
        setLoading(false);
        return;
      }

      // Fetch assessments for all courses or subjects based on active tab
      const allAssessments = [];

      if (activeTab === 'course') {
        // Fetch assessments for all courses
        for (const item of courseData) {
          const course = item.course;
          if (course?.id) {
            try {
              const assessmentResponse = await assessmentAPI.getCourseAssessments(course.id);
              const courseAssessments = assessmentResponse?.assessments || [];
              
              // Add course info to each assessment and filter by allowed statuses
              courseAssessments.forEach(assessment => {
                const allowedStatuses = ['APPROVED', 'ON_GOING', 'DRAFT', 'SIGNATURE_PENDING'];
                if (allowedStatuses.includes(assessment.status)) {
                  allAssessments.push({
                    ...assessment,
                    courseInfo: assessmentResponse?.courseInfo || course
                  });
                }
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
                
                // Add subject and course info to each assessment and filter by allowed statuses
                subjectAssessments.forEach(assessment => {
                  const allowedStatuses = ['APPROVED', 'ON_GOING', 'DRAFT', 'SIGNATURE_PENDING'];
                  if (allowedStatuses.includes(assessment.status)) {
                    allAssessments.push({
                      ...assessment,
                      subjectInfo: assessmentResponse?.subjectInfo || subject,
                      courseInfo: item.course
                    });
                  }
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
      toast.error('Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeTab]);

  useEffect(() => {
    if (user?.id) {
      loadAssessments();
    }
  }, [user?.id, activeTab, loadAssessments]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ON_GOING': { variant: 'info', text: 'On Going', icon: Clock },
      'PENDING': { variant: 'warning', text: 'Pending', icon: Clock },
      'NOT_STARTED': { variant: 'warning', text: 'Not Started', icon: Clock },
      'APPROVED': { variant: 'success', text: 'Approved', icon: CheckCircle },
      'COMPLETED': { variant: 'success', text: 'Completed', icon: CheckCircle },
      'REJECTED': { variant: 'danger', text: 'Rejected', icon: ExclamationTriangle },
      'CANCELLED': { variant: 'secondary', text: 'Cancelled', icon: ExclamationTriangle },
      'DRAFT': { variant: 'primary', text: 'Draft', icon: Clock },
      'SIGNATURE_PENDING': { variant: 'warning', text: 'Signature Pending', icon: Clock }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: ExclamationTriangle };
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getResultBadge = (resultText) => {
    if (!resultText) return <span className="text-muted">-</span>;
    
    if (resultText === 'NOT_APPLICABLE') {
      return <Badge bg="secondary">N/A</Badge>;
    }

    if (resultText === 'PASS') {
      return <Badge bg="success">PASS</Badge>;
    }

    if (resultText === 'FAIL') {
      return <Badge bg="danger">FAIL</Badge>;
    }

    return <Badge bg="secondary">{resultText}</Badge>;
  };

  const handleParticipate = (assessment) => {
    // Navigate to Assessment Sections page
    navigate(ROUTES.ASSESSMENTS_SECTIONS(assessment.id));
  };

  const handleViewPDF = (pdfUrl) => {
    if (pdfUrl) {
      setSelectedPDFUrl(pdfUrl);
      setShowPDFModal(true);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="text-muted mt-2 mb-0">Loading your assessments...</p>
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
                  Course Assessments
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
                  Subject Assessments
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            {assessments.length === 0 ? (
              <div className="text-center py-5">
                <CheckCircle size={48} className="text-muted mb-3" />
                <p className="text-muted mb-0">No assessments available</p>
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
                      {activeTab === 'course' && (
                        <th className="border-neutral-200 text-primary-custom fw-semibold">
                          <SortableHeader 
                            title="Course" 
                            sortKey="courseInfo" 
                            sortConfig={sortConfig} 
                            onSort={handleSort} 
                          />
                        </th>
                      )}
                      {activeTab === 'subject' && (
                        <>
                          <th className="border-neutral-200 text-primary-custom fw-semibold">
                            <SortableHeader 
                              title="Subject" 
                              sortKey="subjectInfo" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="border-neutral-200 text-primary-custom fw-semibold">
                            <SortableHeader 
                              title="Course" 
                              sortKey="courseInfo" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                        </>
                      )}
                      <th className="border-neutral-200 text-primary-custom fw-semibold">
                        <SortableHeader 
                          title="Trainee" 
                          sortKey="trainee" 
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
                      <th className="border-neutral-200 text-primary-custom fw-semibold">
                        <SortableHeader 
                          title="Status" 
                          sortKey="status" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Score</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold">Result</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold text-center">PDF</th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold text-center">Actions</th>
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
                          {assessment.comment && (
                            <small className="text-muted d-block mt-1">{assessment.comment}</small>
                          )}
                        </td>
                        {activeTab === 'course' && (
                          <td className="border-neutral-200 align-middle">
                            {assessment.courseInfo ? (
                              <>
                                <div className="fw-medium text-dark">{assessment.courseInfo.name}</div>
                                <small className="text-muted">{assessment.courseInfo.code}</small>
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        )}
                        {activeTab === 'subject' && (
                          <>
                            <td className="border-neutral-200 align-middle">
                              {assessment.subjectInfo ? (
                                <>
                                  <div className="fw-medium text-dark">{assessment.subjectInfo.name}</div>
                                  <small className="text-muted">{assessment.subjectInfo.code}</small>
                                </>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="border-neutral-200 align-middle">
                              {assessment.courseInfo ? (
                                <>
                                  <div className="fw-medium text-dark">{assessment.courseInfo.name}</div>
                                  <small className="text-muted">{assessment.courseInfo.code}</small>
                                </>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="border-neutral-200 align-middle">
                          {assessment.trainee ? (
                            <>
                              <div className="fw-medium text-dark">{assessment.trainee.fullName}</div>
                              <small className="text-muted">{assessment.trainee.eid}</small>
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="border-neutral-200 align-middle">
                          <span className="text-dark">
                            {assessment.occuranceDate 
                              ? new Date(assessment.occuranceDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="border-neutral-200 align-middle">
                          {getStatusBadge(assessment.status)}
                        </td>
                        <td className="border-neutral-200 align-middle">
                          {assessment.resultScore ? (
                            <Badge bg={assessment.resultText === 'FAIL' ? 'danger' : 'success'}>
                              {assessment.resultScore}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="border-neutral-200 align-middle">
                          {getResultBadge(assessment.resultText)}
                        </td>
                        <td className="border-neutral-200 align-middle text-center">
                          {assessment.pdfUrl ? (
                            <Button
                              variant="link"
                              className="p-0 text-primary-custom"
                              onClick={() => handleViewPDF(assessment.pdfUrl)}
                              style={{ border: 'none', background: 'transparent' }}
                            >
                              <FileEarmarkPdf size={18} />
                            </Button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="border-neutral-200 align-middle text-center">
                          {(assessment.status === 'ON_GOING' || assessment.status === 'DRAFT') && assessment.isTraineeLocked === false && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleParticipate(assessment)}
                              className="d-flex align-items-center gap-1"
                            >
                              <Play size={14} />
                              Participate
                            </Button>
                          )}
                          {!((assessment.status === 'ON_GOING' || assessment.status === 'DRAFT') && assessment.isTraineeLocked === false) && (
                            <span className="text-muted">—</span>
                          )}
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

      {/* PDF Modal */}
      <PDFModal
        show={showPDFModal}
        onHide={() => {
          setShowPDFModal(false);
          setSelectedPDFUrl(null);
        }}
        pdfUrl={selectedPDFUrl}
        title="Assessment PDF"
      />
    </Container>
  );
};

export default TraineeYourAssessmentsEnhanced;
