import React, { useState, useEffect } from 'react';
import { Row, Col, Badge, Alert, Card, Button } from 'react-bootstrap';
import { Clock, CheckCircle, Calendar, Person, Download } from 'react-bootstrap-icons';
import templateAPI from '../../api/template';
import { toast } from 'react-toastify';

const OldTemplateVersionDetailsTab = ({ template }) => {
  const [oldVersion, setOldVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOldVersion = async () => {
      if (!template?.referFirstVersionId) {
        setError('No previous version found');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await templateAPI.getTemplateById(template.referFirstVersionId);
        const templateForm = response?.data?.templateForm || response?.data || response;
        const sectionsData = response?.data?.sections || templateForm?.sections || [];
        
        if (!templateForm) {
          setError('Old version template not found');
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
          totalSections: sectionsData.length || 0,
          totalFields: sectionsData.reduce((total, section) => total + (section.fields?.length || 0), 0) || 0,
          status: templateForm.status || 'DRAFT',
          createdBy: getDisplayName(createdByUser),
          createdAt: templateForm.createdAt || templateForm.createdDate,
          lastModified: templateForm.updatedAt || templateForm.updatedDate || templateForm.createdAt,
          lastModifiedBy: getDisplayName(updatedByUser),
          sections: sectionsData,
          templateContent: templateForm.templateContent || null,
          templateConfig: templateForm.templateConfig || null,
          formId: templateForm.formId || templateForm.id
        };
        
        setOldVersion(mappedTemplate);
      } catch (error) {
        console.error('Error loading old version:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load old version details');
      } finally {
        setLoading(false);
      }
    };

    loadOldVersion();
  }, [template?.referFirstVersionId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { variant: 'success', icon: CheckCircle, text: 'ACTIVE' };
      case 'DRAFT':
        return { variant: 'warning', icon: Clock, text: 'DRAFT' };
      case 'INACTIVE':
        return { variant: 'secondary', icon: Clock, text: 'INACTIVE' };
      case 'PENDING':
        return { variant: 'warning', icon: Clock, text: 'PENDING' };
      case 'PUBLISHED':
        return { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' };
      case 'REJECTED':
      case 'DENIED':
        return { variant: 'danger', icon: Clock, text: 'REJECTED' };
      default:
        return { variant: 'secondary', icon: Clock, text: status };
    }
  };

  const handleViewTemplateConfig = () => {
    if (oldVersion?.templateConfig) {
      window.open(oldVersion.templateConfig, '_blank', 'noopener,noreferrer');
    } else {
      toast.warning('Template config is not available');
    }
  };


  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading old version details...</p>
        </div>
      </div>
    );
  }

  if (error || !oldVersion) {
    return (
      <div className="p-4">
        <Alert variant="info">
          <Alert.Heading>No Previous Version</Alert.Heading>
          <p className="mb-0">
            {error || 'This template does not have a previous version.'}
          </p>
        </Alert>
      </div>
    );
  }

  const statusConfig = getStatusConfig(oldVersion.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4">
      {/* Header Actions */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleViewTemplateConfig}
          className="d-flex align-items-center"
          disabled={!oldVersion?.templateConfig}
        >
          <Download className="me-2" size={16} />
          View Template Config
        </Button>
      </div>

      {/* Template Information */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Template Information</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Template Name</label>
                <div className="fw-medium">{oldVersion.name}</div>
              </div>
              
              <div className="mb-3">
                <label className="text-muted small">Description</label>
                <div>{oldVersion.description || 'N/A'}</div>
              </div>
              
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
                    {oldVersion.version}
                  </Badge>
                </div>
              </div>
            </Col>
            
            <Col md={6}>
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
                <div className="fw-medium">{oldVersion.totalSections} sections</div>
              </div>
              
              <div className="mb-3">
                <label className="text-muted small">Total Fields</label>
                <div className="fw-medium">{oldVersion.totalFields} fields</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Metadata */}
      <Card>
        <Card.Header className="bg-light">
          <h6 className="mb-0">Metadata</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Created By</label>
                <div className="d-flex align-items-center">
                  <Person className="me-2" size={16} />
                  <span>{oldVersion.createdBy}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="text-muted small">Created Date</label>
                <div className="d-flex align-items-center">
                  <Calendar className="me-2" size={16} />
                  <span>{oldVersion.createdAt ? new Date(oldVersion.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Last Modified By</label>
                <div className="d-flex align-items-center">
                  <Person className="me-2" size={16} />
                  <span>{oldVersion.lastModifiedBy || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="text-muted small">Last Modified</label>
                <div className="d-flex align-items-center">
                  <Clock className="me-2" size={16} />
                  <span>{oldVersion.lastModified ? new Date(oldVersion.lastModified).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OldTemplateVersionDetailsTab;

