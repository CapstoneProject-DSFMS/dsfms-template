import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FileEarmarkPdf } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingSkeleton } from '../../components/Common';
import { templateAPI } from '../../api';
import TemplateTabs from '../../components/SQA/TemplateTabs';
import TemplateListContent from '../../components/SQA/TemplateListContent';

const TemplateListPage = () => {
  const navigate = useNavigate();
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // Fetch all templates (PENDING, PUBLISHED, DENIED)
      const response = await templateAPI.getTemplates();
      
      // Handle response structure: { success: true, data: [...] }
      let templatesData = [];
      if (response.success && response.data) {
        templatesData = response.data;
      } else if (Array.isArray(response)) {
        templatesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        templatesData = response.data;
      }
      
      setAllTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
      setAllTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Get status filter based on active tab
  const getStatusForTab = (tab) => {
    switch (tab) {
      case 'pending':
        return 'PENDING';
      case 'approved':
        return 'PUBLISHED';
      case 'denied':
        return ['DENIED', 'REJECTED']; // Support both status values
      default:
        return null;
    }
  };

  // Filter templates by active tab
  const templatesByTab = useMemo(() => {
    const status = getStatusForTab(activeTab);
    if (!status) return [];
    if (Array.isArray(status)) {
      // For denied tab, match both DENIED and REJECTED
      return allTemplates.filter(template => status.includes(template.status));
    }
    return allTemplates.filter(template => template.status === status);
  }, [allTemplates, activeTab]);

  // Filter templates by search term
  const filteredTemplates = useMemo(() => {
    return templatesByTab.filter(template => {
      const name = template.name?.toLowerCase() || '';
      const description = template.description?.toLowerCase() || '';
      const createdBy = template.createdBy?.toLowerCase() || 
                       (template.createdByUser?.firstName && template.createdByUser?.lastName
                         ? `${template.createdByUser.firstName} ${template.createdByUser.lastName}`.toLowerCase()
                         : '');
      
      return name.includes(searchTerm.toLowerCase()) ||
             description.includes(searchTerm.toLowerCase()) ||
             createdBy.includes(searchTerm.toLowerCase());
    });
  }, [templatesByTab, searchTerm]);

  // Calculate counts for each tab
  const tabCounts = useMemo(() => {
    return {
      pending: allTemplates.filter(t => t.status === 'PENDING').length,
      approved: allTemplates.filter(t => t.status === 'PUBLISHED').length,
      denied: allTemplates.filter(t => t.status === 'DENIED' || t.status === 'REJECTED').length
    };
  }, [allTemplates]);

  const handleViewDetail = (templateId) => {
    console.log('View detail for template:', templateId);
    navigate(`/sqa/templates/${templateId}`);
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 template-list-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <div>
              </div>
            </Col>
            <Col xs={12} md={6} className="mt-2 mt-md-0">
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center"
                >
                  <FileEarmarkPdf className="me-1" size={16} />
                  Export Templates
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        {/* Tabs */}
        <TemplateTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        <Card.Body>
          <TemplateListContent
            templates={filteredTemplates}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onViewDetail={handleViewDetail}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TemplateListPage;