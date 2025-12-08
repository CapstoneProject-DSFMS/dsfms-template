import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { 
  X, 
  FileText, 
  Eye, 
  FileEarmarkPdf,
  Person,
  Building,
  CheckCircle,
  Clock,
  Download,
  FileEarmarkPlus,
  Calendar,
  PencilSquare
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { userAPI } from '../../../api/user';

const TemplatePreviewModal = ({ show, onHide, template }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [reviewedByUser, setReviewedByUser] = useState(null);
  const [loadingReviewedBy, setLoadingReviewedBy] = useState(false);

  // Fetch reviewed by user info if reviewedByUserId exists
  useEffect(() => {
    const fetchReviewedByUser = async () => {
      if (template?.reviewedByUserId && show) {
        try {
          setLoadingReviewedBy(true);
          const userData = await userAPI.getUserById(template.reviewedByUserId);
          const user = userData.data || userData;
          setReviewedByUser(user);
        } catch (error) {
          console.error('Error fetching reviewed by user:', error);
          setReviewedByUser(null);
        } finally {
          setLoadingReviewedBy(false);
        }
      } else {
        setReviewedByUser(null);
      }
    };

    fetchReviewedByUser();
  }, [template?.reviewedByUserId, show]);

  if (!template) return null;

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

  const handleCreateNewVersion = () => {
    // TODO: Implement create new version functionality
    console.log('Create new version for template:', template.id);
  };

  const handleUpdateRejectedTemplate = () => {
    // Navigate to FormEditorPage with update rejected template flag
    navigate(ROUTES.TEMPLATES_EDITOR, {
      state: {
        isUpdateRejected: true,
        templateId: template.id,
        templateInfo: template,
        fileName: template.name || 'Untitled Document',
        importType: 'Update Rejected Template',
        // Load template content if available
        documentUrl: template.templateContent?.startsWith('http') ? template.templateContent : null,
        content: template.templateContent?.startsWith('http') ? null : template.templateContent,
        initialSections: template.sections || []
      }
    });
    onHide(); // Close modal
  };

  // Check if template is rejected
  const isRejected = template?.status === 'REJECTED' || template?.status === 'DENIED';

  const renderDetails = () => (
    <div className="template-details">
      <div className="list-group list-group-flush">
        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Template Name</strong>
              <span className="text-dark">{template.name}</span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Building className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Department</strong>
              <span className="text-dark">{template.department?.name || 'N/A'}</span>
              {template.department?.code && (
                <small className="text-muted d-block">{template.department.code}</small>
              )}
            </div>
          </div>
        </div>

        {template.description && (
          <div className="list-group-item border-0 px-0 py-3">
            <div className="d-flex align-items-start">
              <FileText className="text-primary-custom me-3" size={20} />
              <div className="flex-grow-1">
                <strong className="text-muted small d-block mb-1">Description</strong>
                <span className="text-dark">{template.description}</span>
              </div>
            </div>
          </div>
        )}

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <CheckCircle className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Status</strong>
              <div>{getStatusBadge(template.status)}</div>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Version</strong>
              <span className="text-dark">Version {template.version}</span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Sections</strong>
              <span className="text-dark">
                {template._count?.sections || 0} {template._count?.sections === 1 ? 'section' : 'sections'}
              </span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Person className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Created By</strong>
              <span className="text-dark">
                {template.createdByUser?.firstName || ''} {template.createdByUser?.lastName || ''}
              </span>
              <small className="text-muted d-block">
                <Calendar className="me-1" size={12} />
                {formatDateTime(template.createdAt)}
              </small>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Clock className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Last Updated</strong>
              <span className="text-dark">
                {formatDateTime(template.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <CheckCircle className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Reviewed By</strong>
              {template.reviewedByUserId ? (
                <>
                  {loadingReviewedBy ? (
                    <span className="text-muted">Loading...</span>
                  ) : reviewedByUser ? (
                    <>
                      <span className="text-dark">
                        {reviewedByUser.firstName || ''} {reviewedByUser.lastName || ''}
                      </span>
                      {template.reviewedAt && (
                        <small className="text-muted d-block">
                          <Calendar className="me-1" size={12} />
                          {formatDateTime(template.reviewedAt)}
                        </small>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">User ID: {template.reviewedByUserId}</span>
                  )}
                </>
              ) : (
                <span className="text-muted">Not reviewed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentPreview = () => {
    if (template.templateContent && template.templateContent.startsWith('http')) {
      return (
        <div className="content-preview">
          <div className="alert alert-info">
            <FileEarmarkPdf className="me-2" />
            Template content is stored as a file. You can download it using the "Download File" button below.
          </div>
          <div className="border rounded p-4 bg-light text-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              <FileEarmarkPdf size={64} className="text-muted mb-3" />
              <p className="text-muted mb-0">File preview is not available. Use the download button to view the file.</p>
            </div>
          </div>
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

  const renderOverview = () => {
    return (
      <Row style={{ height: '100%', margin: 0 }}>
        {/* PDF Preview */}
        <Col xs={12} lg={6} style={{ paddingRight: '8px' }}>
          <div className="mb-2">
            <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>PDF Preview</h6>
          </div>
          {loadingPDF ? (
            <div className="border rounded p-4 bg-light text-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted mb-0">Loading PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div style={{ height: '55vh', overflow: 'hidden' }}>
              <iframe
                src={`${pdfUrl}#toolbar=0`}
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
        <Col xs={12} lg={6} style={{ paddingLeft: '8px' }}>
          <div className="mb-2">
            <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>Template fields & sections</h6>
          </div>
          <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            <TemplateConfigSchema sections={template?.sections || []} />
          </div>
        </Col>
      </Row>
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
      
      <Modal.Body className="p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="bg-primary text-white">
          <div className="custom-tabs-container">
            <button
              className={`custom-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={16} className="me-2" />
              Details
            </button>
            <button
              className={`custom-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <Eye size={16} className="me-2" />
              Content Preview
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'content' && renderContentPreview()}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        {isRejected && (
          <Button
            variant="warning"
            onClick={handleUpdateRejectedTemplate}
            className="d-flex align-items-center"
          >
            <PencilSquare className="me-2" size={16} />
            Update Rejected Template
          </Button>
        )}
        <Button
          variant="primary-custom"
          onClick={handleCreateNewVersion}
          className="d-flex align-items-center"
        >
          <FileEarmarkPlus className="me-2" size={16} />
          Create New Template's Version
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



