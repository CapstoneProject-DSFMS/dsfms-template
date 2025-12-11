import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { X, FileText, Eye, Building, Person, CheckCircle, ArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'react-toastify';
import { templateAPI } from '../../../api';
import { LoadingSkeleton } from '../../Common';
import { convertBackendToFrontendSections } from '../../../utils/templateBuilder';
import TemplateDetailModal from './TemplateDetailModal';
import '../../../styles/published-templates-modal.css';

const PublishedTemplatesModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (show) {
      loadPublishedTemplates();
    }
  }, [show]);

  const loadPublishedTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplates({ status: 'PUBLISHED' });
      
      let templatesData = [];
      if (response.success && response.data) {
        templatesData = response.data;
      } else if (Array.isArray(response)) {
        templatesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        templatesData = response.data;
      }
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading published templates:', error);
      toast.error('Failed to load published templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (template) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleCreateVersion = async (template) => {
    try {
      // Load full template details with sections
      const fullTemplate = await templateAPI.getTemplateById(template.id);
      
      if (!fullTemplate || !fullTemplate.data) {
        toast.error('Failed to load template details');
        return;
      }

      const templateData = fullTemplate.data;
      const templateForm = templateData.templateForm || templateData;
      const backendSections = templateData.sections || [];

      // Convert backend sections to frontend format
      const frontendSections = convertBackendToFrontendSections(backendSections);

      // Clear currentTemplateId and id before creating new version to prevent conflicts
      localStorage.removeItem('currentTemplateId');
      console.log('🗑️ Cleared currentTemplateId before creating new version');

      // Prepare template info for editor
      const editorTemplateInfo = {
        id: null, // Clear id field to prevent using old draft ID
        currentTemplateId: null, // Clear currentTemplateId (will be set after first save)
        originalTemplateId: template.id, // Store original template ID for create-version API
        name: templateForm.name || template.name,
        description: templateForm.description || template.description,
        departmentId: templateForm.departmentId || template.departmentId,
        templateContent: templateForm.templateContent || '',
        templateConfig: templateForm.templateConfig || '',
        importType: 'Create Version',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('templateInfo', JSON.stringify(editorTemplateInfo));
      console.log('💾 Template info saved for version creation:', editorTemplateInfo);
      console.log('📋 Frontend sections:', frontendSections);

      // Navigate to editor with initial sections
      navigate(ROUTES.TEMPLATES_EDITOR, {
        state: {
          documentUrl: templateForm.templateConfig || templateForm.templateContent || '',
          fileName: templateForm.name || 'Untitled Document',
          importType: 'Create Version',
          templateInfo: editorTemplateInfo,
          initialSections: frontendSections // Pass sections to editor
        }
      });

      onHide();
      toast.success('Template loaded. You can now create a new version.');
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to load template for version creation');
    }
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
    <>
      <Modal 
        show={show} 
        onHide={onHide} 
        size="xl" 
        centered
        className="published-templates-modal"
        fullscreen="md-down"
      >
        <Modal.Header className="bg-primary-custom text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <FileText className="me-2" size={20} />
            Create New Template's Version
          </Modal.Title>
          <Button
            variant="link"
            onClick={onHide}
            className="text-white p-0 ms-auto"
            style={{ fontSize: '1.5rem', lineHeight: 1 }}
          >
            <X size={24} />
          </Button>
        </Modal.Header>

        <Modal.Body 
          style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
          className="published-templates-modal-body"
        >
          {loading ? (
            <LoadingSkeleton />
          ) : templates.length === 0 ? (
            <div className="text-center py-5">
              <FileText size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No published templates found</h5>
              <p className="text-muted">
                There are no published templates available to create a new version.
              </p>
            </div>
          ) : (
            <Row className="g-3">
              {templates.map((template) => (
                <Col key={template.id} xs={12} sm={6} md={6} lg={4}>
                  <Card
                    className="h-100 border-0 shadow-sm template-card"
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
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
                            lineHeight: '1.4'
                          }}
                          title={template.description || 'No description'}
                        >
                          {template.description || 'No description'}
                        </p>
                      </div>

                      {/* Department and Status */}
                      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0 }}>
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
                        <Badge bg="success" className="d-flex align-items-center gap-1">
                          <CheckCircle size={12} />
                          PUBLISHED
                        </Badge>
                      </div>

                      {/* Created By and Date */}
                      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0 }}>
                        <div className="d-flex align-items-center" style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <Person size={12} className="text-muted me-1 flex-shrink-0" />
                          <small 
                            className="text-muted text-truncate" 
                            style={{ maxWidth: '120px' }}
                            title={`${template.createdByUser?.firstName || ''} ${template.createdByUser?.lastName || ''}`.trim()}
                          >
                            {template.createdByUser?.firstName} {template.createdByUser?.lastName}
                          </small>
                        </div>
                        <small className="text-muted flex-shrink-0 ms-2">{formatDate(template.createdAt)}</small>
                      </div>

                      {/* Footer with Sections and Actions */}
                      <div className="mt-auto pt-2 border-top" style={{ flexShrink: 0 }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <small className="text-muted d-flex align-items-center">
                            <FileText size={12} className="me-1" />
                            {template._count?.sections || 0} sections
                          </small>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-primary-custom"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(template);
                            }}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            <Eye size={14} className="me-1" />
                            View Detail
                          </Button>
                        </div>
                        <Button
                          variant="primary-custom"
                          size="sm"
                          className="w-100 d-flex align-items-center justify-content-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateVersion(template);
                          }}
                        >
                          <ArrowRight size={14} className="me-2" />
                          Create New Version
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Template Detail Modal */}
      <TemplateDetailModal
        show={showDetailModal}
        onHide={() => {
          setShowDetailModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onCreateVersion={(template) => {
          setShowDetailModal(false);
          handleCreateVersion(template);
        }}
        onTemplateStatusChange={loadPublishedTemplates}
      />
    </>
  );
};

export default PublishedTemplatesModal;

