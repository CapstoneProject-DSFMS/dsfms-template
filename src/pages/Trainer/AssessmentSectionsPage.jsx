import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import assessmentAPI from '../../api/assessment';
import AssessmentOverview from '../../components/Trainer/AssessmentOverview';
import AssessmentSectionCard from '../../components/Trainer/AssessmentSectionCard';
import '../../styles/assessment-sections.css';

const TrainerAssessmentSectionsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTrainee = user?.role === 'TRAINEE';
  const [state, setState] = useState({
    loading: true,
    error: null,
    assessmentInfo: null,
    sections: [],
    userRole: null
  });

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
        userRole: response?.userRole || null
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

  const handleViewTraineeSections = () => {
    toast.info('Viewing trainee sections (mock).');
  };

  const handleOpenForTrainee = async () => {
    if (!assessmentId) {
      toast.error('Assessment ID is missing');
      return;
    }

    try {
      await assessmentAPI.updateTraineeLock(assessmentId, true);
      toast.success('Assessment opened for trainee');
      // Optionally refresh sections to update state
      fetchSections();
    } catch (error) {
      console.error('Error opening assessment for trainee:', error);
      toast.error(error.response?.data?.message || 'Failed to open assessment for trainee');
    }
  };

  const handleSubmitAssessment = () => {
    toast.success('Assessment submitted (mock).');
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
                        formatDate={formatDate}
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
            <Button
              variant="outline-secondary"
              className="footer-btn"
              onClick={handleViewTraineeSections}
            >
              View Trainee Section
            </Button>
            <Button
              variant="outline-primary"
              className="footer-btn"
              onClick={handleOpenForTrainee}
            >
              Open For Trainee
            </Button>
            <Button
              variant="primary"
              className="footer-btn submit-btn"
              onClick={handleSubmitAssessment}
            >
              Submit Assessment
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default TrainerAssessmentSectionsPage;

