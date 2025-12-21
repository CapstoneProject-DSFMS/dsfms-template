import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Nav, Tab, Table, Badge, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { Pen, Book, FileText, ExclamationTriangle, Save } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import assessmentAPI from '../../api/assessment';
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

  // Filter assessments based on active tab to avoid duplicates
  const filteredAssessments = useMemo(() => {
    if (activeTab === 'course') {
      // Course Assessments: only show course-level assessments (subjectId is null)
      return assessments.filter(assessment => assessment.subjectId === null);
    } else {
      // Subject Assessments: only show subject-level assessments (subjectId is not null)
      return assessments.filter(assessment => assessment.subjectId !== null);
    }
  }, [assessments, activeTab]);

  const { sortedData, sortConfig, handleSort } = useTableSort(filteredAssessments);

  // Format status text by removing underscores and capitalizing
  const formatStatusText = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all assessments for the trainee (1 API call)
      const response = await assessmentAPI.getTraineeAssessments();
      const allAssessments = response?.assessments || [];

      // Filter only SIGNATURE_PENDING assessments
      const signatureRequiredAssessments = allAssessments.filter(
        assessment => assessment.status === 'SIGNATURE_PENDING'
      );

      setAssessments(signatureRequiredAssessments);
    } catch (err) {
      console.error('Error loading assessments:', err);
      setError(err.message || 'Failed to load assessments');
      toast.error('Failed to load signature required assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id || traineeId) {
      loadAssessments();
    }
  }, [user?.id, traineeId, loadAssessments]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SIGNATURE_PENDING': { variant: 'warning' },
      'PENDING': { variant: 'warning' },
      'COMPLETED': { variant: 'success' },
      'OVERDUE': { variant: 'danger' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary' };
    const text = formatStatusText(status);
    
    return (
      <Badge bg={config.variant}>
        {text}
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

  // Resize signature to 400x200 with transparent background (same size as pad)
  const resizeSignature = (originalDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas to ensure transparent background
        ctx.clearRect(0, 0, 400, 200);
        
        // Draw the signature image (preserves transparency from original)
        ctx.drawImage(img, 0, 0, 400, 200);
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
      // Resize signature to 400x200
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
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-5">
                <Pen size={48} className="text-muted mb-3" />
                <p className="text-muted mb-0">No Signature Confirmation Required Assessment Forms.</p>
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
                          title={activeTab === 'course' ? 'Course Name' : 'Subject Name'} 
                          sortKey={activeTab === 'course' ? 'courseName' : 'subjectName'} 
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
                          <div className="fw-medium text-dark">
                            {activeTab === 'course' ? assessment.courseName : assessment.subjectName}
                          </div>
                        </td>
                        <td className="border-neutral-200 align-middle">
                          <div className="text-dark">
                            {assessment.occuranceDate ? new Date(assessment.occuranceDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                          </div>
                        </td>
                        <td className="border-neutral-200 align-middle text-center">
                          <div className="d-flex justify-content-center">
                            <Button
                              variant={assessment.status === 'READY_TO_SUBMIT' ? 'success' : 'primary'}
                              size="sm"
                              disabled={assessment.status === 'READY_TO_SUBMIT' || signingAssessmentId === assessment.id}
                              onClick={() => {
                                if (assessment.status === 'SIGNATURE_PENDING') {
                                  handleSign(assessment.id);
                                }
                              }}
                              className="d-flex align-items-center"
                              style={{
                                gap: '0.5rem'
                              }}
                            >
                              <Pen size={14} />
                              {assessment.status === 'READY_TO_SUBMIT' ? 'Signed' : 'Sign'}
                            </Button>
                          </div>
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
