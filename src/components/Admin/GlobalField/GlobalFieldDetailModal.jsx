import React from 'react';
import { Modal, Badge, ListGroup } from 'react-bootstrap';
import { 
  X, 
  FileText, 
  Person,
  Calendar,
  Clock
} from 'react-bootstrap-icons';

const GlobalFieldDetailModal = ({ show, onHide, field }) => {
  if (!field) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getFieldTypeBadge = (fieldType) => {
    const config = {
      'TEXT': { variant: 'primary', text: 'TEXT' },
      'NUMBER': { variant: 'info', text: 'NUMBER' },
      'DATE': { variant: 'success', text: 'DATE' },
      'SELECT': { variant: 'warning', text: 'SELECT' },
      'CHECKBOX': { variant: 'secondary', text: 'CHECKBOX' }
    };
    
    const typeConfig = config[fieldType] || { variant: 'secondary', text: fieldType || 'N/A' };
    return (
      <Badge bg={typeConfig.variant} className="px-2 py-1">
        {typeConfig.text}
      </Badge>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="md" 
      centered
      fullscreen="md-down"
    >
      <Modal.Header 
        className="bg-primary-custom text-white border-0 d-flex align-items-center justify-content-between"
        style={{ 
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem',
          padding: '1.25rem 1.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0">
          <FileText className="me-2" size={20} />
          <span>Global Field Detail</span>
        </Modal.Title>
        <button 
          onClick={onHide} 
          className="btn btn-link text-white p-0"
          style={{ 
            border: 'none', 
            background: 'none', 
            opacity: 0.9
          }}
        >
          <X size={24} />
        </button>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
        <ListGroup variant="flush">
          <ListGroup.Item className="px-0 py-3 border-bottom">
            <div className="d-flex align-items-center mb-2">
              <FileText className="text-primary-custom me-3" size={20} />
              <div className="flex-grow-1">
                <strong className="text-muted small d-block mb-1">Label</strong>
                <span className="text-dark fw-medium">{field.label || 'N/A'}</span>
              </div>
            </div>
          </ListGroup.Item>

          <ListGroup.Item className="px-0 py-3 border-bottom">
            <div className="d-flex align-items-center mb-2">
              <FileText className="text-primary-custom me-3" size={20} />
              <div className="flex-grow-1">
                <strong className="text-muted small d-block mb-1">Field Name</strong>
                <code className="text-dark" style={{ 
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bs-neutral-200)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {field.fieldName || 'N/A'}
                </code>
              </div>
            </div>
          </ListGroup.Item>

          <ListGroup.Item className="px-0 py-3 border-bottom">
            <div className="d-flex align-items-center mb-2">
              <FileText className="text-primary-custom me-3" size={20} />
              <div className="flex-grow-1">
                <strong className="text-muted small d-block mb-1">Field Type</strong>
                <div>{getFieldTypeBadge(field.fieldType)}</div>
              </div>
            </div>
          </ListGroup.Item>

          {field.roleRequired && (
            <ListGroup.Item className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center mb-2">
                <FileText className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Role Required</strong>
                  <Badge bg="secondary">{field.roleRequired}</Badge>
                </div>
              </div>
            </ListGroup.Item>
          )}

          {field.options && (
            <ListGroup.Item className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center mb-2">
                <FileText className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Options</strong>
                  <span className="text-dark">{JSON.stringify(field.options)}</span>
                </div>
              </div>
            </ListGroup.Item>
          )}

          {field.createdBy && (
            <ListGroup.Item className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center mb-2">
                <Person className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Created By</strong>
                  <span className="text-dark">
                    {field.createdBy.firstName} {field.createdBy.lastName}
                  </span>
                </div>
              </div>
            </ListGroup.Item>
          )}

          {field.createdAt && (
            <ListGroup.Item className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center mb-2">
                <Calendar className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Created At</strong>
                  <span className="text-dark">{formatDateTime(field.createdAt)}</span>
                </div>
              </div>
            </ListGroup.Item>
          )}

          {field.updatedBy && (
            <ListGroup.Item className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center mb-2">
                <Person className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Updated By</strong>
                  <span className="text-dark">
                    {field.updatedBy.firstName} {field.updatedBy.lastName}
                  </span>
                </div>
              </div>
            </ListGroup.Item>
          )}

          {field.updatedAt && (
            <ListGroup.Item className="px-0 py-3">
              <div className="d-flex align-items-center mb-2">
                <Clock className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Updated At</strong>
                  <span className="text-dark">{formatDateTime(field.updatedAt)}</span>
                </div>
              </div>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-0">
        <button 
          onClick={onHide}
          className="btn btn-secondary"
          style={{
            backgroundColor: 'var(--bs-secondary)',
            borderColor: 'var(--bs-secondary)',
            color: '#ffffff'
          }}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default GlobalFieldDetailModal;

