import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Card, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { 
  ArrowLeft,
  FileEarmarkPdf,
  Clock,
  CheckCircle,
  Calendar,
  Person,
  FileText,
  Download,
  XCircle,
  X
} from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { PermissionWrapper } from '../../components/Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import templateAPI from '../../api/template';
import { toast } from 'react-toastify';

const TemplateDetailPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic-info');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const loadTemplateDetail = useCallback(async () => {
    if (!templateId) {
      setError('Template ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch template detail from API
      const response = await templateAPI.getTemplateById(templateId);
      // Handle response structure: { data: { templateForm: {...}, sections: [...] } } or { data: {...} } or direct {...}
      const templateForm = response?.data?.templateForm || response?.data || response;
      const sectionsData = response?.data?.sections || templateForm?.sections || [];
      
      if (!templateForm) {
        setError('Template not found');
        return;
      }

      // Map API response to component format
      const createdByUser = templateForm.createdByUser || templateForm.createdBy;
      const updatedByUser = templateForm.updatedByUser || templateForm.updatedBy;
      
      const getDisplayName = (user) => {
        if (user?.firstName && user?.lastName) {
          return `${user.firstName} ${user.lastName}`;
        }
        return user?.fullName || user?.name || 'N/A';
      };
      
      const mappedTemplate = {
        id: templateForm.id,
        name: templateForm.name || 'N/A',
        description: templateForm.description || '',
        version: templateForm.version || 'v1.0',
        category: templateForm.category || '',
        totalSections: sectionsData.length || 0,
        totalFields: sectionsData.reduce((total, section) => total + (section.fields?.length || 0), 0) || 0,
        status: templateForm.status || 'DRAFT',
        createdBy: getDisplayName(createdByUser),
        createdAt: templateForm.createdAt || templateForm.createdDate,
        lastModified: templateForm.updatedAt || templateForm.updatedDate || templateForm.createdAt,
        lastModifiedBy: getDisplayName(updatedByUser),
        sections: sectionsData,
        history: templateForm.history || templateForm.versions || [],
        templateContent: templateForm.templateContent || null,
        templateConfig: templateForm.templateConfig || null,
        formId: templateForm.formId || templateForm.id
      };
      
      setTemplate(mappedTemplate);
    } catch (error) {
      console.error('Error loading template detail:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load template details');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplateDetail();
  }, [loadTemplateDetail]);

  // Load PDF when preview tab is active
  useEffect(() => {
    const loadPDF = async () => {
      if (activeTab === 'preview' && template?.formId && template?.templateContent) {
        try {
          setLoadingPDF(true);
          const pdfBlob = await templateAPI.getTemplatePDF(template.formId);
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfUrl(null);
          toast.error('Failed to load PDF preview');
        } finally {
          setLoadingPDF(false);
        }
      } else {
        // Clean up PDF URL when tab changes
        setPdfUrl(prevUrl => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return null;
        });
      }
    };

    loadPDF();

    // Cleanup function
    return () => {
      setPdfUrl(prevUrl => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [activeTab, template?.formId, template?.templateContent]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { variant: 'success', icon: CheckCircle, text: 'ACTIVE' };
      case 'DRAFT':
        return { variant: 'warning', icon: Clock, text: 'DRAFT' };
      case 'INACTIVE':
        return { variant: 'secondary', icon: Clock, text: 'INACTIVE' };
      default:
        return { variant: 'secondary', icon: Clock, text: status };
    }
  };

  const handleExportPDF = () => {
    console.log('Export PDF for template:', templateId);
    // Export PDF functionality
    alert('PDF export functionality will be implemented');
  };

  const handleBackToList = () => {
    navigate('/sqa/templates');
  };

  const handleViewTemplateConfig = () => {
    if (template?.templateConfig) {
      // Open template config in new tab
      window.open(template.templateConfig, '_blank', 'noopener,noreferrer');
    } else {
      toast.warning('Template config is not available');
    }
  };

  const handleApprove = async () => {
    if (!template?.id) return;

    try {
      setReviewing(true);
      await templateAPI.reviewTemplate(template.id, {
        action: 'PUBLISHED'
      });
      toast.success('Template approved successfully');
      setShowApproveModal(false);
      // Navigate back to template list
      navigate('/sqa/templates');
    } catch (error) {
      console.error('Error approving template:', error);
      toast.error(error.response?.data?.message || 'Failed to approve template');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!template?.id) return;

    if (!rejectComment.trim()) {
      toast.warning('Please provide a reason for rejection');
      return;
    }

    try {
      setReviewing(true);
      await templateAPI.reviewTemplate(template.id, {
        action: 'REJECTED',
        comment: rejectComment.trim()
      });
      toast.success('Template rejected successfully');
      setShowRejectModal(false);
      setRejectComment('');
      // Navigate back to template list
      navigate('/sqa/templates');
    } catch (error) {
      console.error('Error rejecting template:', error);
      toast.error(error.response?.data?.message || 'Failed to reject template');
    } finally {
      setReviewing(false);
    }
  };

  const handleOpenApproveModal = () => {
    setShowApproveModal(true);
  };

  const handleCloseApproveModal = () => {
    setShowApproveModal(false);
  };

  const handleOpenRejectModal = () => {
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectComment('');
  };

  const renderTemplateConfigSchema = () => {
    const sectionsData = template?.sections || [];
    
    if (sectionsData.length === 0) {
      return (
        <Alert variant="info" className="mb-0">
          <div>
            <strong>No template config found</strong>
            <p className="mb-0 text-muted">This template has no sections or fields yet.</p>
          </div>
        </Alert>
      );
    }

    // Build a flat list: sections with their fields nested
    const items = [];
    
    sectionsData.forEach((section, sectionIndex) => {
      // Add section
      items.push({
        type: 'section',
        id: section.id || `section-${sectionIndex}`,
        name: section.label || section.name,
        fieldCount: section.fields?.length || 0,
        data: section
      });
      
      // Add fields in this section (nested)
      if (section.fields && section.fields.length > 0) {
        section.fields.forEach((field, fieldIndex) => {
          items.push({
            type: 'field',
            id: field.id || field.fieldName || `field-${sectionIndex}-${fieldIndex}`,
            name: field.label || field.fieldName,
            parentSectionId: section.id || `section-${sectionIndex}`,
            data: field
          });
        });
      }
    });

    return (
      <div>
        <div className="list-group" style={{ border: 'none' }}>
          {items.map((item) => {
            const isSection = item.type === 'section';
            const isField = item.type === 'field';
            
            return (
              <div
                key={item.id}
                className="list-group-item"
                style={{
                  border: 'none',
                  borderBottom: '1px solid #e9ecef',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  paddingLeft: isField ? '40px' : '16px'
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
                    <span 
                      style={{ 
                        fontSize: '14px',
                        color: '#333',
                        fontWeight: isSection ? 500 : 400,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {item.name}
                    </span>
                    {isSection && item.fieldCount > 0 && (
                      <Badge 
                        bg="info" 
                        className="ms-2"
                        style={{ 
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#0dcaf0',
                          color: '#000'
                        }}
                      >
                        {item.fieldCount}
                      </Badge>
                    )}
                  </div>
                  <Badge
                    bg={isSection ? 'warning' : 'secondary'}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: isSection ? '#ffc107' : 'var(--bs-secondary)',
                      color: isSection ? '#000' : '#fff',
                      fontWeight: 500,
                      marginLeft: '12px'
                    }}
                  >
                    {isSection ? 'SECTION' : (item.data?.fieldType || item.data?.type || 'FIELD')}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading template details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={handleBackToList}>
            <ArrowLeft className="me-2" />
            Back to Template List
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!template) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Template Not Found</Alert.Heading>
          <p>The requested template could not be found.</p>
          <Button variant="outline-warning" onClick={handleBackToList}>
            <ArrowLeft className="me-2" />
            Back to Template List
          </Button>
        </Alert>
      </Container>
    );
  }

  const statusConfig = getStatusConfig(template.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleBackToList}
                className="me-3"
              >
                <ArrowLeft className="me-1" size={16} />
                Back to List
              </Button>
              <div>
                <h2 className="mb-1 text-dark">{template.name}</h2>
                <p className="text-muted mb-0">{template.description}</p>
              </div>
            </div>
            <PermissionWrapper 
              permissions={[API_PERMISSIONS.SQA.VIEW_TEMPLATES]}
              fallback={null}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportPDF}
                className="d-flex align-items-center"
              >
                <FileEarmarkPdf className="me-1" size={16} />
                Export PDF
              </Button>
            </PermissionWrapper>
          </div>
        </Col>
      </Row>

      {/* Custom Tabs */}
      <Row>
        <Col xs={12}>
          <Card className="border-neutral-200 shadow-sm">
            <Card.Header className="bg-primary-custom border-neutral-200 p-0">
              <div className="custom-tabs">
                <button 
                  className={`custom-tab ${activeTab === 'basic-info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('basic-info')}
                >
                  Basic Info
                </button>
                <button 
                  className={`custom-tab ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Basic Info Tab */}
              {activeTab === 'basic-info' && (
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
                            {template.version}
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
                        <div className="fw-medium">{template.totalSections} sections</div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Created By</label>
                        <div className="d-flex align-items-center">
                          <Person className="me-2" size={16} />
                          <span>{template.createdBy}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-muted small">Created Date</label>
                        <div className="d-flex align-items-center">
                          <Calendar className="me-2" size={16} />
                          <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-muted small">Last Modified</label>
                        <div className="d-flex align-items-center">
                          <Clock className="me-2" size={16} />
                          <span>{new Date(template.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="p-4">
                  <Row>
                    <Col xs={12} className="mb-3">
                      <div className="d-flex justify-content-end gap-2 mb-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleViewTemplateConfig}
                          className="d-flex align-items-center"
                          disabled={!template?.templateConfig}
                        >
                          <Download className="me-2" size={16} />
                          View Template Config
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenApproveModal}
                          className="d-flex align-items-center"
                          disabled={template?.status !== 'PENDING' || reviewing}
                        >
                          <CheckCircle className="me-2" size={16} />
                          Approve
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={handleOpenRejectModal}
                          className="d-flex align-items-center"
                          disabled={template?.status !== 'PENDING' || reviewing}
                          style={{
                            backgroundColor: 'white',
                            borderColor: '#dee2e6',
                            color: '#333'
                          }}
                        >
                          <XCircle className="me-2" size={16} />
                          Reject
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row>
                    {/* PDF Preview */}
                    <Col xs={12} lg={7} className="mb-4">
                      <div className="mb-2">
                        <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>PDF Preview</h6>
                      </div>
                      {loadingPDF ? (
                        <div className="border rounded p-4 bg-light text-center" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div>
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <p className="text-muted mb-0">Loading PDF preview...</p>
                          </div>
                        </div>
                      ) : pdfUrl ? (
                        <div style={{ height: '60vh', overflow: 'hidden' }}>
                          <iframe
                            src={pdfUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '1px solid #dee2e6',
                              borderRadius: '0.375rem',
                              display: 'block'
                            }}
                            title="Template PDF Preview"
                          />
                        </div>
                      ) : (
                        <Alert variant="warning" className="mb-0">
                          <FileEarmarkPdf className="me-2" />
                          PDF preview is not available. Please try again or contact support.
                        </Alert>
                      )}
                    </Col>

                    {/* Template Config Schema */}
                    <Col xs={12} lg={5}>
                      <div className="mb-2">
                        <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>Template fields & sections</h6>
                      </div>
                      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {renderTemplateConfigSchema()}
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Approve Template Modal */}
      <Modal 
        show={showApproveModal} 
        onHide={handleCloseApproveModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-primary-custom text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <CheckCircle className="me-2" size={20} />
            Approve Template
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-0">
            Are you sure you want to approve the template <strong>"{template?.name}"</strong>?
          </p>
          <p className="text-muted mt-2 mb-0">
            Once approved, the template will be published and available for use.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={handleCloseApproveModal}
            disabled={reviewing}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApprove}
            disabled={reviewing}
            className="d-flex align-items-center"
          >
            {reviewing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="me-2" size={16} />
                Approve
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Template Modal */}
      <Modal 
        show={showRejectModal} 
        onHide={handleCloseRejectModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-secondary text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <XCircle className="me-2" size={20} />
            Reject Template
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-3">
            Are you sure you want to reject the template <strong>"{template?.name}"</strong>?
          </p>
          <Form.Group>
            <Form.Label>
              <strong>Reason for Rejection <span className="text-danger">*</span></strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Please provide a reason for rejecting this template..."
              disabled={reviewing}
            />
            <Form.Text className="text-muted">
              This comment will be visible to the template creator.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={handleCloseRejectModal}
            disabled={reviewing}
          >
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleReject}
            disabled={reviewing || !rejectComment.trim()}
            className="d-flex align-items-center"
          >
            {reviewing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="me-2" size={16} />
                Reject
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TemplateDetailPage;