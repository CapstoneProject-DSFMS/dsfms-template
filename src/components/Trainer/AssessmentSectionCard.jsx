import React from 'react';
import PropTypes from 'prop-types';
import { Card, Badge } from 'react-bootstrap';
import {
  CheckCircleFill,
  XCircleFill,
  ThreeDotsVertical,
  ArrowClockwise
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { PortalUnifiedDropdown } from '../Common';

const AssessmentSectionCard = ({ section, formatDate }) => {
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
      return <Badge bg="primary">Ready</Badge>;
    }
    if (section.canUpdated) {
      return <Badge bg="warning">Pending Update</Badge>;
    }
    return <Badge bg="secondary">Locked</Badge>;
  };

  const isDisabled = !section.canAssessed;
  const showUpdate = !section.canAssessed && section.canUpdated;

  // Build dropdown items based on state
  const dropdownItems = [];
  
  const handleAssessSection = () => {
    if (section.id) {
      navigate(ROUTES.ASSESSMENTS_SECTION_FIELDS(section.id));
    }
  };

  const handleUpdateSection = () => {
    if (section.id) {
      navigate(ROUTES.ASSESSMENTS_SECTION_FIELDS(section.id));
    }
  };
  
  // Only show "Assess Section" if canAssessed is true
  if (section.canAssessed) {
    dropdownItems.push({
      label: 'Assess Section',
      icon: <ArrowClockwise size={14} />,
      onClick: handleAssessSection
    });
  }

  // Only show "Update Section" if canAssessed = false AND canUpdated = true
  if (showUpdate) {
    dropdownItems.push({
      label: 'Update Section',
      icon: <ArrowClockwise size={14} />,
      onClick: handleUpdateSection
    });
  }

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
              <div className="flag-item">
                <small className="text-uppercase text-muted">Submittable</small>
                {getBooleanIcon(section.templateSection?.isSubmittable)}
              </div>
              <div className="flag-item">
                <small className="text-uppercase text-muted">Toggle Dependent</small>
                {getBooleanIcon(section.templateSection?.isToggleDependent)}
              </div>
            </div>

            <div className="section-actions">
              {getSectionStatusBadge()}
              {dropdownItems.length > 0 && (
                <PortalUnifiedDropdown
                  align="end"
                  className="section-action-dropdown"
                  placement="bottom-end"
                  disabled={isDisabled && !showUpdate}
                  trigger={{
                    variant: 'link',
                    className: 'btn btn-link p-0 text-primary-custom',
                    style: { border: 'none', background: 'transparent' },
                    children: <ThreeDotsVertical size={18} />
                  }}
                  items={dropdownItems}
                />
              )}
            </div>
          </div>

          <div className="section-subtext">
            <small className="text-muted">
              Created: {formatDate(section.createdAt)}
            </small>
            {section.assessedBy && (
              <span className="ms-3 text-muted">
                <small className="text-uppercase text-muted">Assessed By</small>{' '}
                <span className="fw-semibold">{section.assessedBy?.id || '—'}</span>
              </span>
            )}
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

AssessmentSectionCard.propTypes = {
  section: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired
};

export default AssessmentSectionCard;

