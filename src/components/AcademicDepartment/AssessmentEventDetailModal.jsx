import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { 
  CalendarEvent, 
  X,
  Calendar,
  People,
  Book,
  FileText
} from 'react-bootstrap-icons';

const AssessmentEventDetailModal = ({ 
  show, 
  onClose, 
  event
}) => {
  if (!event) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusUpper = String(status || '').toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
      case 'SCHEDULED':
      case 'UPCOMING':
      case 'NOT_STARTED':
        return 'success';
      case 'COMPLETED':
      case 'FINISHED':
        return 'info';
      case 'CANCELLED':
      case 'CANCELED':
        return 'danger';
      case 'ONGOING':
      case 'IN_PROGRESS':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const entityType = event.entityInfo?.type || '-';
  const entityName = event.entityInfo?.name || '-';
  const entityCode = event.entityInfo?.code || '-';
  const entityId = event.entityInfo?.id || '-';

  const templateName = event.templateInfo?.name || '-';
  const templateId = event.templateInfo?.id || '-';
  const templateIsActive = event.templateInfo?.isActive ?? false;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg" 
      centered
      dialogClassName="assessment-event-detail-modal"
    >
      <Modal.Header 
        className="bg-primary-custom text-white border-0"
        style={{
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0">
          <CalendarEvent className="me-2" size={20} />
          Assessment Event Details
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onClose} 
          className="text-white p-0 ms-auto"
          style={{ 
            border: 'none', 
            background: 'none',
            opacity: 0.9
          }}
        >
          <X size={24} color="#ffffff" />
        </Button>
      </Modal.Header>
      
      <Modal.Body 
        className="p-4"
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: 'var(--bs-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Basic Information Card */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--bs-neutral-200)', marginBottom: '0 !important' }}>
          <Card.Header 
            className="bg-primary-custom text-white d-flex align-items-center"
            style={{ 
              backgroundColor: 'var(--bs-primary)',
              borderBottom: 'none'
            }}
          >
            <FileText className="me-2" size={18} />
            <span className="fw-semibold">Basic Information</span>
          </Card.Header>
          <Card.Body className="p-3" style={{ backgroundColor: '#ffffff' }}>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Event Name
                  </h6>
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--bs-dark)' }}>
                    {event.name || '-'}
                  </p>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1 d-flex align-items-center" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    <Calendar className="me-2" size={16} style={{ color: 'var(--bs-primary)' }} />
                    Occurrence Date
                  </h6>
                  <span style={{ color: 'var(--bs-dark)' }}>
                    {formatDate(event.occuranceDate || event.occurrenceDate)}
                  </span>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Status
                  </h6>
                  <Badge bg={getStatusBadgeColor(event.status)} className="px-3 py-2">
                    {event.status || '-'}
                  </Badge>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1 d-flex align-items-center" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    <People className="me-2" size={16} style={{ color: 'var(--bs-primary)' }} />
                    Total Trainees
                  </h6>
                  <Badge bg="info" className="px-3 py-2">
                    {event.totalTrainees || 0}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Entity Information Card */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--bs-neutral-200)', marginBottom: '0 !important' }}>
          <Card.Header 
            className="bg-primary-custom text-white d-flex align-items-center"
            style={{ 
              backgroundColor: 'var(--bs-primary)',
              borderBottom: 'none'
            }}
          >
            <Book className="me-2" size={18} />
            <span className="fw-semibold">
              {entityType === 'course' ? 'Course Information' : entityType === 'subject' ? 'Subject Information' : 'Entity Information'}
            </span>
          </Card.Header>
          <Card.Body className="p-3" style={{ backgroundColor: '#ffffff' }}>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Name
                  </h6>
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--bs-dark)' }}>
                    {entityName}
                  </p>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Code
                  </h6>
                  <Badge bg="secondary" className="px-2 py-1">
                    {entityCode}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Type
                  </h6>
                  <Badge 
                    bg={entityType === 'course' ? 'primary' : entityType === 'subject' ? 'info' : 'secondary'} 
                    className="px-2 py-1"
                  >
                    {entityType.toUpperCase()}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Template Information Card */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--bs-neutral-200)', marginBottom: '0 !important' }}>
          <Card.Header 
            className="bg-primary-custom text-white d-flex align-items-center"
            style={{ 
              backgroundColor: 'var(--bs-primary)',
              borderBottom: 'none'
            }}
          >
            <FileText className="me-2" size={18} />
            <span className="fw-semibold">Template Information</span>
          </Card.Header>
          <Card.Body className="p-3" style={{ backgroundColor: '#ffffff' }}>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Template Name
                  </h6>
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--bs-dark)' }}>
                    {templateName}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Status
                  </h6>
                  <Badge bg={templateIsActive ? 'success' : 'danger'} className="px-2 py-1">
                    {templateIsActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>
      
      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssessmentEventDetailModal;

