import React from 'react';
import { Container } from 'react-bootstrap';
import UploadToEditorFlow from '../../../components/Admin/Forms/UploadToEditorFlow';
import { PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';

const UploadToEditorPage = () => {
  const handleBack = () => {
    // Navigate back to forms management
    window.history.back();
  };

  return (
    <PermissionWrapper 
      permission={API_PERMISSIONS.TEMPLATES.CREATE}
      fallback={
        <Container fluid className="py-4">
          <div className="text-center text-muted">
            <h4>Access Denied</h4>
            <p>You don't have permission to upload and edit document templates.</p>
          </div>
        </Container>
      }
    >
      <Container fluid className="py-4">
        <UploadToEditorFlow onBack={handleBack} />
      </Container>
    </PermissionWrapper>
  );
};

export default UploadToEditorPage;
