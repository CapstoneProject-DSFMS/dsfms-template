import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { globalFieldAPI } from '../../../api';
import { LoadingSkeleton, PermissionWrapper } from '../../../components/Common';
import { PERMISSION_IDS } from '../../../constants/permissionIds';
import GlobalFieldCard from '../../../components/Admin/GlobalField/GlobalFieldCard';
import GlobalFieldDetailModal from '../../../components/Admin/GlobalField/GlobalFieldDetailModal';
import EditGlobalFieldModal from '../../../components/Admin/GlobalField/EditGlobalFieldModal';
import CreateGlobalFieldModal from '../../../components/Admin/GlobalField/CreateGlobalFieldModal';
import DeleteGlobalFieldModal from '../../../components/Admin/GlobalField/DeleteGlobalFieldModal';
import '../../../styles/global-field-list.css';

const GlobalFieldListPage = () => {
  const [globalFields, setGlobalFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldDetails, setFieldDetails] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadGlobalFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await globalFieldAPI.getGlobalFields();
      const fields = response?.data || response || [];
      setGlobalFields(fields);
    } catch (error) {
      console.error('Error loading global fields:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load global fields');
      toast.error('Failed to load global fields');
      setGlobalFields([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGlobalFields();
  }, [loadGlobalFields]);

  const handleViewDetail = async (field) => {
    try {
      setSelectedField(field);
      
      // Load detailed field information
      const response = await globalFieldAPI.getGlobalFieldDetail(field.id);
      const fieldDetail = response?.data || response || field;
      
      setFieldDetails(fieldDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading field detail:', error);
      toast.error('Failed to load field details');
      // Still show modal with basic info
      setFieldDetails(field);
      setShowDetailModal(true);
    }
  };

  const handleEdit = async (field) => {
    try {
      setSelectedField(field);
      
      // Load detailed field information to ensure we have all data including fieldType
      const response = await globalFieldAPI.getGlobalFieldDetail(field.id);
      const fieldDetail = response?.data || response || field;
      
      setSelectedField(fieldDetail);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading field detail for edit:', error);
      toast.error('Failed to load field details');
      // Still open modal with basic info from list
      setSelectedField(field);
      setShowEditModal(true);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setFieldDetails(null);
    setSelectedField(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedField(null);
  };

  const handleEditSuccess = () => {
    loadGlobalFields();
  };

  const handleCreateSuccess = () => {
    loadGlobalFields();
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleDelete = (field) => {
    setSelectedField(field);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedField(null);
    setDeleting(false);
  };

  const handleConfirmDelete = async (fieldId) => {
    try {
      setDeleting(true);
      await globalFieldAPI.deleteGlobalField(fieldId);
      toast.success('Global field deleted successfully!');
      handleCloseDeleteModal();
      loadGlobalFields();
    } catch (error) {
      console.error('Error deleting global field:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete global field';
      toast.error(`Error: ${errorMessage}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Card className="border-neutral-200 shadow-sm">
          <Card.Header className="bg-primary-custom text-white">
            <h4 className="mb-0">Global Field List</h4>
          </Card.Header>
          <Card.Body>
            <LoadingSkeleton />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Card className="border-neutral-200 shadow-sm">
          <Card.Header className="bg-primary-custom text-white">
            <h4 className="mb-0">Global Field List</h4>
          </Card.Header>
          <Card.Body>
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 global-field-list-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header 
          className="bg-primary-custom text-white"
          style={{
            backgroundColor: '#1b3c53',
            borderBottom: 'none'
          }}
        >
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0 text-white">Global Field List</h4>
            </Col>
            <Col xs="auto" className="ms-auto">
              <PermissionWrapper 
                permission={PERMISSION_IDS.CREATE_GLOBAL_FIELD}
                fallback={null}
              >
                <Button
                  variant="light"
                  onClick={handleCreate}
                  className="d-flex align-items-center"
                  size="sm"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#dee2e6',
                    color: '#000000',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                >
                  <Plus className="me-2" size={16} />
                  <span className="d-none d-sm-inline">Create Global Field</span>
                  <span className="d-sm-none">Create</span>
                </Button>
              </PermissionWrapper>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {globalFields.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No global fields found</p>
            </div>
          ) : (
            <Row className="g-3 g-md-4">
              {globalFields.map((field) => (
                <Col 
                  key={field.id} 
                  xs={12} 
                  sm={6} 
                  md={6} 
                  lg={4} 
                  xl={3}
                  className="d-flex"
                  style={{ minHeight: '200px' }}
                >
                  <GlobalFieldCard
                    field={field}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <GlobalFieldDetailModal
        show={showDetailModal}
        onHide={handleCloseDetailModal}
        field={fieldDetails}
      />

      {/* Edit Modal */}
      <EditGlobalFieldModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        field={selectedField}
        onSuccess={handleEditSuccess}
      />

      {/* Create Modal */}
      <CreateGlobalFieldModal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Modal */}
      <DeleteGlobalFieldModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        field={selectedField}
        loading={deleting}
      />
    </Container>
  );
};

export default GlobalFieldListPage;

