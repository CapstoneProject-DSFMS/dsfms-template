import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { LoadingSkeleton, SortIcon } from '../../../components/Common';
import useTableSort from '../../../hooks/useTableSort';

const RoleTable = ({
  roles,
  loading,
  actionsComponent: ActionsComponent,
  onView,
  onEdit,
  onDisable,
}) => {
  const { sortedData, sortConfig, handleSort, getSortIcon, getSortClass } = useTableSort(roles);

  if (loading) {
    return <LoadingSkeleton rows={4} columns={4} />;
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No roles found</h5>
          <p>Try adjusting your search criteria or add a new role.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
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
            fontWeight: isActive ? '700' : '600'
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
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive">
        <thead className="sticky-header bg-gradient-primary-custom">
          <tr>
            <SortableHeader columnKey="name" className="show-mobile">
              Role Name
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="assignedUsers" className="show-mobile">
              Assigned Users
            </SortableHeader>
            <SortableHeader columnKey="lastModified" className="show-mobile">
              Last Modified
            </SortableHeader>
            <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-center show-mobile">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((role, index) => (
            <tr key={role.id}>
              <td className="show-mobile">{role.name}</td>
              <td className="show-mobile">
                <Badge 
                  bg={role.status === 'Active' ? 'success' : 'secondary'}
                  className="px-2 py-1 d-flex align-items-center"
                  style={{ 
                    fontSize: '0.75rem',
                    width: 'fit-content'
                  }}
                >
                  <span className="me-1" style={{ fontSize: '0.8rem' }}>
                    {role.status === 'Active' ? '●' : '○'}
                  </span>
                  {role.status}
                </Badge>
              </td>
              <td className="show-mobile">{role.assignedUsers}</td>
              <td className="show-mobile">{role.lastModified}</td>
              <td className="text-center show-mobile">
                <ActionsComponent role={role} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoleTable;
