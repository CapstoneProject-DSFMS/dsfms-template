import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Card, Form, Table } from 'react-bootstrap';
import { 
  FileText, 
  Eye,
  XCircle,
  FileEarmarkPdf,
  ThreeDotsVertical,
  Clock,
  CheckCircle,
  Search,
  ChevronDown
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import { LoadingSkeleton, SearchBar, SortIcon, PermissionWrapper } from '../../components/Common';
import useTableSort from '../../hooks/useTableSort';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import '../../styles/scrollable-table.css';

const TemplateListPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { sortConfig, handleSort } = useTableSort();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockTemplates = [
        {
          id: '1',
          name: 'Safety Assessment Template',
          description: 'Comprehensive safety assessment template for training courses',
          version: 'v2.1',
          category: 'SAFETY',
          sections: 5,
          fields: 23,
          status: 'ACTIVE',
          createdBy: 'John Smith',
          createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          name: 'Technical Skills Evaluation',
          description: 'Template for evaluating technical skills and competencies',
          version: 'v1.5',
          category: 'TECHNICAL',
          sections: 3,
          fields: 15,
          status: 'DRAFT',
          createdBy: 'Sarah Johnson',
          createdAt: '2024-01-14T00:00:00.000Z'
        },
        {
          id: '3',
          name: 'Compliance Assessment',
          description: 'Template for compliance and regulatory assessments',
          version: 'v3.0',
          category: 'COMPLIANCE',
          sections: 7,
          fields: 31,
          status: 'ACTIVE',
          createdBy: 'Mike Wilson',
          createdAt: '2024-01-13T00:00:00.000Z'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
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

  const handleViewDetail = (templateId) => {
    console.log('View detail for template:', templateId);
    navigate(`/sqa/templates/${templateId}`);
  };

  const handleDisableTemplate = (templateId) => {
    console.log('Disable template:', templateId);
    // Disable template functionality
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container fluid className="p-4">
        <LoadingSkeleton />
      </Container>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`border-neutral-200 text-primary-custom fw-semibold ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500'
          }}>
            {children}
          </span>
          <div 
            className="ms-2 d-flex align-items-center"
            style={{ 
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon 
              direction={direction} 
              size={14}
            />
          </div>
        </div>
        {isActive && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, var(--bs-primary), var(--bs-info))',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

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

        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-3 form-mobile-stack search-filter-section">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder="Search templates by name, description, or creator..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="search-bar-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-panel-mobile"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </Form.Select>
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* Template Table with Scrollable Container */}
          <div className="position-relative">
            <div className="scrollable-table-container admin-table">
              <table className="table table-hover mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
                <thead className="sticky-header">
                  <tr>
                    <SortableHeader columnKey="name" className="show-mobile">
                      Template Name
                    </SortableHeader>
                    <SortableHeader columnKey="version" className="hide-mobile">
                      Version
                    </SortableHeader>
                    <th className="text-primary-custom fw-semibold hide-mobile">
                      Sections/Fields
                    </th>
                    <SortableHeader columnKey="status" className="show-mobile">
                      Status
                    </SortableHeader>
                    <SortableHeader columnKey="createdBy" className="hide-mobile">
                      Created By
                    </SortableHeader>
                    <SortableHeader columnKey="createdAt" className="hide-mobile">
                      Created Date
                    </SortableHeader>
                    <th className="text-primary-custom fw-semibold text-center show-mobile">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <FileText size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">No templates found</h5>
                        <p className="text-muted">No templates match your current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTemplates.map((template, index) => {
                      const statusConfig = getStatusConfig(template.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr 
                          key={template.id}
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
                          <td className="align-middle">
                            <div>
                              <div className="fw-medium text-dark">
                                {template.name}
                              </div>
                              <div className="text-muted small" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {template.description}
                              </div>
                            </div>
                          </td>
                          
                          <td className="align-middle hide-mobile">
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
                          </td>
                          
                          <td className="align-middle hide-mobile">
                            <div className="text-muted small">
                              <div>{template.sections} sections</div>
                              <div>{template.fields} fields</div>
                            </div>
                          </td>
                          
                          <td className="align-middle">
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
                          </td>
                          
                          <td className="align-middle hide-mobile">
                            <div className="text-muted small">
                              {template.createdBy}
                            </div>
                          </td>
                          
                          <td className="align-middle hide-mobile">
                            <div className="text-muted small">
                              {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          
                          <td className="align-middle text-center">
                            <PermissionWrapper 
                              permissions={[API_PERMISSIONS.SQA.VIEW_TEMPLATES, API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL]}
                              fallback={null}
                            >
                              <PortalUnifiedDropdown
                                align="end"
                                className="table-dropdown"
                                placement="bottom-end"
                                trigger={{
                                  variant: 'link',
                                  className: 'btn btn-link p-0 text-primary-custom',
                                  style: { border: 'none', background: 'transparent' },
                                  children: <ThreeDotsVertical size={16} />
                                }}
                                items={[
                                  {
                                    label: 'View Detail',
                                    icon: <Eye />,
                                    onClick: () => handleViewDetail(template.id),
                                    permission: API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL
                                  },
                                  {
                                    label: 'Disable Template',
                                    icon: <XCircle />,
                                    onClick: () => handleDisableTemplate(template.id),
                                    permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES
                                  }
                                ]}
                              />
                            </PermissionWrapper>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Scroll indicator */}
            {filteredTemplates.length > 8 && (
              <div className="scroll-indicator">
                <ChevronDown size={12} className="me-1" />
                Scroll to see more templates
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TemplateListPage;