import React from 'react';
import { Badge, Table } from 'react-bootstrap';
import { 
  FileText, 
  Eye,
  XCircle,
  ThreeDotsVertical,
  Clock,
  CheckCircle,
  ChevronDown
} from 'react-bootstrap-icons';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { SortIcon, PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import '../../styles/scrollable-table.css';

const TemplateTable = ({ 
  templates, 
  sortConfig, 
  handleSort, 
  onViewDetail, 
  onDisableTemplate 
}) => {

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PUBLISHED':
      case 'ACTIVE':
        return { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' };
      case 'PENDING':
        return { variant: 'warning', icon: Clock, text: 'PENDING' };
      case 'DENIED':
      case 'REJECTED':
        return { variant: 'danger', icon: XCircle, text: 'REJECTED' };
      case 'DRAFT':
        return { variant: 'secondary', icon: Clock, text: 'DRAFT' };
      case 'INACTIVE':
        return { variant: 'secondary', icon: Clock, text: 'INACTIVE' };
      default:
        return { variant: 'secondary', icon: Clock, text: status };
    }
  };

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold ${className}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#214760';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bs-primary)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500',
            color: 'white'
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
              color="white"
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
              background: 'rgba(255, 255, 255, 0.5)',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  return (
    <div className="position-relative">
      <div className="scrollable-table-container admin-table">
        <Table className="table table-hover mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
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
            {templates.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  <FileText size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No templates found</h5>
                  <p className="text-muted">No templates match your current filters.</p>
                </td>
              </tr>
            ) : (
              templates.map((template, index) => {
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
                        <div>{template.sections || template._count?.sections || 0} sections</div>
                        <div>{template.fields || template._count?.fields || 0} fields</div>
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
                        {template.createdBy || (template.createdByUser?.firstName && template.createdByUser?.lastName 
                          ? `${template.createdByUser.firstName} ${template.createdByUser.lastName}` 
                          : 'N/A')}
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
                              onClick: () => onViewDetail(template.id),
                              permission: API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL
                            },
                            {
                              label: 'Disable Template',
                              icon: <XCircle />,
                              onClick: () => onDisableTemplate(template.id),
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
        </Table>
      </div>
      
      {/* Scroll indicator */}
      {templates.length > 8 && (
        <div className="scroll-indicator">
          <ChevronDown size={12} className="me-1" />
          Scroll to see more templates
        </div>
      )}
    </div>
  );
};

export default TemplateTable;

