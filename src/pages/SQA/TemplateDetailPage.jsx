import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { ArrowLeft, FileEarmarkPdf, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { PermissionWrapper } from '../../components/Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { ROUTES } from '../../constants/routes';
import templateAPI from '../../api/template';
import { toast } from 'react-toastify';
import BasicInfoTab from '../../components/SQA/BasicInfoTab';
import PreviewTab from '../../components/SQA/PreviewTab';
import OldTemplateVersionDetailsTab from '../../components/SQA/OldTemplateVersionDetailsTab';
import ApproveTemplateModal from '../../components/SQA/ApproveTemplateModal';
import RejectTemplateModal from '../../components/SQA/RejectTemplateModal';

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
  const [downloadingPDF, setDownloadingPDF] = useState(false);

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
          return `${user.lastName} ${user.firstName}`;
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
        formId: templateForm.formId || templateForm.id,
        referFirstVersionId: templateForm.referFirstVersionId || null
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

  // Load PDF when tab changes to preview
  useEffect(() => {
    if (activeTab === 'preview' && template?.id && !pdfUrl) {
      const loadPreviewPDF = async () => {
        if (!template?.id) {
          toast.warning('Template ID is not available');
          return;
        }

        try {
          setLoadingPDF(true);
          const templateId = template.id;
          
          console.log('Loading PDF config with ID:', templateId);
          
          // Get PDF blob from API
          const pdfBlob = await templateAPI.getTemplatePdfConfig(templateId);
          
          console.log('PDF Blob received:', pdfBlob);
          console.log('PDF Blob type:', pdfBlob.type);
          console.log('PDF Blob size:', pdfBlob.size);
          
          // Create object URL from blob (this is required for iframe to display PDF)
          const pdfObjectUrl = URL.createObjectURL(pdfBlob);
          console.log('Created object URL:', pdfObjectUrl);
          
          setPdfUrl(pdfObjectUrl);
        } catch (error) {
          console.error('Error loading PDF preview:', error);
          toast.error('Failed to load PDF preview');
        } finally {
          setLoadingPDF(false);
        }
      };

      loadPreviewPDF();
    }
  }, [activeTab, template?.id, pdfUrl]);

  // Clean up PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);


  const handleExportPDF = async () => {
    if (!template?.formId) {
      toast.warning('Template form ID is not available');
      return;
    }

    try {
      setDownloadingPDF(true);
      // Call API to get PDF blob
      const pdfBlob = await templateAPI.getTemplatePDF(template.formId);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name || 'template'}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleBackToList = () => {
    navigate(ROUTES.TEMPLATES);
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
      navigate(ROUTES.TEMPLATES);
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
      navigate(ROUTES.TEMPLATES);
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
            <div className="d-flex align-items-center gap-2">
              <PermissionWrapper
                permission={PERMISSION_IDS.APPROVE_DENY_TEMPLATE}
                fallback={null}
              >
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleOpenApproveModal}
                  className="d-flex align-items-center"
                  disabled={template?.status !== 'PENDING' || reviewing}
                >
                  <CheckCircle className="me-2" size={16} />
                  Approve
                </Button>
              </PermissionWrapper>
              <PermissionWrapper
                permission={PERMISSION_IDS.APPROVE_DENY_TEMPLATE}
                fallback={null}
              >
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleOpenRejectModal}
                  className="d-flex align-items-center"
                  disabled={template?.status !== 'PENDING' || reviewing}
                >
                  <XCircle className="me-2" size={16} />
                  Reject
                </Button>
              </PermissionWrapper>
              <PermissionWrapper
                permission={PERMISSION_IDS.DOWNLOAD_TEMPLATE_AS_PDF}
                fallback={null}
              >
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExportPDF}
                  className="d-flex align-items-center"
                  disabled={!template?.formId || downloadingPDF}
                  style={{ 
                    fontSize: '0.875rem', 
                    padding: '0.25rem 0.5rem',
                    whiteSpace: 'nowrap',
                    minWidth: 'auto'
                  }}
                >
                  {downloadingPDF ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FileEarmarkPdf className="me-2" size={16} />
                      Download PDF
                    </>
                  )}
                </Button>
              </PermissionWrapper>
            </div>
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
                <button 
                  className={`custom-tab ${activeTab === 'old-version' ? 'active' : ''}`}
                  onClick={() => setActiveTab('old-version')}
                >
                  Old Template Version Details
                </button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Basic Info Tab */}
              {activeTab === 'basic-info' && (
                <BasicInfoTab template={template} />
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <PreviewTab
                  template={template}
                  pdfUrl={pdfUrl}
                  loadingPDF={loadingPDF}
                />
              )}

              {/* Old Template Version Details Tab */}
              {activeTab === 'old-version' && (
                <OldTemplateVersionDetailsTab template={template} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Approve Template Modal */}
      <ApproveTemplateModal
        show={showApproveModal}
        onHide={handleCloseApproveModal}
        template={template}
        onApprove={handleApprove}
        reviewing={reviewing}
      />

      {/* Reject Template Modal */}
      <RejectTemplateModal
        show={showRejectModal}
        onHide={handleCloseRejectModal}
        template={template}
        rejectComment={rejectComment}
        onRejectCommentChange={setRejectComment}
        onReject={handleReject}
        reviewing={reviewing}
      />
    </Container>
  );
};

export default TemplateDetailPage;