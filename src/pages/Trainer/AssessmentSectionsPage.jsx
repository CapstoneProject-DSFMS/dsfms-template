import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import assessmentAPI from '../../api/assessment';
import { ROUTES } from '../../constants/routes';
import AssessmentOverview from '../../components/Trainer/AssessmentOverview';
import AssessmentSectionCard from '../../components/Trainer/AssessmentSectionCard';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { PermissionWrapper } from '../../components/Common';
import '../../styles/assessment-sections.css';

const TrainerAssessmentSectionsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const isTrainee = user?.role === 'TRAINEE';
  const isTrainer = userRole?.name === 'TRAINER' || user?.role === 'TRAINER';
  const isDepartmentHead = userRole?.name === 'DEPARTMENT_HEAD' || userRole?.name === 'DEPARTMENT HEAD';
  const [state, setState] = useState({
    loading: true,
    error: null,
    assessmentInfo: null,
    sections: [],
    userRole: null,
    isTraineeLocked: false
  });
  const [rejectModalShow, setRejectModalShow] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      fetchSections();
    }
  }, [assessmentId]);

  const fetchSections = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await assessmentAPI.getAssessmentSections(assessmentId);
      setState({
        loading: false,
        error: null,
        assessmentInfo: response?.assessmentInfo || null,
        sections: response?.sections || [],
        userRole: response?.userRole || null,
        isTraineeLocked: response?.isTraineeLocked ?? false
      });
    } catch (error) {
      console.error('Error loading assessment sections:', error);
      toast.error('Failed to load assessment sections');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load assessment sections'
      }));
    }
  };

  const sortedSections = useMemo(() => {
    return [...state.sections].sort((a, b) => {
      const orderA = a.templateSection?.displayOrder ?? 0;
      const orderB = b.templateSection?.displayOrder ?? 0;
      return orderA - orderB;
    });
  }, [state.sections]);

  const roleInSubject = sortedSections[0]?.templateSection?.roleInSubject || state.userRole;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const handleBack = () => navigate(-1);

  const handlePreviewForm = async () => {
    try {
      const response = await assessmentAPI.getAssessmentFormPreview(assessmentId);
      const previewUrl = response?.previewUrl || response?.url;
      if (previewUrl) {
        window.open(previewUrl, '_blank', 'noopener');
      } else {
        toast.info('No preview available.');
      }
    } catch (error) {
      console.error('Error previewing form:', error);
      toast.error('Failed to load assessment form preview.');
    }
  };

  const handleApprove = async () => {
    if (!assessmentId) {
      toast.error('Assessment ID is missing');
      return;
    }

    try {
      setActionLoading(true);
      const response = await assessmentAPI.approveRejectAssessment(assessmentId, 'APPROVED');
      
      // Get success message from response
      const successMessage = response?.data?.message || response?.message || 'Assessment approved successfully';
      toast.success(successMessage);
      
      // Navigate to Assessment Review Requests page after 1.5 seconds
      setTimeout(() => {
        setActionLoading(false);
        navigate(ROUTES.ASSESSMENT_REVIEW_REQUESTS);
      }, 1500);
    } catch (error) {
      console.error('Error approving assessment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve assessment. Please try again.';
      toast.error(errorMessage);
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    setRejectModalShow(true);
    setRejectComment('');
    setRejectError('');
  };

  const handleRejectConfirm = async () => {
    if (!assessmentId) {
      toast.error('Assessment ID is missing');
      return;
    }

    if (!rejectComment.trim()) {
      setRejectError('Comment is required for rejection');
      return;
    }
    if (rejectComment.length > 1000) {
      setRejectError('Comment must be less than 1000 characters');
      return;
    }

    try {
      setActionLoading(true);
      setRejectError('');
      const response = await assessmentAPI.approveRejectAssessment(assessmentId, 'REJECTED', rejectComment);
      
      // Get success message from response
      const successMessage = response?.data?.message || response?.message || 'Assessment rejected successfully';
      toast.success(successMessage);
      
      setRejectModalShow(false);
      setRejectComment('');
      
      // Navigate to Assessment Review Requests page after 1.5 seconds
      setTimeout(() => {
        setActionLoading(false);
        navigate(ROUTES.ASSESSMENT_REVIEW_REQUESTS);
      }, 1500);
    } catch (error) {
      console.error('Error rejecting assessment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reject assessment. Please try again.';
      setRejectError(errorMessage);
      setActionLoading(false);
    }
  };

  const handleToggleTraineeLock = async () => {
    if (!assessmentId) {
      toast.error('Assessment ID is missing');
      return;
    }

    const currentLockStatus = state.isTraineeLocked;
    const newLockStatus = !currentLockStatus;

    try {
      await assessmentAPI.updateTraineeLock(assessmentId, newLockStatus);
      toast.success(newLockStatus ? 'Trainee locked' : 'Assessment opened for trainee');
      // Refresh sections to update state
      fetchSections();
    } catch (error) {
      console.error('Error updating trainee lock:', error);
      toast.error(error.response?.data?.message || 'Failed to update trainee lock status');
    }
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentId) {
      toast.error('Assessment ID is missing');
      return;
    }

    try {
      const response = await assessmentAPI.submitAssessment(assessmentId);
      const successMessage = response?.data?.message || response?.message || 'Assessment submitted successfully';
      toast.success(successMessage);
      
      // Refresh sections to update state
      setTimeout(() => {
        fetchSections();
      }, 1000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit assessment';
      toast.error(errorMessage);
    }
  };

  // Check if Submit button should be shown
  const canShowSubmitButton = () => {
    // Điều kiện 1: Assessment status phải là READY_TO_SUBMIT
    if (state.assessmentInfo?.status !== 'READY_TO_SUBMIT') {
      return false;
    }

    // Điều kiện 2 & 3: Tìm sections có isSubmittable = true và assessedBy.id = user.id
    const hasEligibleSection = state.sections.some(section => {
      return section.templateSection?.isSubmittable === true && 
             section.assessedBy?.id === user?.id;
    });

    return hasEligibleSection;
  };

  const handleUpdateSection = (section) => {
    if (!section) return;
    if (!section.canUpdated) {
      toast.info('This section cannot be updated right now.');
      return;
    }
    toast.info(`Update section ${section.templateSection?.label || section.id}`);
  };

  return (
    <div className="assessment-sections-shell">
      <Container fluid className="py-4 assessment-sections-page">
        <div className="assessment-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <Button variant="outline-secondary" onClick={handleBack} className="assess-back-btn">
            <ArrowLeft size={16} className="me-2" />
            Back
          </Button>
          <div className="assessment-pill">Assessment Details</div>
          <Button variant="custom-purple" className="assess-preview-btn" onClick={handlePreviewForm}>
            Assessment Form Preview
          </Button>
        </div>

        <Card className="assessment-details-card shadow-sm">
          <Card.Body>
            {state.loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : state.error ? (
              <Alert variant="danger" className="mb-0">
                {state.error}
              </Alert>
            ) : (
              <>
                <AssessmentOverview
                  assessmentInfo={state.assessmentInfo}
                  roleInSubject={roleInSubject}
                  formatDate={formatDate}
                />

                {sortedSections.length === 0 ? (
                  <div className="text-center text-muted py-4">No sections available.</div>
                ) : (
                  <div className="assessment-section-column">
                    {sortedSections.map((section) => (
                      <AssessmentSectionCard
                        key={section.id}
                        section={section}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {!isTrainee && (
          <div className="assessment-footer-actions mt-4">
            {isTrainer && (
              <Button
                variant={state.isTraineeLocked ? 'outline-primary' : 'outline-danger'}
                className="footer-btn"
                onClick={handleToggleTraineeLock}
              >
                {state.isTraineeLocked ? 'Open For Trainee' : 'Lock Trainee'}
              </Button>
            )}
            {isDepartmentHead && state.assessmentInfo?.status === 'SUBMITTED' && (
              <>
                <PermissionWrapper 
                  permissions={[PERMISSION_IDS.APPROVE_OR_REJECT_ASSESSMENT]}
                  fallback={null}
                >
                  <Button
                    variant="success"
                    className="footer-btn"
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="me-2" size={16} />
                        Approve
                      </>
                    )}
                  </Button>
                </PermissionWrapper>
                <PermissionWrapper 
                  permissions={[PERMISSION_IDS.APPROVE_OR_REJECT_ASSESSMENT]}
                  fallback={null}
                >
                  <Button
                    variant="danger"
                    className="footer-btn"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="me-2" size={16} />
                        Reject
                      </>
                    )}
                  </Button>
                </PermissionWrapper>
              </>
            )}
            {canShowSubmitButton() && (
              <Button
                variant="primary"
                className="footer-btn submit-btn"
                onClick={handleSubmitAssessment}
              >
                Submit Assessment
              </Button>
            )}
          </div>
        )}

        {/* Reject Modal */}
        <Modal show={rejectModalShow} onHide={() => {
          setRejectModalShow(false);
          setRejectComment('');
          setRejectError('');
        }} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reject Assessment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info" className="mb-3">
              <strong>Note:</strong> Leave a comment to let the Trainers know what is wrong with the Assessment! An Email will be sent to them shortly after rejection.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label>Comment <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={rejectComment}
                onChange={(e) => {
                  setRejectComment(e.target.value);
                  setRejectError('');
                }}
                placeholder="Enter your comment here..."
                maxLength={1000}
                isInvalid={!!rejectError}
              />
              <Form.Text className="text-muted">
                {rejectComment.length}/1000 characters
              </Form.Text>
              {rejectError && (
                <Form.Control.Feedback type="invalid">
                  {rejectError}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setRejectModalShow(false);
                setRejectComment('');
                setRejectError('');
              }} 
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Rejecting...
                </>
              ) : (
                'Reject Assessment'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default TrainerAssessmentSectionsPage;

