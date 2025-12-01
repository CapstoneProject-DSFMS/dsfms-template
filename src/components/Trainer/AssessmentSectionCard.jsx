import React from 'react';
import PropTypes from 'prop-types';
import { Card, Badge, Button } from 'react-bootstrap';
import {
  CheckCircleFill,
  XCircleFill,
  ClipboardCheck,
  Eye
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const AssessmentSectionCard = ({ section }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!section) return null;

  const getBooleanIcon = (value) => {
    return value ? (
      <span className="text-success d-inline-flex align-items-center">
        <CheckCircleFill size={16} />
      </span>
    ) : (
      <span className="text-danger d-inline-flex align-items-center">
        <XCircleFill size={16} />
      </span>
    );
  };

  // Determine badge and button based on canAssessed and assessedBy
  const isAssessmentRequired = section.canAssessed; // No one assessed yet
  const isCompletedByCurrentUser = !section.canAssessed && section.assessedBy?.id === user?.id;
  const isCompletedByOthers = !section.canAssessed && section.assessedBy?.id !== user?.id;

  const getSectionStatusBadge = () => {
    if (isAssessmentRequired) {
      return <Badge bg="primary">ASSESSMENT REQUIRED</Badge>;
    }
    return <Badge bg="secondary">COMPLETED</Badge>;
  };

  const getButtonText = () => {
    if (isAssessmentRequired) {
      return 'Fill Assessments';
    }
    if (isCompletedByCurrentUser) {
      return 'Update Assessments';
    }
    return 'View Assessments';
  };

  // Only check canAssessed for styling (change color), but still allow action
  const isDisabled = !section.canAssessed;

  const handleAssessSection = () => {
    if (section.id) {
      navigate(ROUTES.ASSESSMENTS_SECTION_FIELDS(section.id));
    }
  };

  return (
    <div className="assessment-section-wrapper" style={{ position: 'relative' }}>
      <Card 
        className={`assessment-section-card ${isDisabled ? 'disabled' : ''}`}
      >
        <Card.Body style={isDisabled ? { filter: 'brightness(0.65)' } : {}}>
          <div className="section-card-header">
            <div className="section-header-grid">
              <div className="section-heading">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="section-order-pill">#{section.templateSection?.displayOrder ?? '-'}</span>
                  <h5 className="mb-0">{section.templateSection?.label || 'Unnamed Section'}</h5>
                </div>
              </div>

              <div className="section-inline-flags">
                <div className="flag-item">
                  <small className="text-uppercase text-muted">Edit By</small>
                  <span className="fw-semibold">{section.templateSection?.editBy || '—'}</span>
                </div>
                {section.templateSection?.editBy !== 'TRAINEE' && (
                  <>
                    <div className="flag-item">
                      <small className="text-uppercase text-muted">Submittable</small>
                      {getBooleanIcon(section.templateSection?.isSubmittable)}
                    </div>
                    <div className="flag-item">
                      <small className="text-uppercase text-muted">Toggle Dependent</small>
                      {getBooleanIcon(section.templateSection?.isToggleDependent)}
                    </div>
                  </>
                )}
              </div>

              <div className="section-actions">
                {getSectionStatusBadge()}
                <Button
                  variant={isCompletedByOthers ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleAssessSection}
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.5rem'
                  }}
                >
                  {isCompletedByOthers ? (
                    <Eye size={14} />
                  ) : (
                    <ClipboardCheck size={14} />
                  )}
                  {getButtonText()}
                </Button>
              </div>
            </div>

            <div className="section-subtext">
              {section.assessedBy && (
                <span className="text-muted">
                  <small className="text-uppercase text-muted">Assessed By</small>{' '}
                  <span className="fw-semibold">
                    {section.assessedBy?.fullName || 
                     (section.assessedBy?.firstName && section.assessedBy?.lastName 
                       ? `${section.assessedBy.firstName} ${section.assessedBy.lastName}` 
                       : section.assessedBy?.id || '—')}
                  </span>
                </span>
              )}
            </div>
          </div>

        </Card.Body>
      </Card>
    </div>
  );
};

AssessmentSectionCard.propTypes = {
  section: PropTypes.object.isRequired
};

export default AssessmentSectionCard;

