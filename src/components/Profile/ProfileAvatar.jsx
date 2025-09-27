import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Person, Key } from 'react-bootstrap-icons';

const ProfileAvatar = ({ 
  profileData, 
  user, 
  onResetPassword 
}) => {
  const getRoleVariant = (role) => {
    const variants = {
      'ADMIN': 'danger',
      'DEPT_HEAD': 'primary',
      'TRAINER': 'info',
      'TRAINEE': 'success',
      'ACADEMIC_DEPT': 'warning',
      'SQA_AUDITOR': 'secondary'
    };
    return variants[role] || 'secondary';
  };

  const getDisplayName = () => {
    if (profileData) {
      return [profileData.firstName, profileData.middleName, profileData.lastName]
        .filter(Boolean)
        .join(' ') || 'User Name';
    }
    return user?.fullName || 'User Name';
  };

  const getEmail = () => {
    return profileData?.email || user?.email || 'user@example.com';
  };

  const getRole = () => {
    return profileData?.role?.name || user?.role || 'USER';
  };

  const getEmployeeId = () => {
    return profileData?.eid || user?.eid || 'N/A';
  };

  return (
    <Card className="h-100">
      <Card.Body className="text-center">
        <div className="position-relative d-inline-block mb-3">
          <div 
            className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
            style={{ width: '120px', height: '120px', margin: '0 auto' }}
          >
            <Person size={48} className="text-white" />
          </div>
          <button
            className="position-absolute rounded-circle border border-2 border-white shadow-sm"
            style={{ 
              width: '36px', 
              height: '36px',
              bottom: '0px',
              right: '0px',
              transform: 'translate(40%, 30%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#456882',
              fontWeight: 'bold',
              backgroundColor: '#d2c1b6',
              lineHeight: '1'
            }}
          >
            📷
          </button>
        </div>
        
        <h4 className="mb-1">{getDisplayName()}</h4>
        <p className="text-muted mb-2">{getEmail()}</p>
        <Badge bg={getRoleVariant(getRole())} className="mb-3">
          {getRole()}
        </Badge>
        
        <div className="text-start">
          <div className="mb-2 d-flex align-items-center justify-content-between">
            <div>
              <strong>Employee ID:</strong>
              <br />
              <span className="text-muted">{getEmployeeId()}</span>
            </div>
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onResetPassword}
                className="d-flex align-items-center"
              >
                <Key size={14} className="me-1" />
                Reset Password
              </Button>
            </div>
          </div>
          <div className="mb-2">
            <strong>Status:</strong>
            <br />
            <Badge bg="success">
              Active
            </Badge>
          </div>
          {profileData?.address && (
            <div className="mb-2">
              <strong>Address:</strong>
              <br />
              <span className="text-muted">{profileData.address}</span>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileAvatar;
