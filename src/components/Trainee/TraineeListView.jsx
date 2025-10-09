import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Plus, Upload, People } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import traineeAPI from '../../api/trainee';
import TraineeTable from './TraineeTable';
import AddTraineeModal from './AddTraineeModal';
import BulkImportTraineesModal from './BulkImportTraineesModal';

const TraineeListView = () => {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrainee, setShowAddTrainee] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [isSavingTrainee, setIsSavingTrainee] = useState(false);

  // Load trainees data
  useEffect(() => {
    loadTrainees();
  }, []);

  const loadTrainees = async () => {
    try {
      setLoading(true);
      const response = await traineeAPI.getTrainees();
      setTrainees(response.trainees || response.data || []);
    } catch (error) {
      console.error('Error loading trainees:', error);
      toast.error('Failed to load trainees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainee = () => {
    setShowAddTrainee(true);
  };

  const handleBulkImport = () => {
    setShowBulkImport(true);
  };

  const handleSaveTrainee = async (traineeData) => {
    try {
      setIsSavingTrainee(true);
      const created = await traineeAPI.createTrainee(traineeData);
      
      toast.success('Trainee created successfully');
      
      // Add to list
      setTrainees(prev => [created, ...prev]);
      setShowAddTrainee(false);
    } catch (error) {
      console.error('Error creating trainee:', error);
      toast.error(error.response?.data?.message || 'Failed to create trainee');
    } finally {
      setIsSavingTrainee(false);
    }
  };

  const handleBulkImportTrainees = async (fileData) => {
    try {
      const result = await traineeAPI.bulkImportTrainees(fileData);
      toast.success(`Successfully imported ${result.importedCount} trainees`);
      
      // Reload trainees
      loadTrainees();
      setShowBulkImport(false);
    } catch (error) {
      console.error('Error importing trainees:', error);
      toast.error(error.response?.data?.message || 'Failed to import trainees');
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 d-flex align-items-center">
                <People className="me-2" size={28} />
                Trainee Management
              </h2>
              <p className="text-muted mb-0">Manage trainee information and enrollments</p>
            </div>
            <div className="d-flex gap-2">
              <PermissionWrapper permission={API_PERMISSIONS.TRAINEES.BULK_IMPORT}>
                <Button variant="outline-primary" onClick={handleBulkImport}>
                  <Upload className="me-1" size={16} />
                  Bulk Import
                </Button>
              </PermissionWrapper>
              <PermissionWrapper permission={API_PERMISSIONS.TRAINEES.CREATE}>
                <Button variant="primary-custom" onClick={handleAddTrainee}>
                  <Plus className="me-1" size={16} />
                  Add New Trainee
                </Button>
              </PermissionWrapper>
            </div>
          </div>
        </Col>
      </Row>

      {/* Trainees Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Trainees ({trainees.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <TraineeTable 
                trainees={trainees}
                loading={loading}
                onRefresh={loadTrainees}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <AddTraineeModal
        show={showAddTrainee}
        onClose={() => setShowAddTrainee(false)}
        onSave={handleSaveTrainee}
        loading={isSavingTrainee}
      />

      <BulkImportTraineesModal
        show={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImportTrainees}
      />
    </Container>
  );
};

export default TraineeListView;
