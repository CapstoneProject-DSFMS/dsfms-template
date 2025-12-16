import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form, Spinner } from 'react-bootstrap';
import { ArrowLeft, Pencil, Save, QuestionCircle, X, Question } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'react-toastify';
import OnlyOfficeFormEditor from '../../../components/Admin/Forms/OnlyOfficeFormEditor';
import AddTemplateContentButton from '../../../components/Admin/Forms/AddTemplateContentButton';
import { PermissionWrapper } from '../../../components/Common';
import { PERMISSION_IDS } from '../../../constants/permissionIds';
import { departmentAPI } from '../../../api/department';
import templateAPI from '../../../api/template';
import { readTemplateMetaFromStorage, convertBackendToFrontendSections } from '../../../utils/templateBuilder';

const FormEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled Document');
  const [importType, setImportType] = useState('');
  const [templateInfo, setTemplateInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplateInfo, setEditTemplateInfo] = useState({
    name: '',
    description: '',
    departmentId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const onlyOfficeEditorRef = useRef(null);

  // Debug: Log when hasUnsavedChanges changes
  useEffect(() => {
    console.log('🔔 hasUnsavedChanges changed:', hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  const [initialSections, setInitialSections] = useState(null);
  const [isUpdateRejected, setIsUpdateRejected] = useState(false);
  const [isEditDraft, setIsEditDraft] = useState(false); // ← Track Edit Draft flow

  // Helper function to clear currentTemplateId from localStorage
  const clearCurrentTemplateId = () => {
    try {
      // Remove standalone currentTemplateId key
      localStorage.removeItem('currentTemplateId');
      
      // Also clear from templateInfo object
      const meta = readTemplateMetaFromStorage();
      if (meta.currentTemplateId) {
        const updatedMeta = {
          ...meta,
          currentTemplateId: null
        };
        localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
        console.log('🗑️ Cleared currentTemplateId from localStorage');
      }
    } catch (error) {
      console.error('Error clearing currentTemplateId:', error);
    }
  };

  // Clear currentTemplateId when component unmounts (handles browser back button and any navigation away)
  useEffect(() => {
    // Cleanup function runs when component unmounts
    return () => {
      // Only clear if we're NOT in Edit Draft flow
      // Edit Draft flow should preserve currentTemplateId for proper update operations
      if (!isEditDraft) {
        console.log('🔙 FormEditorPage unmounting - clearing currentTemplateId');
        clearCurrentTemplateId();
      } else {
        console.log('🔙 FormEditorPage unmounting - preserving currentTemplateId (Edit Draft flow)');
      }
    };
  }, [isEditDraft]); // Re-run cleanup if isEditDraft changes

  // Get data from navigation state
  useEffect(() => {
    const processState = async () => {
      if (location.state) {
        const { 
          content: initialContent, 
          documentUrl: initialDocumentUrl,
          fileName: initialFileName, 
          importType: initialImportType,
          templateInfo: initialTemplateInfo,
          initialSections: sectionsFromState, // ← Get initialSections from navigation state
          isUpdateRejected: updateRejectedFlag,
          isEditDraft: editDraftFlag, // ← Flag to indicate Edit Draft flow
          templateId
        } = location.state;
        
        // Handle Update Rejected Template flow FIRST to fetch fresh data
        if (updateRejectedFlag && templateId) {
          setIsUpdateRejected(true);
          try {
            console.log(`🔄 Update Rejected Template flow - Fetching data for templateId: ${templateId}`);
            const response = await templateAPI.getTemplateById(templateId);
            const templateData = response?.data?.template || response?.data?.data?.template || response?.data;

            if (!templateData) {
              toast.error('Failed to load rejected template data.');
              navigate(ROUTES.TEMPLATES); // Go back if we can't load data
              return;
            }

            const editorUrl = templateData.templateConfig || templateData.templateContent || '';
            const freshMeta = {
              currentTemplateId: templateData.id,
              originalTemplateId: null,
              name: templateData.name,
              description: templateData.description,
              departmentId: templateData.departmentId,
              templateContent: templateData.templateContent,
              templateConfig: templateData.templateConfig,
              editorDocumentUrl: editorUrl,
            };

            localStorage.setItem('templateInfo', JSON.stringify(freshMeta));
            localStorage.setItem('currentTemplateId', templateData.id);
            console.log('✅ Fresh metadata for rejected template saved to localStorage:', freshMeta);

            // Update component state with fresh data
            setContent(editorUrl);
            setFileName(freshMeta.name);
            setImportType('Update Rejected Template');
            setTemplateInfo(freshMeta);
            setEditTemplateInfo({
              name: freshMeta.name,
              description: freshMeta.description,
              departmentId: freshMeta.departmentId,
            });
            if (templateData.sections && Array.isArray(templateData.sections)) {
              // Convert backend format (parentId UUID) → frontend format (parentTempId string)
              const frontendSections = convertBackendToFrontendSections(templateData.sections);
              setInitialSections(frontendSections);
            }
          } catch (error) {
            console.error('Error handling update rejected flow:', error);
            toast.error('An error occurred while loading the rejected template.');
            navigate(ROUTES.TEMPLATES);
          }
        } else {
          // Normal flow for other import types
          let finalContent = initialDocumentUrl || initialContent || '';
          if (initialTemplateInfo?.editorDocumentUrl) {
            finalContent = initialTemplateInfo.editorDocumentUrl;
          }
          if (initialImportType === 'Create Version' && !finalContent) {
            finalContent = initialTemplateInfo?.templateConfig || initialTemplateInfo?.templateContent || '';
          }
          
          // Handle Edit Draft flow: Sync currentTemplateId from navigation state
          if (editDraftFlag && initialTemplateInfo?.id) {
            console.log('📝 Edit Draft flow - Syncing currentTemplateId from navigation state:', initialTemplateInfo.id);
            setIsEditDraft(true); // ← Set flag to prevent cleanup from clearing currentTemplateId
            const freshMeta = readTemplateMetaFromStorage();
            const updatedMeta = {
              ...freshMeta,
              id: initialTemplateInfo.id,
              currentTemplateId: initialTemplateInfo.currentTemplateId || initialTemplateInfo.id,
              name: initialTemplateInfo.name || freshMeta.name,
              description: initialTemplateInfo.description || freshMeta.description,
              departmentId: initialTemplateInfo.departmentId || freshMeta.departmentId
            };
            localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
            localStorage.setItem('currentTemplateId', initialTemplateInfo.currentTemplateId || initialTemplateInfo.id);
            console.log('✅ Synced currentTemplateId for Edit Draft flow:', updatedMeta.currentTemplateId);
            
            // Update templateInfo state with synced data
            setTemplateInfo(updatedMeta);
          } else {
            setIsEditDraft(false); // ← Reset flag for other flows
          }
          
          setIsUpdateRejected(false);
          setContent(finalContent);
          setFileName(initialFileName || 'Untitled Document');
          setImportType(initialImportType || '');
          if (!editDraftFlag || !initialTemplateInfo?.id) {
            // Only set templateInfo from state if not Edit Draft (Edit Draft already set above)
            setTemplateInfo(initialTemplateInfo || null);
          }
          if (sectionsFromState && Array.isArray(sectionsFromState)) {
            setInitialSections(sectionsFromState);
          }
          if (initialTemplateInfo) {
            setEditTemplateInfo({
              name: initialTemplateInfo.name || '',
              description: initialTemplateInfo.description || '',
              departmentId: initialTemplateInfo.departmentId || ''
            });
          }
        }

        console.log('📄 FormEditorPage received:', { 
          documentUrl: initialDocumentUrl, 
          content: initialContent, 
          fileName: initialFileName,
          templateInfo: initialTemplateInfo,
          initialSections: sectionsFromState,
          isUpdateRejected: updateRejectedFlag,
          templateId
        });
      }
    };

    processState();
  }, [location.state, navigate]);

  // Load departments when edit modal opens
  useEffect(() => {
    if (showEditModal) {
      loadDepartments();
    }
  }, [showEditModal]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      // Load departments
      const departmentsData = await departmentAPI.getDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleOpenEditModal = () => {
    if (templateInfo) {
      setEditTemplateInfo({
        name: templateInfo.name || '',
        description: templateInfo.description || '',
        departmentId: templateInfo.departmentId || ''
      });
    }
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveEdit = () => {
    if (!editTemplateInfo.name || !editTemplateInfo.description || !editTemplateInfo.departmentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Update templateInfo state
    const updatedTemplateInfo = {
      ...templateInfo,
      name: editTemplateInfo.name,
      description: editTemplateInfo.description,
      departmentId: editTemplateInfo.departmentId
    };
    setTemplateInfo(updatedTemplateInfo);

    // Update localStorage if it exists
    try {
      const storedTemplateInfo = localStorage.getItem('templateInfo');
      if (storedTemplateInfo) {
        const parsed = JSON.parse(storedTemplateInfo);
        const updated = {
          ...parsed,
          name: editTemplateInfo.name,
          description: editTemplateInfo.description,
          departmentId: editTemplateInfo.departmentId
        };
        localStorage.setItem('templateInfo', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    toast.success('Template information updated successfully');
    setShowEditModal(false);
  };


  const handleBack = () => {
    console.log('🔙 Back button clicked, hasUnsavedChanges:', hasUnsavedChanges);
    if (hasUnsavedChanges) {
      console.log('⚠️ Showing discard modal');
      setShowDiscardModal(true);
    } else {
      console.log('✅ No unsaved changes, navigating back');
      // Clear currentTemplateId before navigating away
      clearCurrentTemplateId();
      navigate(ROUTES.TEMPLATES);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    setHasUnsavedChanges(false);
    // Clear currentTemplateId before navigating away
    clearCurrentTemplateId();
    navigate(ROUTES.TEMPLATES);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleSaveDraft = async () => {
    if (!onlyOfficeEditorRef.current) {
      toast.warning('Editor is not ready yet. Please wait...');
      return;
    }

    setIsSavingDraft(true);

    try {
      // Use saveAndDownload convenience method if available
      // This ensures save() is called before downloadAs()
      if (typeof onlyOfficeEditorRef.current.saveAndDownload === 'function') {
        await onlyOfficeEditorRef.current.saveAndDownload('docx');
        // Note: onDownloadAs event will be triggered asynchronously
        // The callback will handle setIsSavingDraft(false)
      } else {
        // Fallback: manual save then download
        if (typeof onlyOfficeEditorRef.current.save === 'function') {
          console.log('💾 Step 1: Calling save() to save all changes...');
          onlyOfficeEditorRef.current.save();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (typeof onlyOfficeEditorRef.current.downloadAs === 'function') {
          console.log('💾 Step 2: Calling downloadAs() to get document URL...');
          onlyOfficeEditorRef.current.downloadAs('docx');
        }
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      toast.error('Failed to save draft: ' + (error.message || 'Unknown error'));
      setIsSavingDraft(false);
    }
  };

  return (
    <PermissionWrapper 
      permission={PERMISSION_IDS.CREATE_TEMPLATE}
      fallback={
        <Container fluid className="py-4">
          <div className="text-center text-muted">
            <h4>Access Denied</h4>
            <p>You don't have permission to edit form templates.</p>
          </div>
        </Container>
      }
    >
      <Container fluid className="py-4 form-editor-page form-component" style={{ position: 'relative' }}>
        {/* Loading Overlay for Save Draft - Fixed position to cover entire editor */}
        {isSavingDraft && (
          <div 
            className="loading-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            <div className="text-center">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 mb-0 text-primary fw-semibold" style={{ fontSize: '1.1rem' }}>
                Saving draft...
              </p>
            </div>
          </div>
        )}
        <Card className="border-neutral-200 shadow-sm">
          <Card.Header className="border-neutral-200 form-editor-header bg-primary">
            <Row className="align-items-center">
              <Col xs={12} md={8}>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-light" 
                    onClick={handleBack} 
                    className="me-3"
                    size="sm"
                    style={{
                      borderWidth: '2px',
                      fontWeight: '500',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.borderColor = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = '#fff';
                    }}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <div className="d-flex align-items-center gap-2">
                    <div>
                      <h4 className="mb-0 text-white">
                        {templateInfo?.name || fileName}
                      </h4>
                      {importType && (
                        <small className="text-white" style={{ opacity: 0.9 }}>
                          Import Type: {importType}
                        </small>
                      )}
                    </div>
                    {templateInfo && (
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={handleOpenEditModal}
                        className="ms-2"
                        title="Edit Template Information"
                      >
                        <Pencil size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={4} className="d-flex justify-content-end align-items-center gap-2 mt-2 mt-md-0">
                {/* Show Original Template button only for "File with fields" */}
                {importType === 'File with fields' && (
                  <AddTemplateContentButton
                    onSuccess={(url) => {
                      console.log('✅ Template content uploaded:', url);
                      // Toast notification is already handled in AddTemplateContentButton component
                    }}
                  />
                )}
                {/* Hide Save Draft button when updating rejected template */}
                {!isUpdateRejected && (
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="d-flex align-items-center gap-2"
                    style={{
                      borderWidth: '2px',
                      fontWeight: '500',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(4px)',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSavingDraft) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.borderColor = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSavingDraft) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = '#fff';
                      }
                    }}
                  >
                    {isSavingDraft ? (
                      <>
                        <Spinner animation="border" size="sm" variant="light" style={{ width: '14px', height: '14px' }} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Draft</span>
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => setShowHelpModal(true)}
                  className="d-flex align-items-center justify-content-center text-white"
                  style={{
                    borderWidth: '2px',
                    fontWeight: '700',
                    fontSize: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(4px)',
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    color: '#ffffff !important',
                    lineHeight: '1'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = '#fff';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = '#fff';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  title="System Syntax Guidance"
                >
                  ?
                </Button>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0" style={{ position: 'relative' }}>
            <OnlyOfficeFormEditor
              ref={onlyOfficeEditorRef}
              initialContent={content}
              fileName={fileName}
              showImportInfo={!!importType}
              importType={importType}
              initialSections={initialSections}
              isUpdateRejected={isUpdateRejected}
              onHasUnsavedChangesChange={setHasUnsavedChanges}
              onDraftSaved={async (draftUrl) => {
                // CRITICAL: Check if we're in Submit flow using sessionStorage
                // This prevents building DRAFT template when user is actually submitting
                try {
                  console.log('🔍 onDraftSaved called - checking sessionStorage...')
                  
                  const isSubmitting = sessionStorage.getItem('onlyoffice_submitting') === 'true'
                  const submitDocKey = sessionStorage.getItem('onlyoffice_submit_docKey')
                  
                  console.log('🔍 SessionStorage check:', {
                    isSubmitting,
                    submitDocKey,
                    draftUrl: draftUrl.substring(0, 100) + '...'
                  })
                  
                  if (isSubmitting && submitDocKey) {
                    // Extract documentKey from URL - try shardkey parameter first, then path
                    let urlDocKey = null
                    
                    // Method 1: Extract from shardkey parameter (most reliable)
                    const shardkeyMatch = draftUrl.match(/[?&]shardkey=([^&]+)/)
                    if (shardkeyMatch) {
                      urlDocKey = shardkeyMatch[1]
                      console.log('🔍 Extracted docKey from shardkey:', urlDocKey)
                    } else {
                      // Method 2: Extract from path (format: doc-{timestamp}-{random}_xxxx)
                      const pathMatch = draftUrl.match(/doc-([^_/]+)/)
                      if (pathMatch) {
                        urlDocKey = `doc-${pathMatch[1]}`
                        console.log('🔍 Extracted docKey from path:', urlDocKey)
                      }
                    }
                    
                    console.log('🔍 Comparing:', {
                      submitDocKey,
                      urlDocKey,
                      match: urlDocKey && submitDocKey === urlDocKey
                    })
                    
                    if (urlDocKey && submitDocKey === urlDocKey) {
                      // This is from Submit flow - don't build DRAFT template
                      console.log('⚠️ Draft save ignored - Submit in progress')
                      console.log(`   Submit docKey: ${submitDocKey}, URL docKey: ${urlDocKey}`)
                      setIsSavingDraft(false)
                      return // Exit early - don't build template
                    } else {
                      console.log('⚠️ Submit in progress but documentKey mismatch - treating as Draft anyway')
                      console.log(`   Submit docKey: ${submitDocKey}, URL docKey: ${urlDocKey}`)
                    }
                  }
                  
                  // This is a real Draft save (not from Submit flow)
                  // Step: Upload from OnlyOffice URL to S3, then build and submit template with status DRAFT
                  try {
                    console.log('📤 Processing draft save - uploading to S3 and building template...');
                    
                    // Call buildAndSubmitDraftTemplate from OnlyOfficeFormEditor
                    // This function will:
                    // 1. Upload from OnlyOffice URL to S3
                    // 2. Build template payload with status DRAFT
                    // 3. Submit to backend
                    if (onlyOfficeEditorRef.current && typeof onlyOfficeEditorRef.current.buildAndSubmitDraftTemplate === 'function') {
                      await onlyOfficeEditorRef.current.buildAndSubmitDraftTemplate(draftUrl);
                      console.log('✅ Draft template saved successfully!');
                    } else {
                      console.warn('⚠️ buildAndSubmitDraftTemplate function not available');
                      toast.warning('Draft URL saved but template not created');
                    }
                  } catch (draftErr) {
                    console.error('❌ Error building/submitting draft template:', draftErr);
                    toast.error('Failed to save draft template: ' + (draftErr.message || 'Unknown error'));
                  } finally {
                    setIsSavingDraft(false);
                  }
                } catch (error) {
                  console.error('❌ Error in onDraftSaved callback:', error)
                  setIsSavingDraft(false)
                  toast.error('Error processing draft save')
                }
              }}
            />
          </Card.Body>
        </Card>

        {/* Discard Changes Warning Modal */}
        <Modal 
          show={showDiscardModal} 
          onHide={handleCancelDiscard} 
          centered
        >
          <Modal.Header 
            className="bg-warning text-dark border-0"
            style={{ 
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem',
              padding: '1.25rem 1.5rem'
            }}
          >
            <Modal.Title className="text-dark mb-0" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Discard Changes?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '1.5rem' }}>
            <p className="mb-0" style={{ fontSize: '1rem', color: 'var(--bs-dark)' }}>
              You have unsaved changes in the document. Are you sure you want to leave without saving?
            </p>
            <p className="mt-2 mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
              All unsaved changes will be lost.
            </p>
          </Modal.Body>
          <Modal.Footer 
            className="border-0"
            style={{ 
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--bs-neutral-200)'
            }}
          >
            <Button
              variant="secondary"
              onClick={handleCancelDiscard}
              style={{
                backgroundColor: 'var(--bs-secondary)',
                borderColor: 'var(--bs-secondary)',
                color: 'white',
                fontWeight: 500,
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleConfirmDiscard}
              style={{
                backgroundColor: '#ffc107',
                borderColor: '#ffc107',
                color: '#212529',
                fontWeight: 500,
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                transition: 'all 0.3s ease'
              }}
            >
              Discard Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Template Information Modal */}
        <Modal 
          show={showEditModal} 
          onHide={handleCloseEditModal} 
          size="lg" 
          centered
        >
          <Modal.Header className="bg-primary-custom text-white border-0">
            <Modal.Title className="d-flex align-items-center">
              <Pencil className="me-2" size={20} />
              Edit Template Information
            </Modal.Title>
            <Button
              variant="link"
              onClick={handleCloseEditModal}
              className="text-white text-decoration-none"
              style={{ fontSize: '1.5rem', lineHeight: 1 }}
            >
              ×
            </Button>
          </Modal.Header>

          <Modal.Body className="p-4">
            <Form>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Template Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Flight Training Assessment Form"
                      value={editTemplateInfo.name}
                      onChange={(e) => setEditTemplateInfo(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="e.g., Comprehensive flight training evaluation form with competency assessment"
                      value={editTemplateInfo.description}
                      onChange={(e) => setEditTemplateInfo(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Department <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={editTemplateInfo.departmentId}
                      onChange={(e) => setEditTemplateInfo(prev => ({ ...prev, departmentId: e.target.value }))}
                      required
                      disabled={loadingDepartments}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingDepartments && (
                      <Form.Text className="text-muted">
                        Loading departments...
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button
              variant="outline-secondary"
              onClick={handleCloseEditModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary-custom"
              onClick={handleSaveEdit}
              disabled={!editTemplateInfo.name || !editTemplateInfo.description || !editTemplateInfo.departmentId}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* System Syntax Guidance Modal */}
        <Modal 
          show={showHelpModal} 
          onHide={() => setShowHelpModal(false)} 
          size="lg" 
          centered
          className="syntax-guide-modal"
        >
          <Modal.Header className="bg-primary-custom text-white border-0">
            <Modal.Title className="d-flex align-items-center">
              <QuestionCircle className="me-2" size={20} />
              System Syntax Guidance
            </Modal.Title>
            <Button
              variant="link"
              onClick={() => setShowHelpModal(false)}
              className="text-white text-decoration-none"
              style={{ fontSize: '1.5rem', lineHeight: 1 }}
            >
              <X size={24} />
            </Button>
          </Modal.Header>

          <Modal.Body style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="syntax-guide-content">
              <div className="syntax-list mb-4">
                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Field:</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">&#123;variable_name&#125;</code>
                      <div className="data-type-info mt-1">Data Types: TEXT, VALUE_LIST, FINAL_SCORE_TEXT, FINAL_SCORE_NUM</div>
                    </div>
                  </div>
                </div>

                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Signature (image):</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">&#123;%signature&#125;</code>
                      <div className="data-type-info mt-1">Data Types: SIGNATURE_DRAW, SIGNATURE_IMG</div>
                    </div>
                  </div>
                </div>

                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Part:</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">&#123;#Part_Name&#125; &#123;field1&#125; &#123;field2&#125; &#123;/Part_Name&#125;</code>
                      <div className="data-type-info mt-1">Data Types: PART</div>
                    </div>
                  </div>
                </div>

                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Check box:</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">&#123;#Checkbox_Name&#125; &#123;check1&#125; &#123;check2&#125; &#123;/Checkbox_Name&#125;</code>
                      <div className="data-type-info mt-1">Data Types: CHECK_BOX</div>
                    </div>
                  </div>
                </div>

                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Conditions:</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">&#123;#isCondition&#125; &#123;true&#125; &#123;/isCondition&#125;</code>
                      <div className="data-type-info mt-1">Data Types: TOGGLE, SECTION_CONTROL_TOGGLE</div>
                    </div>
                  </div>
                </div>

                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Inverted Conditions:</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">&#123;^isCondition&#125; &#123;false&#125; &#123;/isCondition&#125;</code>
                      <div className="data-type-info mt-1">Data Types: TOGGLE, SECTION_CONTROL_TOGGLE</div>
                    </div>
                  </div>
                </div>

                <div className="syntax-item mb-3">
                  <div className="d-flex align-items-start">
                    <strong className="me-3" style={{ minWidth: '120px', fontWeight: 600, color: '#172B4D' }}>Advanced Syntax:</strong>
                    <div className="flex-grow-1">
                      <code className="syntax-pill">Operators: + - * % /</code>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-4" style={{ borderColor: '#dfe1e6' }} />

              <h5 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172B4D' }}>Sections-Fields Rule</h5>
              <ul className="rule-list mb-4" style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li>Create a Section first, then you can create Fields belonging to that Section.</li>
                <li>You can drag the Section card to change the position of Sections.</li>
                <li>You can drag the Field card to change the position of Fields within the same or between Sections.</li>
              </ul>

              <h5 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172B4D' }}>Template Rule</h5>
              <ul className="rule-list" style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li>Placeholders in the Template must match the Available Fields (e.g., no Field in the Template that is not in Available Fields when submitting, and vice versa).</li>
                <li>For the "Submittable" field of a Section for a TRAINER, it means only the person Assessing that Section later will be allowed to Submit the Assessment Form and there must be one or more Section that is "Submittable".</li>
                <li>For the "Toggle Dependent" field of a Section for a TRAINER:
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li>It means the person Assessing this Section is allowed to skip Fields without filling them in.</li>
                    <li>There must be exactly one Field with the Field Type SECTION_CONTROL_TOGGLE.</li>
                  </ul>
                </li>
                <li>A Field with the type FINAL_SCORE_TEXT or FINAL_SCORE_NUM must exist (serving the purpose of Assessing TRAINEE), and no more than two Fields with this same Field Type can exist.</li>
                <li>There must exist one Section for Trainee that have the SIGNATURE_DRAW field (Trainee must sign confirmation for the Assessment).</li>
              </ul>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button
              variant="primary-custom"
              onClick={() => setShowHelpModal(false)}
              style={{
                fontWeight: 500,
                padding: '0.5rem 1.5rem'
              }}
            >
              Got it
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </PermissionWrapper>
  );
};

export default FormEditorPage;
