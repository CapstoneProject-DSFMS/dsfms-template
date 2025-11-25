import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Upload, FileText, FileEarmark, Eye, CheckCircle, Clock, Building, Person } from 'react-bootstrap-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'react-toastify';
import { PermissionWrapper, LoadingSkeleton, SearchBar, FilterDropdown } from '../../../components/Common';
import { templateAPI } from '../../../api';
import { useTemplateListMode } from '../../../hooks/useTemplateListMode';
import ImportFileModal from '../../../components/Admin/Forms/ImportFileModal';
import TemplateDetailModal from '../../../components/Admin/Forms/TemplateDetailModal';
import PublishedTemplatesModal from '../../../components/Admin/Forms/PublishedTemplatesModal';
import TemplateTabs from '../../../components/SQA/TemplateTabs';
import TemplateListContent from '../../../components/SQA/TemplateListContent';

/**
 * Unified Template List Page
 * 
 * This component combines Admin and SQA template list functionality.
 * 
 * Logic:
 * - SQA Mode: User has VIEW_ALL_TEMPLATES + APPROVE_OR_REJECT_TEMPLATE
 *   - Shows tabs: Pending, Approved (Published), Rejected
 *   - Shows all templates (PENDING, PUBLISHED, DENIED, REJECTED)
 *   - "View Detail" button navigates to template detail page
 * 
 * - Admin Mode: User has only VIEW_ALL_TEMPLATES (without APPROVE_OR_REJECT_TEMPLATE)
 *   - Shows action buttons: "Your Drafts", "Create New Template's Version", "Create New Template"
 *   - Shows only PENDING templates
 *   - "Preview" button opens preview modal
 * 
 * TODO: Implement API endpoint for viewing templates created by current user
 * API: GET /templates/my-templates
 * This will be used by Admin to filter templates they created
 * const myTemplates = await templateAPI.getMyTemplates();
 */
const UnifiedTemplateListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isSQAMode, isAdminMode } = useTemplateListMode();
  
  // State for Admin mode
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateVersionModal, setShowCreateVersionModal] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('');
  
  // State for SQA mode
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Shared state
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isSQAMode) {
        // SQA Mode: Fetch all templates (PENDING, PUBLISHED, DENIED, REJECTED)
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
      } else if (isAdminMode) {
        // Admin Mode: Fetch all templates created by current user
        const response = await templateAPI.getMyTemplates();
        
        // Handle response structure: { success: true, data: [...] }
        let templatesData = [];
        if (response.success && response.data) {
          templatesData = response.data;
        } else if (Array.isArray(response)) {
          templatesData = response;
        } else if (response.data && Array.isArray(response.data)) {
          templatesData = response.data;
        }
        
        // Get all templates (no status filter)
        setAllTemplates(templatesData);
      } else {
        setAllTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
      setAllTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [isSQAMode, isAdminMode]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Check for action=create query param and open modal on mount (Admin mode only)
  useEffect(() => {
    if (isAdminMode) {
      const action = searchParams.get('action');
      if (action === 'create') {
        setShowImportModal(true);
        // Remove query param from URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('action');
        const newSearch = newSearchParams.toString();
        navigate({ search: newSearch ? `?${newSearch}` : '' }, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminMode]);


  // SQA Mode: Get status filter based on active tab
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

  // SQA Mode: Filter templates by active tab
  const templatesByTab = useMemo(() => {
    if (!isSQAMode) return [];
    
    const status = getStatusForTab(activeTab);
    if (!status) return [];
    if (Array.isArray(status)) {
      // For denied tab, match both DENIED and REJECTED
      return allTemplates.filter(template => status.includes(template.status));
    }
    return allTemplates.filter(template => template.status === status);
  }, [allTemplates, activeTab, isSQAMode]);

  // SQA Mode: Filter templates by search term
  const filteredTemplates = useMemo(() => {
    if (!isSQAMode) return [];
    
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
  }, [templatesByTab, searchTerm, isSQAMode]);

  // SQA Mode: Calculate counts for each tab
  const tabCounts = useMemo(() => {
    if (!isSQAMode) return { pending: 0, approved: 0, denied: 0 };
    
    return {
      pending: allTemplates.filter(t => t.status === 'PENDING').length,
      approved: allTemplates.filter(t => t.status === 'PUBLISHED').length,
      denied: allTemplates.filter(t => t.status === 'DENIED' || t.status === 'REJECTED').length
    };
  }, [allTemplates, isSQAMode]);

  // Admin Mode: Handlers
  const handleImportFile = () => {
    setShowImportModal(true);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    loadTemplates(); // Reload templates after successful import
  };

  const handleImportError = (error) => {
    toast.error(`Import failed: ${error}`, { icon: false });
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  // SQA Mode: Handler
  const handleViewDetail = (templateId) => {
    console.log('View detail for template:', templateId);
    navigate(ROUTES.TEMPLATES_DETAIL(templateId)); // Navigate to template detail page
  };

  // Shared: Status badge helper
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', icon: Clock, text: 'PENDING' },
      'PUBLISHED': { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' },
      'DRAFT': { variant: 'secondary', icon: FileText, text: 'DRAFT' },
      'ARCHIVED': { variant: 'dark', icon: FileText, text: 'ARCHIVED' },
      'DENIED': { variant: 'danger', icon: Clock, text: 'REJECTED' },
      'REJECTED': { variant: 'danger', icon: Clock, text: 'REJECTED' }
    };
    
    const config = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
        <Icon size={12} />
        {config.text}
      </Badge>
    );
  };

  // Shared: Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Admin Mode: Filter templates by search term and status
  const filteredAdminTemplates = useMemo(() => {
    if (!isAdminMode) return [];
    
    return allTemplates.filter(template => {
      // Search filter
      const matchesSearch = !adminSearchTerm || (() => {
        const name = template.name?.toLowerCase() || '';
        const description = template.description?.toLowerCase() || '';
        const createdBy = template.createdByUser?.firstName && template.createdByUser?.lastName
          ? `${template.createdByUser.firstName} ${template.createdByUser.lastName}`.toLowerCase()
          : '';
        const searchLower = adminSearchTerm.toLowerCase();
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               createdBy.includes(searchLower);
      })();
      
      // Status filter
      const matchesStatus = !adminStatusFilter || template.status === adminStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allTemplates, adminSearchTerm, adminStatusFilter, isAdminMode]);

  // Admin Mode: Status filter options
  const statusFilterOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  if (loading) {
    return (
      <Container fluid className="p-4">
        <LoadingSkeleton />
      </Container>
    );
  }

  // Render SQA Mode
  if (isSQAMode) {
    return (
      <Container fluid className="py-4 template-list-page">
        <Card className="border-neutral-200 shadow-sm">
          <Card.Header className="bg-light-custom border-neutral-200">
          </Card.Header>

          {/* Tabs - Default to pending tab for SQA review */}
          <TemplateTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={tabCounts}
          />

          <Card.Body className="template-list-body">
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
  }

  // Render Admin Mode
  if (isAdminMode) {
    return (
      <Container fluid className="py-4 forms-page form-component">
        <Card className="border-neutral-200 shadow-sm">
          <Card.Header className="border-neutral-200 forms-page-header" style={{backgroundColor: '#1b3c53'}}>
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <FileText className="me-2 text-white" size={24} />
                  <h4 className="mb-0 text-white">Template List</h4>
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-light"
                    onClick={() => navigate(ROUTES.TEMPLATES_DRAFTS)}
                    className="d-flex align-items-center"
                    size="sm"
                  >
                    <FileText className="me-2" size={16} />
                    Your Drafts
                  </Button>
                  <PermissionWrapper 
                    permission="PERM-034"
                    fallback={null}
                  >
                    <Button
                      variant="outline-light"
                      onClick={() => setShowCreateVersionModal(true)}
                      className="d-flex align-items-center"
                      size="sm"
                    >
                      <FileText className="me-2" size={16} />
                      Create New Template's Version
                    </Button>
                    <Button
                      variant="primary-custom"
                      onClick={handleImportFile}
                      className="d-flex align-items-center"
                      size="sm"
                    >
                      <Upload className="me-2" size={16} />
                      Create New Template
                    </Button>
                  </PermissionWrapper>
                </div>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body 
            className="template-list-body"
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 220px)',
              overflow: 'hidden',
              paddingBottom: 0
            }}
          >
            {/* Search and Filter Section */}
            <Row className="mb-3 form-mobile-stack search-filter-section" style={{ flexShrink: 0 }}>
              <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                <SearchBar
                  placeholder="Search templates by name, description, or creator..."
                  value={adminSearchTerm}
                  onChange={setAdminSearchTerm}
                  className="search-bar-mobile"
                />
              </Col>
              <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0">
                <FilterDropdown
                  title="Status"
                  options={statusFilterOptions}
                  selectedValue={adminStatusFilter}
                  onSelect={setAdminStatusFilter}
                  variant="outline-secondary"
                />
              </Col>
              <Col xs={12} lg={3} md={3}>
                <div className="text-end text-mobile-center">
                  <small className="text-muted">
                    {filteredAdminTemplates.length} template{filteredAdminTemplates.length !== 1 ? 's' : ''}
                  </small>
                </div>
              </Col>
            </Row>

            <div 
              className="template-list-scroll"
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                overflowX: 'hidden',
                minHeight: 0,
                maxHeight: '100%',
                paddingRight: '0.75rem',
                marginRight: '-0.25rem'
              }}
            >
              {filteredAdminTemplates.length === 0 ? (
                <Row className="mb-4">
                  <Col>
                    <div className="text-center py-5">
                      <FileEarmark size={64} className="text-muted mb-3" />
                      <h5 className="text-muted">
                        {allTemplates.length === 0 
                          ? 'No form templates found' 
                          : 'No templates match your search or filter criteria'}
                      </h5>
                      <p className="text-muted mb-4">
                        Get started by creating a new form or importing an existing file.
                      </p>
                    </div>
                  </Col>
                </Row>
              ) : (
                <Row className="g-3 g-md-4">
                  {filteredAdminTemplates.map((template) => (
                    <Col key={template.id} xs={12} sm={6} md={6} lg={4} xl={3}>
                    <Card
                      className="h-100 border-0 shadow-sm template-card"
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                      }}
                    >
                      <Card.Body className="p-3 d-flex flex-column" style={{ height: '100%' }}>
                        {/* Header with Icon and Title */}
                        <div className="d-flex align-items-start mb-2" style={{ height: '60px', flexShrink: 0 }}>
                          <div 
                            className="bg-primary-custom text-white rounded d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{ width: '40px', height: '40px', minWidth: '40px' }}
                          >
                            <FileText size={20} />
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <h6 
                              className="mb-1 fw-bold" 
                              style={{ 
                                fontSize: '0.95rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                lineHeight: '1.3'
                              }}
                              title={template.name}
                            >
                              {template.name}
                            </h6>
                            <small className="text-muted">v{template.version}</small>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="mb-2" style={{ height: '40px', overflow: 'hidden' }}>
                          <p 
                            className="text-muted mb-0" 
                            style={{ 
                              fontSize: '0.85rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              wordBreak: 'break-word',
                              lineHeight: '1.4',
                              height: '100%',
                              margin: 0
                            }}
                            title={template.description || 'No description'}
                          >
                            {template.description || 'No description'}
                          </p>
                        </div>

                        {/* Department and Status */}
                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0, height: '24px' }}>
                          <div className="d-flex align-items-center" style={{ minWidth: 0, flex: '1 1 auto' }}>
                            <Building size={12} className="text-muted me-1 flex-shrink-0" />
                            <small 
                              className="text-muted text-truncate" 
                              style={{ maxWidth: '100px' }}
                              title={template.department?.code || 'N/A'}
                            >
                              {template.department?.code || 'N/A'}
                            </small>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            {getStatusBadge(template.status)}
                          </div>
                        </div>

                        {/* Created By and Date */}
                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap" style={{ flexShrink: 0, height: '24px' }}>
                          <div 
                            className="d-flex align-items-center" 
                            style={{ minWidth: 0, flex: '1 1 auto' }}
                          >
                            <Person size={12} className="text-muted me-1 flex-shrink-0" />
                            <small 
                              className="text-muted text-truncate" 
                              style={{ maxWidth: '120px' }}
                              title={`${template.createdByUser?.firstName || ''} ${template.createdByUser?.lastName || ''}`.trim()}
                            >
                              {template.createdByUser?.firstName} {template.createdByUser?.lastName}
                            </small>
                          </div>
                          <small className="text-muted flex-shrink-0 ms-2">{formatDate(template.createdAt)}</small>
                        </div>

                        {/* Footer with Sections and Preview */}
                        <div className="mt-auto pt-2 border-top" style={{ flexShrink: 0 }}>
                          <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <small className="text-muted d-flex align-items-center flex-shrink-0">
                              <FileText size={12} className="me-1" />
                              {template._count?.sections || 0} sections
                            </small>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-primary-custom flex-shrink-0 ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewTemplate(template);
                              }}
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              <Eye size={14} className="me-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              )}
            </div>

            {/* Import File Modal */}
            <ImportFileModal
              show={showImportModal}
              onHide={() => setShowImportModal(false)}
              onImportSuccess={handleImportSuccess}
              onImportError={handleImportError}
            />

            {/* Template Detail Modal */}
            <TemplateDetailModal
              show={showPreviewModal}
              onHide={() => {
                setShowPreviewModal(false);
                setSelectedTemplate(null);
              }}
              template={selectedTemplate}
            />

            {/* Published Templates Modal for Create Version */}
            <PublishedTemplatesModal
              show={showCreateVersionModal}
              onHide={() => setShowCreateVersionModal(false)}
            />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // No permission - should not reach here due to PermissionRoute, but handle gracefully
  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Body>
          <div className="text-center py-5">
            <FileEarmark size={64} className="text-muted mb-3" />
            <h5 className="text-muted">Access Denied</h5>
            <p className="text-muted">You don't have permission to view templates.</p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnifiedTemplateListPage;

