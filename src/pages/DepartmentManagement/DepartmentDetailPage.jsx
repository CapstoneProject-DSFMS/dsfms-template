import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../api';
import DepartmentHeader from '../../components/DepartmentManagement/DepartmentHeader';
import DepartmentTabs from '../../components/DepartmentManagement/DepartmentTabs';
import EditDepartmentDetails from '../../components/DepartmentManagement/EditDepartmentDetails';
import AddTrainersToDepartment from '../../components/DepartmentManagement/AddTrainersToDepartment';
import DepartmentInfo from '../../components/DepartmentManagement/DepartmentInfo';
import '../../styles/department-tabs.css';

// Helper function to transform API data to expected format
const transformDepartmentData = (response) => {
  return {
    id: response.id,
    name: response.name,
    code: response.code,
    description: response.description,
    headUserId: response.headUserId,
    headUser: response.headUser,
    isActive: response.isActive,
    courseCount: response.courseCount || 0,
    traineeCount: response.traineeCount || 0,
    trainerCount: response.trainerCount || 0,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    deletedAt: response.deletedAt
  };
};

const DepartmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'trainers', or 'edit'

  useEffect(() => {
    const loadDepartment = async () => {
      if (!id) {
        toast.error('Department ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await departmentAPI.getDepartmentById(id);
        // Transform API data to match expected format
        const transformedDepartment = transformDepartmentData(response);
        setDepartment(transformedDepartment);
      } catch (err) {
        console.error('Error loading department:', err);
        toast.error('Failed to load department details');
        setError('Failed to load department details');
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/departments');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <div className="text-danger mb-3">
            <h5>Unable to load department</h5>
            <p className="text-muted">Please try again or contact support if the problem persists.</p>
          </div>
          <Button variant="outline-primary" onClick={handleBack}>
            <ArrowLeft className="me-2" />
            Back to Departments
          </Button>
        </div>
      </Container>
    );
  }

  if (!department) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <div className="text-warning mb-3">
            <h5>Department not found</h5>
            <p className="text-muted">The department you're looking for doesn't exist or has been removed.</p>
          </div>
          <Button variant="outline-primary" onClick={handleBack}>
            <ArrowLeft className="me-2" />
            Back to Departments
          </Button>
        </div>
      </Container>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <DepartmentInfo 
            department={department}
          />
        );
      case 'trainers':
        return (
          <AddTrainersToDepartment 
            department={department}
          />
        );
      case 'edit':
        return (
          <EditDepartmentDetails 
            department={department} 
            onUpdate={setDepartment}
          />
        );
      default:
        return (
          <DepartmentInfo 
            department={department}
          />
        );
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <DepartmentHeader 
        department={department} 
        onBack={handleBack} 
      />

      {/* Tabs Navigation */}
      <DepartmentTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content Area */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {renderTabContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};


export default DepartmentDetailPage;
