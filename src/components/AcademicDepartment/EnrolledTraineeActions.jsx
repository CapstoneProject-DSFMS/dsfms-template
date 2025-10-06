import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Eye, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const EnrolledTraineeActions = ({ trainee, onViewSubjects, onRemoveTrainee }) => (
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
      <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.VIEW_DETAIL}>
        <Dropdown.Item 
          onClick={() => onViewSubjects(trainee)}
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
          View Subject List
        </Dropdown.Item>
      </PermissionWrapper>
      
      <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.DELETE}>
        <Dropdown.Divider />
        <Dropdown.Item 
          onClick={() => onRemoveTrainee(trainee.id)}
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
          Remove Trainee
        </Dropdown.Item>
      </PermissionWrapper>
    </Dropdown.Menu>
  </Dropdown>
);

export default EnrolledTraineeActions;
