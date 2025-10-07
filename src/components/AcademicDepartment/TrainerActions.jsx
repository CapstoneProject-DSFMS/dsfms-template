import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TrainerActions = ({ trainer, onEdit, onDelete }) => (
  <Dropdown align="end">
    <Dropdown.Toggle 
      variant="light" 
      size="sm" 
      id={`trainer-actions-${trainer.id}`} 
      className="border-0"
    >
      <ThreeDotsVertical size={16} />
    </Dropdown.Toggle>
    <Dropdown.Menu className="shadow-sm">
      <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.UPDATE}>
        <Dropdown.Item 
          onClick={() => onEdit(trainer.id)}
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
          Edit Trainer
        </Dropdown.Item>
      </PermissionWrapper>
      
      <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.REMOVE_INSTRUCTOR}>
        <Dropdown.Item 
          onClick={() => onDelete(trainer.id)}
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
          Remove Trainer
        </Dropdown.Item>
      </PermissionWrapper>
    </Dropdown.Menu>
  </Dropdown>
);

export default TrainerActions;

