import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FileText, FileEarmark, Pencil, Clock, Building, Person, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'react-toastify';
import { LoadingSkeleton } from '../../../components/Common';
import { templateAPI } from '../../../api';
import { useAuth } from '../../../hooks/useAuth';
import { convertBackendToFrontendSections } from '../../../utils/templateBuilder';

const YourDraftsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingDraftId, setDeletingDraftId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadMyDrafts();
    }
  }, [user?.id]);

  const loadMyDrafts = async () => {
    try {
      setLoading(true);
      const userId = user?.id;
      
      if (!userId) {
        toast.error('User ID not found');
        setDrafts([]);
        return;
      }

      // Filter: status='DRAFT' and createdByUserId=currentUserId
      const response = await templateAPI.getTemplates({
        status: 'DRAFT',
        createdByUserId: userId
      });
      
      // Handle response structure: { success: true, data: [...] }
      if (response.success && response.data) {
        setDrafts(response.data);
      } else if (Array.isArray(response)) {
        setDrafts(response);
      } else if (response.data && Array.isArray(response.data)) {
        setDrafts(response.data);
      } else {
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast.error('Failed to load drafts');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDraft = async (templateId) => {
    try {
      console.log('📂 Opening draft:', templateId);
      
      // Step 1: Load template detail (includes sections and fields)
      const response = await templateAPI.getTemplateById(templateId);
      const template = response.data?.templateForm || response.data;
      const backendSections = response.data?.sections || [];
      
      if (!template) {
        toast.error('Template not found');
        return;
      }

      console.log('📄 Template loaded:', template);
      console.log('📋 Sections loaded:', backendSections);
      
      // Step 2: Convert backend format → frontend format
      const frontendSections = convertBackendToFrontendSections(backendSections);
      
      console.log('🔄 Converted sections:', frontendSections);
      
      // Step 3: Choose correct URL (templateConfig if available, otherwise templateContent)
      const documentUrl = template.templateConfig || template.templateContent;
      
      if (!documentUrl) {
        toast.error('Document URL not found');
        return;
      }
      
      // Step 4: Restore templateInfo to localStorage
      // IMPORTANT: Set both id and currentTemplateId to ensure save draft will UPDATE instead of CREATE
      localStorage.setItem('templateInfo', JSON.stringify({
        id: template.id, // ← Save ID for update operations
        currentTemplateId: template.id, // ← Set currentTemplateId so save draft will UPDATE existing draft
        name: template.name,
        description: template.description,
        departmentId: template.departmentId,
        templateContent: template.templateContent,
        templateConfig: template.templateConfig
      }));
      
      // Also set currentTemplateId as separate key for backward compatibility
      localStorage.setItem('currentTemplateId', template.id);
      
      console.log('💾 Restored templateInfo with currentTemplateId:', template.id);
      
      // Step 5: Navigate to editor with restored data
      navigate(ROUTES.TEMPLATES_EDITOR, {
        state: {
          documentUrl: documentUrl,
          fileName: template.name,
          importType: 'File without fields',
          templateInfo: {
            id: template.id, // ← To know this is editing draft (update instead of create)
            name: template.name,
            description: template.description,
            departmentId: template.departmentId,
            status: template.status
          },
          initialSections: frontendSections // ← Pass sections to restore
        }
      });
      
      toast.success('Draft loaded successfully');
    } catch (error) {
      console.error('Error opening draft:', error);
      toast.error('Failed to load draft: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteDraft = async (draftId, draftName) => {
    try {
      setDeletingDraftId(draftId);
      const response = await templateAPI.deleteDraft(draftId);
      
      // Show success message from API response
      const message = response?.message || `Draft "${draftName}" deleted successfully`;
      toast.success(message);
      
      // Remove draft from list
      setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete draft';
      toast.error(errorMessage);
      console.error('Error deleting draft:', error);
    } finally {
      setDeletingDraftId(null);
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
    <Container fluid className="py-4 forms-page form-component">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="border-neutral-200 forms-page-header" style={{backgroundColor: '#1b3c53', padding: '12px 16px'}}>
          <Row className="align-items-center g-0">
            <Col>
              <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                <Button
                  variant="link"
                  className="text-white p-0"
                  onClick={() => navigate(ROUTES.TEMPLATES)}
                  style={{ textDecoration: 'none', margin: 0, padding: '4px', minWidth: 'auto' }}
                >
                  <ArrowLeft size={20} />
                </Button>
                <FileText className="text-white" size={24} style={{ marginLeft: '4px' }} />
                <h4 className="mb-0 text-white" style={{ marginLeft: '8px' }}>Your Drafts</h4>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <LoadingSkeleton />
          ) : drafts.length === 0 ? (
            <Row className="mb-4">
              <Col>
                <div className="text-center py-5">
                  <FileEarmark size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No drafts found</h5>
                  <p className="text-muted mb-4">
                    You haven't saved any drafts yet. Start creating a template to save drafts.
                  </p>
                  <Button
                    variant="primary-custom"
                    onClick={() => navigate(ROUTES.TEMPLATES)}
                  >
                    Go to Templates
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="g-3 g-md-4">
              {drafts.map((draft) => (
                <Col key={draft.id} xs={12} sm={6} md={6} lg={4} xl={3}>
                  <Card
                    className="h-100 border-0 shadow-sm template-card"
                    style={{
                      transition: 'all 0.3s ease'
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
                            title={draft.name}
                          >
                            {draft.name}
                          </h6>
                          <small className="text-muted">v{draft.version}</small>
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
                          title={draft.description || 'No description'}
                        >
                          {draft.description || 'No description'}
                        </p>
                      </div>

                      {/* Department and Status */}
                      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0, height: '24px' }}>
                        <div className="d-flex align-items-center" style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <Building size={12} className="text-muted me-1 flex-shrink-0" />
                          <small 
                            className="text-muted text-truncate" 
                            style={{ maxWidth: '100px' }}
                            title={draft.department?.code || 'N/A'}
                          >
                            {draft.department?.code || 'N/A'}
                          </small>
                        </div>
                        <div className="flex-shrink-0 ms-2">
                          <Badge bg="secondary" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                            <Clock size={12} />
                            DRAFT
                          </Badge>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0, height: '24px' }}>
                        <div className="d-flex align-items-center" style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <Person size={12} className="text-muted me-1 flex-shrink-0" />
                          <small className="text-muted text-truncate" style={{ maxWidth: '120px' }}>
                            {draft.createdByUser?.firstName} {draft.createdByUser?.lastName}
                          </small>
                        </div>
                        <small className="text-muted flex-shrink-0 ms-2">{formatDate(draft.createdAt)}</small>
                      </div>

                      {/* Footer with Continue Editing and Delete Buttons */}
                      <div className="mt-auto pt-2 border-top" style={{ flexShrink: 0 }}>
                        <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-grow-1 d-flex align-items-center justify-content-center"
                            onClick={() => handleOpenDraft(draft.id)}
                            style={{
                              backgroundColor: '#1b3c53',
                              borderColor: '#1b3c53',
                              color: '#fff',
                              fontWeight: 500
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#153a4a';
                              e.currentTarget.style.borderColor = '#153a4a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1b3c53';
                              e.currentTarget.style.borderColor = '#1b3c53';
                            }}
                          >
                            <Pencil size={14} className="me-2" />
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="d-flex align-items-center justify-content-center"
                            onClick={() => handleDeleteDraft(draft.id, draft.name)}
                            disabled={deletingDraftId === draft.id}
                            style={{
                              minWidth: '44px',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: 'transparent',
                              borderColor: '#6c757d',
                              color: '#6c757d',
                              border: '1px solid #6c757d !important',
                              fontWeight: 500,
                              cursor: deletingDraftId === draft.id ? 'not-allowed' : 'pointer',
                              opacity: deletingDraftId === draft.id ? 0.6 : 1,
                              transition: 'all 0.25s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (deletingDraftId !== draft.id) {
                                e.currentTarget.style.backgroundColor = '#6c757d';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = '#6c757d';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#6c757d';
                              e.currentTarget.style.borderColor = '#6c757d';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            title="Delete this draft"
                          >
                            {deletingDraftId === draft.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                                Deleting
                              </>
                            ) : (
                              '✕ Delete'
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default YourDraftsPage;

