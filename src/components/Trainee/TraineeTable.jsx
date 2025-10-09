import React, { useState } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Eye, Pencil, Trash, Person } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import TraineeActions from './TraineeActions';
import useTableSort from '../../hooks/useTableSort';

const TraineeTable = ({ trainees, loading, onRefresh }) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(trainees);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { variant: 'success', text: 'Active' },
      'INACTIVE': { variant: 'secondary', text: 'Inactive' },
      'PENDING': { variant: 'warning', text: 'Pending' },
      'SUSPENDED': { variant: 'danger', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const SortableHeader = ({ field, children, className = "" }) => (
    <th 
      className={`sortable-header ${className}`}
      onClick={() => handleSort(field)}
      style={{ 
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      <div className="d-flex align-items-center">
        <span className="me-1">{children}</span>
        {sortConfig.key === field && (
          <span className="sort-icon">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading trainees...</p>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-5">
        <Person size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No trainees found</h5>
        <p className="text-muted">Start by adding your first trainee</p>
      </div>
    );
  }

  return (
    <div className="trainee-table-container" style={{ overflowX: 'hidden' }}>
      <Table 
        responsive 
        hover 
        className="mb-0"
        style={{ 
          tableLayout: 'fixed', 
          width: '100%' 
        }}
      >
        <thead className="table-light">
          <tr>
            <SortableHeader field="eid" className="text-start">
              EID
            </SortableHeader>
            <SortableHeader field="firstName" className="text-start">
              Name
            </SortableHeader>
            <SortableHeader field="email" className="text-start">
              Email
            </SortableHeader>
            <SortableHeader field="phoneNumber" className="text-start">
              Phone
            </SortableHeader>
            <SortableHeader field="department" className="text-start">
              Department
            </SortableHeader>
            <SortableHeader field="enrolledCourses" className="text-start">
              Enrolled Courses
            </SortableHeader>
            <SortableHeader field="status" className="text-start">
              Status
            </SortableHeader>
            <th className="text-start" style={{ minWidth: '80px', maxWidth: '150px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((trainee) => (
            <tr key={trainee.id}>
              <td>
                <Badge bg="primary" className="fw-normal">
                  {trainee.eid || 'N/A'}
                </Badge>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                    {trainee.firstName?.[0] || 'T'}
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {trainee.firstName} {trainee.lastName}
                    </div>
                    {trainee.middleName && (
                      <small className="text-muted">{trainee.middleName}</small>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                  {trainee.email || 'N/A'}
                </div>
              </td>
              <td>
                <div className="text-truncate" style={{ maxWidth: '150px' }}>
                  {trainee.phoneNumber || 'N/A'}
                </div>
              </td>
              <td>
                <div className="text-truncate" style={{ maxWidth: '150px' }}>
                  {trainee.department?.name || 'N/A'}
                </div>
              </td>
              <td>
                <Badge bg="info" className="fw-normal">
                  {trainee.enrolledCourses?.length || 0} courses
                </Badge>
              </td>
              <td>
                {getStatusBadge(trainee.status)}
              </td>
              <td>
                <TraineeActions trainee={trainee} onRefresh={onRefresh} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeTable;
