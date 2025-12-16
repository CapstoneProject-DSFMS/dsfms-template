import React, { useState } from 'react';
import { Modal, Badge, ListGroup, Collapse } from 'react-bootstrap';
import { 
  X, 
  FileText, 
  Person,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight
} from 'react-bootstrap-icons';

const GlobalFieldDetailModal = ({ show, onHide, field }) => {
  const [showChildren, setShowChildren] = useState(false);
  
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
              <div className="d-flex align-items-start mb-2">
                <FileText className="text-primary-custom me-3 mt-1" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-2">Options</strong>
                  {field.options?.items && Array.isArray(field.options.items) && field.options.items.length > 0 ? (
                    <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                      {field.options.items.map((item, idx) => {
                        // Handle both object format {label, value} and string format
                        const isObject = typeof item === 'object' && item !== null;
                        const label = isObject ? (item.label || 'N/A') : (item || 'N/A');
                        const value = isObject ? (item.value || 'N/A') : (item || 'N/A');
                        
                        return (
                          <div key={idx} className="mb-2 pb-2" style={{ paddingLeft: '0.5rem', borderBottom: idx !== field.options.items.length - 1 ? '1px solid #dee2e6' : 'none' }}>
                            <div className="d-flex align-items-start justify-content-between gap-2">
                              <div className="flex-grow-1">
                                {isObject && (
                                  <div className="mb-1">
                                    <small className="text-muted d-block">Label</small>
                                  </div>
                                )}
                                <span className="text-dark fw-medium">{label}</span>
                              </div>
                              {isObject && (
                                <div>
                                  <small className="text-muted d-block">Value</small>
                                  <code className="text-dark" style={{ fontSize: '0.9rem', backgroundColor: '#e9ecef', padding: '0.35rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                                    {value}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted">No options available</span>
                  )}
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
            <ListGroup.Item className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center mb-2">
                <Clock className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <strong className="text-muted small d-block mb-1">Updated At</strong>
                  <span className="text-dark">{formatDateTime(field.updatedAt)}</span>
                </div>
              </div>
            </ListGroup.Item>
          )}

          {/* Children Fields Section */}
          {(field.children && Array.isArray(field.children) && field.children.length > 0) && (
            <ListGroup.Item className="px-0 py-3">
              <div 
                className="d-flex align-items-center mb-2 cursor-pointer"
                onClick={() => setShowChildren(!showChildren)}
                style={{ cursor: 'pointer' }}
              >
                <FileText className="text-primary-custom me-3" size={20} />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <strong className="text-muted small d-block mb-1">Children Fields</strong>
                      <span className="text-dark">
                        {field.children.length} child{field.children.length !== 1 ? 'ren' : ''}
                      </span>
                    </div>
                    <div className="ms-2">
                      {showChildren ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                </div>
              </div>
              <Collapse in={showChildren}>
                <div className="mt-3">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    {field.children.map((child, idx) => (
                      <div key={child.id || idx} className="mb-3 pb-3 border-bottom" style={{ paddingLeft: '1rem' }}>
                        <div className="d-flex align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <strong className="me-2">{child.label || 'N/A'}</strong>
                              <Badge bg="secondary" className="me-2">
                                {child.fieldType || 'TEXT'}
                              </Badge>
                            </div>
                            <code className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {child.fieldName || 'N/A'}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Collapse>
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

