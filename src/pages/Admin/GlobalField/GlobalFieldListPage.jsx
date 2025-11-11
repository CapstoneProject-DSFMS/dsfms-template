import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { globalFieldAPI } from '../../../api';
import { LoadingSkeleton, PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';
import GlobalFieldCard from '../../../components/Admin/GlobalField/GlobalFieldCard';
import GlobalFieldDetailModal from '../../../components/Admin/GlobalField/GlobalFieldDetailModal';
import EditGlobalFieldModal from '../../../components/Admin/GlobalField/EditGlobalFieldModal';
import CreateGlobalFieldModal from '../../../components/Admin/GlobalField/CreateGlobalFieldModal';

const GlobalFieldListPage = () => {
  const [globalFields, setGlobalFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldDetails, setFieldDetails] = useState(null);

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
      const response = await globalFieldAPI.getGlobalFieldDetail();
      const details = response?.data || response || [];
      
      // Find the matching field by ID
      const fieldDetail = details.find(f => f.id === field.id);
      
      if (fieldDetail) {
        setFieldDetails(fieldDetail);
        setShowDetailModal(true);
      } else {
        // If not found in detail, use basic field info
        setFieldDetails(field);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error loading field detail:', error);
      toast.error('Failed to load field details');
      // Still show modal with basic info
      setFieldDetails(field);
      setShowDetailModal(true);
    }
  };

  const handleEdit = (field) => {
    setSelectedField(field);
    setShowEditModal(true);
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
    <Container fluid className="py-4">
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
                permission={API_PERMISSIONS.GLOBAL_FIELDS.CREATE}
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
                <Col key={field.id} xs={12} sm={6} md={6} lg={4} xl={3}>
                  <GlobalFieldCard
                    field={field}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEdit}
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
    </Container>
  );
};

export default GlobalFieldListPage;

