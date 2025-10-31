import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Card, Alert } from 'react-bootstrap';
import { 
  ArrowLeft,
  FileEarmarkPdf,
  Clock,
  CheckCircle,
  Calendar,
  Person,
  FileText
} from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSkeleton, AdminTable, PermissionWrapper } from '../../components/Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TemplateDetailPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTemplateDetail();
  }, [templateId]);

  const loadTemplateDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockTemplate = {
        id: templateId,
        name: 'Safety Assessment Template',
        description: 'Comprehensive safety assessment template for training courses. This template covers all essential safety protocols and procedures required for workplace safety training.',
        version: 'v2.1',
        category: 'SAFETY',
        totalSections: 5,
        totalFields: 23,
        status: 'ACTIVE',
        createdBy: 'John Smith',
        createdAt: '2024-01-15T00:00:00.000Z',
        lastModified: '2024-01-20T00:00:00.000Z',
        lastModifiedBy: 'Sarah Johnson',
        sections: [
          {
            id: '1',
            name: 'Personal Protective Equipment',
            fields: 8,
            order: 1
          },
          {
            id: '2',
            name: 'Emergency Procedures',
            fields: 6,
            order: 2
          },
          {
            id: '3',
            name: 'Hazard Identification',
            fields: 5,
            order: 3
          },
          {
            id: '4',
            name: 'Safety Training Records',
            fields: 3,
            order: 4
          },
          {
            id: '5',
            name: 'Compliance Verification',
            fields: 1,
            order: 5
          }
        ],
        history: [
          {
            version: 'v2.1',
            date: '2024-01-20T00:00:00.000Z',
            modifiedBy: 'Sarah Johnson',
            changes: 'Updated emergency procedures section'
          },
          {
            version: 'v2.0',
            date: '2024-01-15T00:00:00.000Z',
            modifiedBy: 'John Smith',
            changes: 'Initial creation of template'
          }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplate(mockTemplate);
    } catch (error) {
      console.error('Error loading template detail:', error);
      setError('Failed to load template details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { variant: 'success', icon: CheckCircle, text: 'ACTIVE' };
      case 'DRAFT':
        return { variant: 'warning', icon: Clock, text: 'DRAFT' };
      case 'INACTIVE':
        return { variant: 'secondary', icon: Clock, text: 'INACTIVE' };
      default:
        return { variant: 'secondary', icon: Clock, text: status };
    }
  };

  const handleExportPDF = () => {
    console.log('Export PDF for template:', templateId);
    // Export PDF functionality
    alert('PDF export functionality will be implemented');
  };

  const handleBackToList = () => {
    navigate('/sqa/templates');
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

  const statusConfig = getStatusConfig(template.status);
  const StatusIcon = statusConfig.icon;

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
            <PermissionWrapper 
              permissions={[API_PERMISSIONS.SQA.VIEW_TEMPLATES]}
              fallback={null}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportPDF}
                className="d-flex align-items-center"
              >
                <FileEarmarkPdf className="me-1" size={16} />
                Export PDF
              </Button>
            </PermissionWrapper>
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
                  className={`custom-tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Template Overview
                </button>
                <button 
                  className={`custom-tab ${activeTab === 'sections' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sections')}
                >
                  Sections
                </button>
                <button 
                  className={`custom-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  Version History
                </button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Template Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Version</label>
                        <div>
                          <Badge 
                            bg="info" 
                            className="px-2 py-1"
                            style={{ 
                              fontSize: '0.75rem',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2'
                            }}
                          >
                            {template.version}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-muted small">Status</label>
                        <div>
                          <Badge 
                            bg={statusConfig.variant} 
                            className="px-2 py-1 d-flex align-items-center"
                            style={{ 
                              fontSize: '0.75rem',
                              width: 'fit-content'
                            }}
                          >
                            <StatusIcon className="me-1" size={12} />
                            {statusConfig.text}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-muted small">Total Sections</label>
                        <div className="fw-medium">{template.totalSections} sections</div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Created By</label>
                        <div className="d-flex align-items-center">
                          <Person className="me-2" size={16} />
                          <span>{template.createdBy}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-muted small">Created Date</label>
                        <div className="d-flex align-items-center">
                          <Calendar className="me-2" size={16} />
                          <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="text-muted small">Last Modified</label>
                        <div className="d-flex align-items-center">
                          <Clock className="me-2" size={16} />
                          <span>{new Date(template.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Sections Tab */}
              {activeTab === 'sections' && (
                <div className="p-4">
                  <AdminTable
                    data={template.sections || []}
                    loading={false}
                    columns={[
                      { key: 'name', title: 'Section Name', className: 'show-mobile', sortable: true },
                      { key: 'fields', title: 'Fields', className: 'show-mobile', sortable: true },
                      { key: 'order', title: 'Order', className: 'show-mobile', sortable: true }
                    ]}
                    renderRow={(section, index) => (
                      <tr 
                        key={section.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                        style={{
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                        }}
                      >
                        <td className="align-middle show-mobile">
                          <div className="d-flex align-items-center">
                            <FileText className="me-2 text-primary" size={16} />
                            <span className="fw-medium">{section.name}</span>
                          </div>
                        </td>
                        <td className="align-middle show-mobile">
                          <Badge bg="secondary" className="px-2 py-1">
                            {section.fields} fields
                          </Badge>
                        </td>
                        <td className="align-middle show-mobile">
                          <span className="text-muted">{section.order}</span>
                        </td>
                      </tr>
                    )}
                    emptyMessage="No sections found"
                    emptyDescription="This template has no sections."
                  />
                </div>
              )}

              {/* Version History Tab */}
              {activeTab === 'history' && (
                <div className="p-4">
                  <AdminTable
                    data={template.history || []}
                    loading={false}
                    columns={[
                      { key: 'version', title: 'Version', className: 'show-mobile', sortable: true },
                      { key: 'modifiedBy', title: 'Modified By', className: 'show-mobile', sortable: true },
                      { key: 'date', title: 'Date', className: 'show-mobile', sortable: true },
                      { key: 'changes', title: 'Changes', className: 'show-mobile', sortable: true }
                    ]}
                    renderRow={(version, index) => (
                      <tr 
                        key={index}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                        style={{
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                        }}
                      >
                        <td className="align-middle show-mobile">
                          <Badge 
                            bg="info" 
                            className="px-2 py-1"
                            style={{ 
                              fontSize: '0.75rem',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2'
                            }}
                          >
                            {version.version}
                          </Badge>
                        </td>
                        <td className="align-middle show-mobile">
                          <div className="d-flex align-items-center">
                            <Person className="me-2" size={16} />
                            <span>{version.modifiedBy}</span>
                          </div>
                        </td>
                        <td className="align-middle show-mobile">
                          <div className="d-flex align-items-center">
                            <Calendar className="me-2" size={16} />
                            <span>{new Date(version.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="align-middle show-mobile">
                          <span className="text-muted">{version.changes}</span>
                        </td>
                      </tr>
                    )}
                    emptyMessage="No version history found"
                    emptyDescription="This template has no version history."
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TemplateDetailPage;