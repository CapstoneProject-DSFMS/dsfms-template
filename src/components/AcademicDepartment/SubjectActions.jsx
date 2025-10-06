import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Eye, SlashCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const SubjectActions = ({ subject, onView, onEdit, onDelete }) => (
  <Dropdown align="end">
    <Dropdown.Toggle 
      variant="light" 
      size="sm" 
      id={`subject-actions-${subject.id}`} 
      className="border-0"
    >
      <ThreeDotsVertical size={16} />
    </Dropdown.Toggle>
    <Dropdown.Menu className="shadow-sm">
      <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.VIEW_DETAIL}>
        <Dropdown.Item 
          onClick={() => onView && onView(subject.id)}
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
      
      <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.UPDATE}>
        <Dropdown.Item 
          onClick={() => onEdit && onEdit(subject.id)}
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
          <SlashCircle className="me-2" size={16} />
          Disable Subject
        </Dropdown.Item>
      </PermissionWrapper>
    </Dropdown.Menu>
  </Dropdown>
);

export default SubjectActions;
