import React from 'react';
import PropTypes from 'prop-types';
import { Card, Badge, Button } from 'react-bootstrap';
import {
  CheckCircleFill,
  XCircleFill,
  ClipboardCheck
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const AssessmentSectionCard = ({ section }) => {
  const navigate = useNavigate();
  
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

  const getSectionStatusBadge = () => {
    if (section.canAssessed) {
      return <Badge bg="primary">Requires Assess</Badge>;
    }
    return <Badge bg="secondary">Assessed</Badge>;
  };

  // Only check canAssessed for styling (change color), but still allow action
  const isDisabled = !section.canAssessed;

  const handleAssessSection = () => {
    if (section.id) {
      navigate(ROUTES.ASSESSMENTS_SECTION_FIELDS(section.id));
    }
  };

  return (
    <Card className={`assessment-section-card ${isDisabled ? 'disabled' : ''}`}>
      <Card.Body>
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
                variant="primary"
                size="sm"
                onClick={handleAssessSection}
                className="d-flex align-items-center"
                style={{ gap: '0.5rem' }}
              >
                <ClipboardCheck size={14} />
                Assess
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
  );
};

AssessmentSectionCard.propTypes = {
  section: PropTypes.object.isRequired
};

export default AssessmentSectionCard;

