import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Upload, FileText, FileEarmark, Eye, CheckCircle, Clock, Building, Person } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { PermissionWrapper, LoadingSkeleton } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';
import { templateAPI } from '../../../api';
import ImportFileModal from '../../../components/Admin/Forms/ImportFileModal';
import TemplatePreviewModal from '../../../components/Admin/Forms/TemplatePreviewModal';

const FormsPage = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplates();
      
      // Handle response structure: { success: true, data: [...] }
      if (response.success && response.data) {
        setTemplates(response.data);
      } else if (Array.isArray(response)) {
        setTemplates(response);
      } else if (response.data && Array.isArray(response.data)) {
        setTemplates(response.data);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = () => {
    setShowImportModal(true);
  };

  const handleImportSuccess = (importType, fileName) => {
    toast.success(`${importType} file "${fileName}" imported successfully!`, { icon: false });
    setShowImportModal(false);
    loadTemplates(); // Reload templates after successful import
  };

  const handleImportError = (error) => {
    toast.error(`Import failed: ${error}`, { icon: false });
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
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

  return (
    <Container fluid className="py-4 forms-page form-component">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="border-neutral-200 forms-page-header" style={{backgroundColor: '#1b3c53'}}>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <FileText className="me-2 text-white" size={24} />
                <h4 className="mb-0 text-white">Form Templates</h4>
              </div>
            </Col>
            <Col xs="auto">
              <PermissionWrapper 
                permission={API_PERMISSIONS.TEMPLATES.CREATE}
                fallback={null}
              >
                <Button
                  variant="primary-custom"
                  onClick={handleImportFile}
                  className="d-flex align-items-center"
                  size="sm"
                >
                  <Upload className="me-2" size={16} />
                  Create New Template
                </Button>
              </PermissionWrapper>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <LoadingSkeleton />
          ) : templates.length === 0 ? (
            <Row className="mb-4">
              <Col>
                <div className="text-center py-5">
                  <FileEarmark size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No form templates found</h5>
                  <p className="text-muted mb-4">
                    Get started by creating a new form or importing an existing file.
                  </p>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="g-4">
              {templates.map((template) => (
                <Col key={template.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    className="h-100 border-0 shadow-sm template-card"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handlePreviewTemplate(template)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div 
                            className="bg-primary-custom text-white rounded d-flex align-items-center justify-content-center me-2"
                            style={{ width: '40px', height: '40px', minWidth: '40px' }}
                          >
                            <FileText size={20} />
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <h6 
                              className="mb-0 fw-bold text-truncate" 
                              style={{ fontSize: '0.95rem' }}
                              title={template.name}
                            >
                              {template.name}
                            </h6>
                            <small className="text-muted">v{template.version}</small>
                          </div>
                        </div>
                      </div>
                      
                      <p 
                        className="text-muted mb-2" 
                        style={{ 
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.5em'
                        }}
                        title={template.description}
                      >
                        {template.description || 'No description'}
                      </p>

                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <Building size={12} className="text-muted me-1" />
                          <small className="text-muted">{template.department?.code || 'N/A'}</small>
                        </div>
                        {getStatusBadge(template.status)}
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Person size={12} className="text-muted me-1" />
                          <small className="text-muted">
                            {template.createdByUser?.firstName} {template.createdByUser?.lastName}
                          </small>
                        </div>
                        <small className="text-muted">{formatDate(template.createdAt)}</small>
                      </div>

                      <div className="mt-2 pt-2 border-top">
                        <div className="d-flex align-items-center justify-content-between">
                          <small className="text-muted">
                            <FileText size={12} className="me-1" />
                            {template._count?.sections || 0} sections
                          </small>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-primary-custom"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTemplate(template);
                            }}
                          >
                            <Eye size={14} className="me-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Import File Modal */}
          <ImportFileModal
            show={showImportModal}
            onHide={() => setShowImportModal(false)}
            onImportSuccess={handleImportSuccess}
            onImportError={handleImportError}
          />

          {/* Template Preview Modal */}
          <TemplatePreviewModal
            show={showPreviewModal}
            onHide={() => {
              setShowPreviewModal(false);
              setSelectedTemplate(null);
            }}
            template={selectedTemplate}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormsPage;
