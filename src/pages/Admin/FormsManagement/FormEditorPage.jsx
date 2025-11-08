import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { ArrowLeft, Pencil } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import OnlyOfficeFormEditor from '../../../components/Admin/Forms/OnlyOfficeFormEditor';
import { PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';
import { departmentAPI } from '../../../api/department';

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

  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      const { 
        content: initialContent, 
        documentUrl: initialDocumentUrl,
        fileName: initialFileName, 
        importType: initialImportType,
        templateInfo: initialTemplateInfo
      } = location.state;
      
      // Use documentUrl if available (from upload), otherwise use content
      const finalContent = initialDocumentUrl || initialContent || '';
      setContent(finalContent);
      setFileName(initialFileName || 'Untitled Document');
      setImportType(initialImportType || '');
      setTemplateInfo(initialTemplateInfo || null);
      
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
    navigate('/admin/forms');
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
            </Row>
          </Card.Header>

          <Card.Body className="p-0">
            <OnlyOfficeFormEditor
              initialContent={content}
              fileName={fileName}
              showImportInfo={!!importType}
              importType={importType}
            />
          </Card.Body>
        </Card>

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
