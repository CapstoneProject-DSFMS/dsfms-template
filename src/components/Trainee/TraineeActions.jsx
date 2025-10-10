import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Eye, Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TraineeActions = ({ trainee, onRefresh }) => (
  <Dropdown align="end">
    <Dropdown.Toggle 
      variant="light" 
      size="sm" 
      id={`trainee-actions-${trainee.id}`} 
      className="border-0"
    >
      <ThreeDotsVertical size={16} />
    </Dropdown.Toggle>
    <Dropdown.Menu className="shadow-sm">
      <PermissionWrapper permission={API_PERMISSIONS.TRAINEES.VIEW_DETAIL}>
        <Dropdown.Item 
          href={`/trainee/${trainee.id}`}
          className="d-flex align-items-center transition-all"
          style={{
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            e.target.style.paddingLeft = '1.5rem';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.paddingLeft = '1rem';
          }}
        >
          <Eye className="me-2" size={16} />
          View Details
        </Dropdown.Item>
      </PermissionWrapper>
      
      <PermissionWrapper permission={API_PERMISSIONS.TRAINEES.UPDATE}>
        <Dropdown.Item 
          href={`/trainee/${trainee.id}/edit`}
          className="d-flex align-items-center transition-all"
          style={{
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            e.target.style.paddingLeft = '1.5rem';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.paddingLeft = '1rem';
          }}
        >
          <Pencil className="me-2" size={16} />
          Edit Trainee
        </Dropdown.Item>
      </PermissionWrapper>
      
      <PermissionWrapper permission={API_PERMISSIONS.TRAINEES.DELETE}>
        <Dropdown.Divider />
        <Dropdown.Item 
          onClick={() => {
            // TODO: Implement delete functionality
            console.log('Delete trainee:', trainee.id);
          }}
          className="d-flex align-items-center transition-all text-danger"
          style={{
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            e.target.style.paddingLeft = '1.5rem';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.paddingLeft = '1rem';
          }}
        >
          <Trash className="me-2" size={16} />
          Delete Trainee
        </Dropdown.Item>
      </PermissionWrapper>
    </Dropdown.Menu>
  </Dropdown>
);

export default TraineeActions;
