import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { ArrowLeft, Pencil, Save } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import OnlyOfficeFormEditor from '../../../components/Admin/Forms/OnlyOfficeFormEditor';
import AddTemplateContentButton from '../../../components/Admin/Forms/AddTemplateContentButton';
import { PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';
import { departmentAPI } from '../../../api/department';
import { readTemplateMetaFromStorage } from '../../../utils/templateBuilder';

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
  const onlyOfficeEditorRef = useRef(null);

  // Debug: Log when hasUnsavedChanges changes
  useEffect(() => {
    console.log('🔔 hasUnsavedChanges changed:', hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  const [initialSections, setInitialSections] = useState(null);

  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      const { 
        content: initialContent, 
        documentUrl: initialDocumentUrl,
        fileName: initialFileName, 
        importType: initialImportType,
        templateInfo: initialTemplateInfo,
        initialSections: sectionsFromState // ← Get initialSections from navigation state
      } = location.state;
      
      // For "File with fields": Use editorDocumentUrl if available (from import), otherwise use documentUrl/content
      // This is the file to load in OnlyOffice editor (not templateContent)
      let finalContent = initialDocumentUrl || initialContent || '';
      if (initialTemplateInfo?.editorDocumentUrl) {
        finalContent = initialTemplateInfo.editorDocumentUrl;
      }
      
      setContent(finalContent);
      setFileName(initialFileName || 'Untitled Document');
      setImportType(initialImportType || '');
      setTemplateInfo(initialTemplateInfo || null);
      
      // Set initialSections to pass down to OnlyOfficeFormEditor
      if (sectionsFromState && Array.isArray(sectionsFromState)) {
        setInitialSections(sectionsFromState);
        console.log('📥 FormEditorPage received initialSections:', sectionsFromState);
      }
      
      // Initialize edit form with template info
      if (initialTemplateInfo) {
        setEditTemplateInfo({
          name: initialTemplateInfo.name || '',
          description: initialTemplateInfo.description || '',
          departmentId: initialTemplateInfo.departmentId || ''
        });
      }
      
      console.log('📄 FormEditorPage received:', { 
        documentUrl: initialDocumentUrl, 
        content: initialContent, 
        fileName: initialFileName,
        templateInfo: initialTemplateInfo,
        initialSections: sectionsFromState,
        finalContent: finalContent
      });
    }
  }, [location.state]);

  // Load departments when edit modal opens
  useEffect(() => {
    if (showEditModal) {
      loadDepartments();
    }
  }, [showEditModal]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentAPI.getDepartments();
      const departmentsData = response.departments || response.data || [];
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
      navigate('/admin/forms');
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    setHasUnsavedChanges(false);
    navigate('/admin/forms');
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
    toast.info('Saving draft...');

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
      permission={API_PERMISSIONS.TEMPLATES.CREATE}
      fallback={
        <Container fluid className="py-4">
          <div className="text-center text-muted">
            <h4>Access Denied</h4>
            <p>You don't have permission to edit form templates.</p>
          </div>
        </Container>
      }
    >
      <Container fluid className="py-4 form-editor-page form-component">
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
                  <Save size={16} />
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </Button>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0">
            <OnlyOfficeFormEditor
              ref={onlyOfficeEditorRef}
              initialContent={content}
              fileName={fileName}
              showImportInfo={!!importType}
              importType={importType}
              initialSections={initialSections}
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

      </Container>
    </PermissionWrapper>
  );
};

export default FormEditorPage;
