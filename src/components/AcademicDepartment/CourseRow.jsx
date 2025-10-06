import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Eye, Pencil, Trash, People } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const CourseRow = ({ course, index, onView, onEdit, onDelete }) => {
  
  const getStatusVariant = (status) => {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  };

  const getStatusText = (status) => {
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  };

  return (
    <tr 
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
      <td className="border-neutral-200 align-middle">
        <div 
          className="fw-semibold text-primary cursor-pointer"
          onClick={() => onView(course.id)}
          style={{ cursor: 'pointer' }}
        >
          {course.name}
        </div>
      </td>
      <td className="border-neutral-200 align-middle">
        <Badge bg="secondary">{course.code}</Badge>
      </td>
      <td className="border-neutral-200 align-middle">
        {course.duration || 'N/A'}
      </td>
      <td className="border-neutral-200 align-middle">
        <div className="d-flex align-items-center">
          <People size={14} className="me-1" />
          {course.trainers || 0}
        </div>
      </td>
      <td className="border-neutral-200 align-middle">
        <Badge bg={getStatusVariant(course.status)}>
          {getStatusText(course.status)}
        </Badge>
      </td>
      <td className="border-neutral-200 align-middle text-center">
        <div className="d-flex gap-1 justify-content-center">
          <PermissionWrapper permission={API_PERMISSIONS.COURSES.VIEW_DETAIL}>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => onView(course.id)}
              title="View Course Details"
            >
              <Eye size={14} />
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission={API_PERMISSIONS.COURSES.UPDATE}>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => onEdit(course.id)}
              title="Edit Course"
            >
              <Pencil size={14} />
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission={API_PERMISSIONS.COURSES.DELETE}>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => onDelete(course.id)}
              title="Delete Course"
            >
              <Trash size={14} />
            </Button>
          </PermissionWrapper>
        </div>
      </td>
    </tr>
  );
};

export default CourseRow;
