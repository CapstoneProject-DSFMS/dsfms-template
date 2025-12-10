import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FileText, ThreeDotsVertical, Pencil, Trash, Folder } from 'react-bootstrap-icons';
import PortalUnifiedDropdown from '../../Common/PortalUnifiedDropdown';
import { PermissionWrapper } from '../../Common';
import { PERMISSION_IDS } from '../../../constants/permissionIds';
import { usePermissions } from '../../../hooks/usePermissions';

const GlobalFieldCard = ({ field, onViewDetail, onEdit, onDelete }) => {
  const { hasPermission } = usePermissions();

  const actionItems = [
    {
      label: 'View Detail',
      icon: <FileText size={16} />,
      onClick: () => onViewDetail(field),
      permission: PERMISSION_IDS.VIEW_GLOBAL_FIELD_DETAILS
    },
    {
      label: 'Edit Global Field',
      icon: <Pencil size={16} />,
      onClick: () => onEdit(field),
      permission: PERMISSION_IDS.UPDATE_GLOBAL_FIELD
    },
    {
      label: 'Delete Global Field',
      icon: <Trash size={16} />,
      onClick: () => onDelete && onDelete(field),
      permission: PERMISSION_IDS.DISABLE_ENABLE_GLOBAL_FIELD,
      variant: 'danger'
    }
  ].filter(item => !item.permission || hasPermission(item.permission));

  return (
    <Card
      className="h-100 border-0 shadow-sm"
      style={{
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
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
      <Card.Body className="p-3 d-flex flex-column position-relative" style={{ flex: '1 1 auto', minHeight: '0' }}>
        {/* Actions Dropdown */}
        <div className="position-absolute" style={{ top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
          <PermissionWrapper 
            permissions={[PERMISSION_IDS.VIEW_GLOBAL_FIELD_DETAILS, PERMISSION_IDS.UPDATE_GLOBAL_FIELD, PERMISSION_IDS.DISABLE_ENABLE_GLOBAL_FIELD]}
            fallback={null}
          >
            <PortalUnifiedDropdown
              align="end"
              placement="bottom-end"
              trigger={{
                variant: 'link',
                className: 'btn btn-link p-0 text-primary-custom',
                style: { border: 'none', background: 'transparent' },
                children: <ThreeDotsVertical size={16} />
              }}
              items={actionItems}
            />
          </PermissionWrapper>
        </div>

        {/* Header with Icon and Label */}
        <div className="d-flex align-items-start mb-3" style={{ minHeight: '60px', flexShrink: 0, paddingRight: '2rem' }}>
          <div 
            className="bg-primary-custom text-white rounded d-flex align-items-center justify-content-center me-2 flex-shrink-0"
            style={{ width: '40px', height: '40px', minWidth: '40px', flexShrink: 0 }}
          >
            <FileText size={20} />
          </div>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <h6 
              className="mb-0 fw-bold" 
              style={{ 
                fontSize: '0.95rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                lineHeight: '1.3',
                minHeight: '2.6em'
              }}
              title={field.label}
            >
              {field.label}
            </h6>
          </div>
        </div>
        
        {/* Field Name */}
        <div style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <small className="text-muted">Field Name:</small>
            {field.children && Array.isArray(field.children) && field.children.length > 0 && (
              <Badge bg="info" className="d-flex align-items-center">
                <Folder size={10} className="me-1" />
                {field.children.length} child{field.children.length !== 1 ? 'ren' : ''}
              </Badge>
            )}
          </div>
          <code 
            className="text-dark d-block" 
            style={{ 
              fontSize: '0.85rem',
              wordBreak: 'break-word',
              backgroundColor: 'var(--bs-neutral-200)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              overflowWrap: 'break-word'
            }}
          >
            {field.fieldName}
          </code>
        </div>
      </Card.Body>
    </Card>
  );
};

export default GlobalFieldCard;

