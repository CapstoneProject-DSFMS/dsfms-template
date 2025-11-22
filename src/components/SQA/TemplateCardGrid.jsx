import React from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { 
  FileText, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Person
} from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const TemplateCardGrid = ({ 
  templates, 
  onViewDetail
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', icon: Clock, text: 'PENDING' },
      'PUBLISHED': { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' },
      'DENIED': { variant: 'danger', icon: XCircle, text: 'REJECTED' },
      'REJECTED': { variant: 'danger', icon: XCircle, text: 'REJECTED' },
      'DRAFT': { variant: 'secondary', icon: Clock, text: 'DRAFT' },
      'ARCHIVED': { variant: 'dark', icon: FileText, text: 'ARCHIVED' }
    };
    
    const config = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
        <Icon size={12} />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-5">
        <FileText size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No templates found</h5>
        <p className="text-muted">No templates match your current filters.</p>
      </div>
    );
  }

  return (
    <Row className="g-3 g-md-4">
      {templates.map((template) => (
        <Col key={template.id} xs={12} sm={6} md={6} lg={4} xl={3}>
          <Card
            className="h-100 border-0 shadow-sm template-card"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => onViewDetail(template.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }}
          >
            <Card.Body className="p-3 d-flex flex-column" style={{ height: '100%' }}>
              {/* Header with Icon and Title */}
              <div className="d-flex align-items-start mb-2" style={{ height: '60px', flexShrink: 0 }}>
                <div 
                  className="bg-primary-custom text-white rounded d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                  style={{ width: '40px', height: '40px', minWidth: '40px' }}
                >
                  <FileText size={20} />
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <h6 
                    className="mb-1 fw-bold" 
                    style={{ 
                      fontSize: '0.95rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}
                    title={template.name}
                  >
                    {template.name}
                  </h6>
                  <small className="text-muted">v{template.version}</small>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-2" style={{ height: '40px', overflow: 'hidden' }}>
                <p 
                  className="text-muted mb-0" 
                  style={{ 
                    fontSize: '0.85rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    lineHeight: '1.4',
                    height: '100%',
                    margin: 0
                  }}
                  title={template.description || 'No description'}
                >
                  {template.description || 'No description'}
                </p>
              </div>

              {/* Department and Status */}
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0, height: '24px' }}>
                <div className="d-flex align-items-center" style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <Building size={12} className="text-muted me-1 flex-shrink-0" />
                  <small 
                    className="text-muted text-truncate" 
                    style={{ maxWidth: '100px' }}
                    title={template.department?.code || 'N/A'}
                  >
                    {template.department?.code || 'N/A'}
                  </small>
                </div>
                <div className="flex-shrink-0 ms-2">
                  {getStatusBadge(template.status)}
                </div>
              </div>

              {/* Created By and Date */}
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0, height: '24px' }}>
                <div 
                  className="d-flex align-items-center" 
                  style={{ minWidth: 0, flex: '1 1 auto' }}
                >
                  <Person size={12} className="text-muted me-1 flex-shrink-0" />
                  <small 
                    className="text-muted text-truncate" 
                    style={{ maxWidth: '120px' }}
                    title={template.createdByUser?.firstName && template.createdByUser?.lastName
                      ? `${template.createdByUser.firstName} ${template.createdByUser.lastName}`
                      : template.createdBy || 'N/A'}
                  >
                    {template.createdByUser?.firstName && template.createdByUser?.lastName
                      ? `${template.createdByUser.firstName} ${template.createdByUser.lastName}`
                      : template.createdBy || 'N/A'}
                  </small>
                </div>
                <small className="text-muted flex-shrink-0 ms-2">{formatDate(template.createdAt)}</small>
              </div>

              {/* Footer with Sections and View Detail */}
              <div className="mt-auto pt-2 border-top" style={{ flexShrink: 0 }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <small className="text-muted d-flex align-items-center flex-shrink-0">
                    <FileText size={12} className="me-1" />
                    {template._count?.sections || template.sections || 0} sections
                  </small>
                  <PermissionWrapper 
                    permissions={[PERMISSION_IDS.VIEW_TEMPLATE_DETAILS]}
                    fallback={null}
                  >
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-primary-custom flex-shrink-0 ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(template.id);
                      }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Eye size={14} className="me-1" />
                      View Detail
                    </Button>
                  </PermissionWrapper>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TemplateCardGrid;

