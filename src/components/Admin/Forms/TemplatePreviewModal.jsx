import React, { useState } from 'react';
import { Modal, Button, Badge, Tab, Nav, Row, Col, Card } from 'react-bootstrap';
import { 
  X, 
  FileText, 
  Eye, 
  Code, 
  FileEarmarkPdf,
  Calendar,
  Person,
  Building,
  CheckCircle,
  Clock,
  Download
} from 'react-bootstrap-icons';

const TemplatePreviewModal = ({ show, onHide, template }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!template) return null;

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', icon: Clock, text: 'PENDING' },
      'PUBLISHED': { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' },
      'DRAFT': { variant: 'secondary', icon: FileText, text: 'DRAFT' },
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

  const renderSchemaPreview = () => {
    if (!template.templateSchema) return <p className="text-muted">No schema data available</p>;
    
    return (
      <div className="schema-preview">
        <pre className="bg-light p-3 rounded" style={{ fontSize: '0.85rem', maxHeight: '400px', overflow: 'auto' }}>
          {JSON.stringify(template.templateSchema, null, 2)}
        </pre>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="template-overview">
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <FileText className="text-primary-custom me-2" size={20} />
                <h6 className="mb-0">Template Name</h6>
              </div>
              <p className="mb-0 fw-bold">{template.name}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <Building className="text-primary-custom me-2" size={20} />
                <h6 className="mb-0">Department</h6>
              </div>
              <p className="mb-0">{template.department?.name || 'N/A'}</p>
              <small className="text-muted">{template.department?.code || ''}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <h6 className="mb-3">Description</h6>
          <p className="text-muted mb-0">{template.description || 'No description provided'}</p>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <CheckCircle className="text-primary-custom me-2" size={20} />
                <h6 className="mb-0">Status</h6>
              </div>
              {getStatusBadge(template.status)}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <FileText className="text-primary-custom me-2" size={20} />
                <h6 className="mb-0">Version</h6>
              </div>
              <p className="mb-0 fw-bold">v{template.version}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <FileText className="text-primary-custom me-2" size={20} />
                <h6 className="mb-0">Sections</h6>
              </div>
              <p className="mb-0 fw-bold">{template._count?.sections || 0}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mt-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <Person className="text-primary-custom me-2" size={20} />
                <h6 className="mb-0">Created By</h6>
              </div>
              <p className="mb-0">
                {template.createdByUser?.firstName} {template.createdByUser?.lastName}
              </p>
              <small className="text-muted">{formatDate(template.createdAt)}</small>
            </Card.Body>
          </Card>
        </Col>
        {template.reviewedByUserId && (
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <CheckCircle className="text-primary-custom me-2" size={20} />
                  <h6 className="mb-0">Reviewed</h6>
                </div>
                <p className="mb-0">{formatDate(template.reviewedAt)}</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );

  const renderContentPreview = () => {
    if (template.templateContent && template.templateContent.startsWith('http')) {
      return (
        <div className="content-preview">
          <div className="alert alert-info">
            <FileEarmarkPdf className="me-2" />
            Template content is stored as a file. 
            <a href={template.templateContent} target="_blank" rel="noopener noreferrer" className="ms-2">
              View/Download File
            </a>
          </div>
          <iframe 
            src={template.templateContent} 
            style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}
            title="Template Content Preview"
          />
        </div>
      );
    }
    
    return (
      <div className="content-preview">
        <div 
          className="border rounded p-4 bg-white"
          style={{ minHeight: '400px' }}
          dangerouslySetInnerHTML={{ 
            __html: template.templateContent || '<p class="text-muted">No content available</p>'
          }}
        />
      </div>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered 
      className="template-preview-modal"
    >
      <Modal.Header className="bg-gradient-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Eye className="me-2" size={20} />
          Template Preview: {template.name}
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide} 
          className="text-white p-0 ms-auto"
          style={{ border: 'none', background: 'none' }}
        >
          <X size={24} />
        </Button>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="overview">
                <FileText className="me-2" size={16} />
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="content">
                <Eye className="me-2" size={16} />
                Content Preview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="schema">
                <Code className="me-2" size={16} />
                Schema
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="overview">
              {renderOverview()}
            </Tab.Pane>
            <Tab.Pane eventKey="content">
              {renderContentPreview()}
            </Tab.Pane>
            <Tab.Pane eventKey="schema">
              {renderSchemaPreview()}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        {template.templateContent && template.templateContent.startsWith('http') && (
          <Button 
            variant="primary-custom" 
            href={template.templateContent} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="me-2" size={16} />
            Download File
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TemplatePreviewModal;

