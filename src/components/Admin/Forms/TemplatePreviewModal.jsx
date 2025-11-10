import React, { useState } from 'react';
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
  FileEarmarkPlus
} from 'react-bootstrap-icons';

const TemplatePreviewModal = ({ show, onHide, template }) => {
  const [activeTab, setActiveTab] = useState('details');

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

  const handleCreateNewVersion = () => {
    // TODO: Implement create new version functionality
    console.log('Create new version for template:', template.id);
  };

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
              <span className="text-dark">v{template.version}</span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Sections</strong>
              <span className="text-dark">{template._count?.sections || 0}</span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Person className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Created By</strong>
              <span className="text-dark">
                {template.createdByUser?.firstName} {template.createdByUser?.lastName}
              </span>
              <small className="text-muted d-block">{formatDate(template.createdAt)}</small>
            </div>
          </div>
        </div>

        {template.reviewedByUserId && (
          <div className="list-group-item border-0 px-0 py-3">
            <div className="d-flex align-items-center">
              <CheckCircle className="text-primary-custom me-3" size={20} />
              <div className="flex-grow-1">
                <strong className="text-muted small d-block mb-1">Reviewed</strong>
                <span className="text-dark">{formatDate(template.reviewedAt)}</span>
              </div>
            </div>
          </div>
        )}
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



