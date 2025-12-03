import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Nav, Tab, Table, Badge, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { Pen, Book, FileText, ExclamationTriangle, Save } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import subjectAPI from '../../api/subject';
import assessmentAPI from '../../api/assessment';
import courseAPI from '../../api/course';
import uploadAPI from '../../api/upload';
import SignaturePad from '../Profile/SignaturePad';
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
  const [signaturePadModalOpen, setSignaturePadModalOpen] = useState(false); // Control signature pad modal
  const [signatureDataUrl, setSignatureDataUrl] = useState(null); // Store signature data
  const [uploadingSignature, setUploadingSignature] = useState(false); // Track upload progress

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

  const handleSign = (assessmentId) => {
    // Open signature pad modal (not calling old API)
    setSigningAssessmentId(assessmentId);
    setSignaturePadModalOpen(true);
    setSignatureDataUrl(null); // Reset signature
  };

  const handleSignatureChange = (dataUrl) => {
    // Callback from SignaturePad when user draws signature
    setSignatureDataUrl(dataUrl);
  };

  // Resize signature to 87x60
  const resizeSignature = (originalDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 87;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 87, 60);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = originalDataUrl;
    });
  };

  const handleConfirmSignature = async () => {
    if (!signatureDataUrl || !signingAssessmentId) {
      toast.error('Please draw your signature first');
      return;
    }

    setUploadingSignature(true);

    try {
      // Resize signature to 87x60
      const resizedDataUrl = await resizeSignature(signatureDataUrl);

      // Step 1: Convert signature data URL to blob
      const response = await fetch(resizedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });

      // Step 2: Upload signature image to S3
      const uploadResponse = await uploadAPI.uploadImage(file, 'signature');
      
      // Get URL from response
      let signatureUrl = '';
      if (typeof uploadResponse === 'string') {
        signatureUrl = uploadResponse;
      } else if (uploadResponse?.url) {
        signatureUrl = uploadResponse.url;
      } else if (uploadResponse?.data?.[0]?.url) {
        signatureUrl = uploadResponse.data[0].url;
      }

      if (!signatureUrl) {
        throw new Error('Failed to get signature URL from upload response');
      }

      console.log('✅ Signature uploaded to S3:', signatureUrl);

      // Step 3: Call confirm-participation API with traineeSignatureUrl
      const confirmResponse = await assessmentAPI.confirmParticipation(signingAssessmentId, {
        traineeSignatureUrl: signatureUrl
      });

      const successMessage = confirmResponse?.message || 'Signature submitted successfully';
      toast.success(successMessage);

      // Close modal and refresh
      setSignaturePadModalOpen(false);
      setSigningAssessmentId(null);
      setSignatureDataUrl(null);

      // Reload data
      setTimeout(() => {
        loadAssessments();
      }, 500);
    } catch (err) {
      console.error('Error submitting signature:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit signature';
      toast.error(errorMessage);
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleCloseSignaturePad = () => {
    setSignaturePadModalOpen(false);
    setSigningAssessmentId(null);
    setSignatureDataUrl(null);
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

      {/* Signature Pad Modal */}
      <Modal show={signaturePadModalOpen} onHide={handleCloseSignaturePad} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Draw Your Signature</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p className="text-muted mb-3">
            Please draw your signature in the box below using your mouse or touch device.
          </p>
          <div className="d-flex justify-content-center mb-3">
            <SignaturePad
              onSignatureChange={handleSignatureChange}
              width={400}
              height={200}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleCloseSignaturePad}
            disabled={uploadingSignature}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmSignature}
            disabled={!signatureDataUrl || uploadingSignature}
          >
            {uploadingSignature ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Uploading...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Submit Signature
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TraineeSignatureRequiredList;
