import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/permissions';

const RoleSwitcher = () => {
  const { user, login } = useAuth();

  const roleOptions = [
    { key: 'ADMIN', label: 'Administrator', permissions: ROLES.ADMIN },
    { key: 'ACADEMIC_DEPT', label: 'Academic Department', permissions: ROLES.ACADEMIC_DEPT },
    { key: 'DEPT_HEAD', label: 'Department Head', permissions: ROLES.DEPT_HEAD },
    { key: 'TRAINER', label: 'Trainer', permissions: ROLES.TRAINER },
    { key: 'TRAINEE', label: 'Trainee', permissions: ROLES.TRAINEE },
    { key: 'SQA_AUDITOR', label: 'SQA Auditor', permissions: ROLES.SQA_AUDITOR }
  ];

  const handleRoleChange = (roleKey) => {
    const selectedRole = roleOptions.find(role => role.key === roleKey);
    if (selectedRole) {
      const newUser = {
        ...user,
        role: selectedRole.label,
        permissions: selectedRole.permissions
      };
      login(newUser);
    }
  };

  return (
    <Dropdown className="d-inline-block">
      <Dropdown.Toggle
        variant="outline-primary"
        size="sm"
        className="d-flex align-items-center"
      >
        <PersonCircle className="me-2" size={16} />
        {user?.role || 'Select Role'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {roleOptions.map((role) => (
          <Dropdown.Item
            key={role.key}
            onClick={() => handleRoleChange(role.key)}
            active={user?.role === role.label}
          >
            <div>
              <div className="fw-medium">{role.label}</div>
              <small className="text-muted">
                {role.permissions.length} permissions
              </small>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default RoleSwitcher;
