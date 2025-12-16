import React from 'react';
import { Table } from 'react-bootstrap';
import UserRow from './UserRow';
import { LoadingSkeleton, SortIcon } from '../../../components/Common';
import useTableSort from '../../../hooks/useTableSort';
import '../../../styles/scrollable-table.css';

const UserTable = ({ users, loading, onView, onEdit, onDisable }) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(users);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No users found</h5>
          <p>Try adjusting your search criteria or add a new user.</p>
        </div>
      </div>
    );
  }

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
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive user-management-table" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="eid" className="show-mobile">
              EID
            </SortableHeader>
            <SortableHeader columnKey="fullName" className="show-mobile">
              Full Name
            </SortableHeader>
            <SortableHeader columnKey="email" className="show-mobile">
              Email
            </SortableHeader>
            <SortableHeader columnKey="role" className="show-mobile">
              Role
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <th 
              className="fw-semibold text-center show-mobile"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)'
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDisable={onDisable}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserTable;
