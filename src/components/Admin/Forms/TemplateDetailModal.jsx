import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Card, Alert, Spinner } from 'react-bootstrap';
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
  ListUl,
  ListCheck,
  ClockHistory,
} from 'react-bootstrap-icons';
import { userAPI } from '../../../api/user';
import templateAPI from '../../../api/template';

const TemplateDetailModal = ({ show, onHide, template, onCreateVersion }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [reviewedByUser, setReviewedByUser] = useState(null);
  const [loadingReviewedBy, setLoadingReviewedBy] = useState(false);
  const [fullTemplateData, setFullTemplateData] = useState(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);

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

  // Fetch full template data when modal opens and template doesn't have sections/fields
  useEffect(() => {
    const fetchFullTemplateData = async () => {
      // Only fetch if modal is open, template has id, and template doesn't already have sections
      if (template?.id && show && !template.sections) {
        try {
          setLoadingFullData(true);
          const response = await templateAPI.getTemplateById(template.id);
          const templateData = response.data || response;
          setFullTemplateData(templateData);
        } catch (error) {
          console.error('Error fetching full template data:', error);
          setFullTemplateData(null);
        } finally {
          setLoadingFullData(false);
        }
      } else if (template?.sections) {
        // If template already has sections, use it directly
        setFullTemplateData(template);
      } else {
        setFullTemplateData(null);
      }
    };

    fetchFullTemplateData();
  }, [template?.id, show, template?.sections]);

  // Load PDF when content tab is active
  useEffect(() => {
    const loadPDF = async () => {
      if (activeTab === 'content' && template?.id && show) {
        try {
          setLoadingPDF(true);
          // Use template.id as templateFormId (or template.formId if available)
          const templateFormId = template.formId || template.id;
          const pdfBlob = await templateAPI.getTemplatePDF(templateFormId);
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfUrl(null);
        } finally {
          setLoadingPDF(false);
        }
      } else {
        // Clean up PDF URL when tab changes or modal closes
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
  }, [activeTab, template?.id, template?.formId, show]);

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
    if (onCreateVersion) {
      onCreateVersion(template);
    } else {
      // Default behavior: just close modal
      console.log('Create new version for template:', template.id);
      onHide();
    }
  };


  const renderDetails = () => (
    <div className="template-details" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="list-group list-group-flush" style={{ flex: 1 }}>
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

  const renderSections = () => {
    const sectionsData = fullTemplateData?.sections || template?.sections || [];
    
    if (loadingFullData) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading sections...</p>
        </div>
      );
    }

    if (sectionsData.length === 0) {
      return (
        <Alert variant="info" className="mb-0">
          <div>
            <strong>No sections found</strong>
            <p className="mb-0 text-muted">This template has no sections yet.</p>
          </div>
        </Alert>
      );
    }

    return (
      <div>
        <div className="mb-3">
          <h6 className="mb-0">Template Sections ({sectionsData.length})</h6>
        </div>
        <div className="list-group">
          {sectionsData.map((section, index) => (
            <div key={section.id || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{section.label || section.name}</h6>
                  <small className="text-muted">
                    Edit by: {section.editBy || 'TRAINER'} • 
                    {section.fields?.length || 0} field(s)
                  </small>
                </div>
                <Badge bg="secondary">{section.displayOrder || index + 1}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFields = () => {
    // Flatten all fields from all sections
    const sectionsData = fullTemplateData?.sections || template?.sections || [];
    const allFields = sectionsData.flatMap(section => section.fields || []);
    
    if (loadingFullData) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading fields...</p>
        </div>
      );
    }

    if (allFields.length === 0) {
      return (
        <Alert variant="info" className="mb-0">
          <div>
            <strong>No fields found</strong>
            <p className="mb-0 text-muted">This template has no fields yet.</p>
          </div>
        </Alert>
      );
    }

    return (
      <div>
        <div className="mb-3">
          <h6 className="mb-0">Template Fields ({allFields.length})</h6>
        </div>
        <div className="list-group">
          {allFields.map((field, index) => (
            <div key={field.id || field.fieldName || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{field.label}</h6>
                  <small className="text-muted">
                    {field.fieldName} ({field.fieldType}) • 
                    {field.roleRequired || 'TRAINER'}
                  </small>
                </div>
                <Badge bg="info">{field.fieldType}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const sectionsData = fullTemplateData?.sections || template?.sections || [];
    
    if (loadingFullData) {
      return (
        <div className="text-center" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <div>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading template config...</p>
          </div>
        </div>
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

    if (items.length === 0) {
      return (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <Alert variant="info" className="mb-0" style={{ maxWidth: '600px', width: '100%' }}>
            <div>
              <strong>No template config found</strong>
              <p className="mb-0 text-muted">This template has no sections or fields yet.</p>
            </div>
          </Alert>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h6 className="mb-3" style={{ color: '#333', fontWeight: 500 }}>Template fields & sections</h6>
        <div className="list-group" style={{ border: 'none', flex: 1, overflowY: 'auto' }}>
          {items.map((item, index) => {
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

  const renderHistory = () => {
    // History versions are not available in the current API response
    // This would need to be implemented separately if needed
    const historyVersions = [];
    
    if (loadingFullData) {
      return (
        <div className="text-center" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <div>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading version history...</p>
          </div>
        </div>
      );
    }

    if (historyVersions.length === 0) {
      return (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <Alert variant="info" className="mb-0" style={{ maxWidth: '600px', width: '100%' }}>
            <div>
              <strong>No version history found</strong>
              <p className="mb-0 text-muted">This template has no previous versions.</p>
            </div>
          </Alert>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="mb-3">
          <h6 className="mb-0">Version History</h6>
        </div>
        <div className="list-group" style={{ flex: 1, overflowY: 'auto' }}>
          {historyVersions.map((version, index) => (
            <div key={version.id || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Version {version.version}</h6>
                  <small className="text-muted">
                    {formatDateTime(version.createdAt || version.updatedAt)}
                    {version.createdByUser && (
                      <> • {version.createdByUser.firstName} {version.createdByUser.lastName}</>
                    )}
                  </small>
                </div>
                <Badge bg={version.status === 'PUBLISHED' ? 'success' : 'warning'}>
                  {version.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContentPreview = () => {
    if (loadingPDF) {
      return (
        <div className="content-preview" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Loading PDF preview...</p>
          </div>
        </div>
      );
    }

    if (pdfUrl) {
      return (
        <div className="content-preview" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          minHeight: 0
        }}>
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #dee2e6',
              borderRadius: '0.375rem',
              display: 'block',
              flex: 1,
              minHeight: 0
            }}
            title="Template PDF Preview"
          />
        </div>
      );
    }

    return (
      <div className="content-preview" style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 0
      }}>
        <Alert variant="warning" className="mb-0" style={{ maxWidth: '600px', width: '100%' }}>
          <FileEarmarkPdf className="me-2" />
          PDF preview is not available. Please try again or contact support.
        </Alert>
      </div>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered 
      className="template-detail-modal"
      dialogClassName="template-detail-modal-dialog"
      contentClassName="template-detail-modal-content"
    >
      <Modal.Header 
        className="bg-primary-custom text-white border-0 template-detail-header d-flex align-items-center justify-content-between"
        style={{ 
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem',
          padding: '1.25rem 1.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0 template-detail-title flex-grow-1" style={{ minWidth: 0 }}>
          <FileText className="me-2 flex-shrink-0" size={20} />
          <span className="template-detail-title-text text-truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`Template Detail: ${template.name}`}>
            <span className="d-none d-md-inline">Template Detail: </span>
            {template.name}
          </span>
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide} 
          className="text-white p-0 flex-shrink-0"
          style={{ 
            border: 'none', 
            background: 'none', 
            opacity: 0.9,
            color: '#ffffff !important',
            marginLeft: '1rem'
          }}
        >
          <X size={24} color="#ffffff" />
        </Button>
      </Modal.Header>
      
      <Modal.Body 
        className="p-0 template-detail-body" 
        style={{ 
          height: '70vh',
          maxHeight: '70vh',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        {/* Tabs */}
        <div className="bg-primary-custom text-white template-detail-tabs-container" style={{ flexShrink: 0 }}>
          <div className="d-flex border-bottom border-white border-opacity-25 template-detail-tabs" style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'details' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('details')}
              style={{
                fontWeight: activeTab === 'details' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <FileText size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">Details</span>
            </button>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'overview' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('overview')}
              style={{
                fontWeight: activeTab === 'overview' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <ListCheck size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">Template Config Overview</span>
              <span className="d-inline d-sm-none">Overview</span>
            </button>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'history' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('history')}
              style={{
                fontWeight: activeTab === 'history' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <ClockHistory size={16} className="me-1 me-md-2" />
              <span className="d-none d-lg-inline">List History Version</span>
              <span className="d-inline d-lg-none d-sm-inline">History</span>
            </button>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'content' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('content')}
              style={{
                fontWeight: activeTab === 'content' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <Eye size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">Content Preview</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div 
          className="p-3 p-md-4 template-detail-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            height: '100%'
          }}
        >
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            height: '100%'
          }}>
            {activeTab === 'details' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderDetails()}
              </div>
            )}
            {activeTab === 'overview' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderOverview()}
              </div>
            )}
            {activeTab === 'history' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderHistory()}
              </div>
            )}
            {activeTab === 'content' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderContentPreview()}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer 
        className="bg-light border-0 template-detail-footer d-flex flex-wrap gap-2"
        style={{ 
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--bs-neutral-200)',
          justifyContent: 'flex-end'
        }}
      >
        <Button 
          variant="secondary"
          onClick={onHide}
          className="d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'var(--bs-secondary)',
            borderColor: 'var(--bs-secondary)',
            color: '#ffffff',
            fontWeight: 500,
            padding: '0.5rem 1.5rem',
            borderRadius: '0.375rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3a5a6f'
            e.currentTarget.style.borderColor = '#3a5a6f'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bs-secondary)'
            e.currentTarget.style.borderColor = 'var(--bs-secondary)'
            e.currentTarget.style.color = '#ffffff'
          }}
        >
          Close
        </Button>
        {onCreateVersion && (
          <Button
            variant="primary"
            onClick={handleCreateNewVersion}
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'var(--bs-primary)',
              borderColor: 'var(--bs-primary)',
              color: 'white',
              fontWeight: 500,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#153a4a'
              e.currentTarget.style.borderColor = '#153a4a'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(27, 60, 83, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bs-primary)'
              e.currentTarget.style.borderColor = 'var(--bs-primary)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <FileEarmarkPlus className="me-2" size={16} />
            <span className="d-none d-sm-inline">Create New Version</span>
            <span className="d-inline d-sm-none">New Version</span>
          </Button>
        )}
        {template.templateConfig && (
          <Button 
            variant="primary"
            href={template.templateConfig} 
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'var(--bs-primary)',
              borderColor: 'var(--bs-primary)',
              color: 'white',
              fontWeight: 500,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#153a4a'
              e.currentTarget.style.borderColor = '#153a4a'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(27, 60, 83, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bs-primary)'
              e.currentTarget.style.borderColor = 'var(--bs-primary)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Download className="me-2" size={16} />
            <span className="d-none d-sm-inline">Download File</span>
            <span className="d-inline d-sm-none">Download</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateDetailModal;

