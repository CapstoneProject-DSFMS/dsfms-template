import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Clock, CheckCircle, Calendar, Person } from 'react-bootstrap-icons';

const BasicInfoTab = ({ template }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { variant: 'success', icon: CheckCircle, text: 'ACTIVE' };
      case 'DRAFT':
        return { variant: 'warning', icon: Clock, text: 'DRAFT' };
      case 'INACTIVE':
        return { variant: 'secondary', icon: Clock, text: 'INACTIVE' };
      case 'PENDING':
        return { variant: 'warning', icon: Clock, text: 'PENDING' };
      case 'PUBLISHED':
        return { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' };
      case 'REJECTED':
      case 'DENIED':
        return { variant: 'danger', icon: Clock, text: 'REJECTED' };
      default:
        return { variant: 'secondary', icon: Clock, text: status };
    }
  };

  const statusConfig = getStatusConfig(template?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4">
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <label className="text-muted small">Version</label>
            <div>
              <Badge 
                bg="info" 
                className="px-2 py-1"
                style={{ 
                  fontSize: '0.75rem',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2'
                }}
              >
                {template?.version}
              </Badge>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-muted small">Status</label>
            <div>
              <Badge 
                bg={statusConfig.variant} 
                className="px-2 py-1 d-flex align-items-center"
                style={{ 
                  fontSize: '0.75rem',
                  width: 'fit-content'
                }}
              >
                <StatusIcon className="me-1" size={12} />
                {statusConfig.text}
              </Badge>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-muted small">Total Sections</label>
            <div className="fw-medium">{template?.totalSections || 0} sections</div>
          </div>
        </Col>
        
        <Col md={6}>
          <div className="mb-3">
            <label className="text-muted small">Created By</label>
            <div className="d-flex align-items-center">
              <Person className="me-2" size={16} />
              <span>{template?.createdBy || 'N/A'}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-muted small">Created Date</label>
            <div className="d-flex align-items-center">
              <Calendar className="me-2" size={16} />
              <span>{template?.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-muted small">Last Modified</label>
            <div className="d-flex align-items-center">
              <Clock className="me-2" size={16} />
              <span>{template?.lastModified ? new Date(template.lastModified).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BasicInfoTab;


