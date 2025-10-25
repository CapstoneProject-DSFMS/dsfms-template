import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Key, Eye, EyeSlash, X } from 'react-bootstrap-icons';

const ResetPasswordModal = ({ show, onClose, onSave, loading = false }) => {
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear alert when user starts typing
    if (alert.show) {
      setAlert({ show: false, message: '', variant: 'success' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        show: true,
        message: 'New password and confirm password do not match.',
        variant: 'danger'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setAlert({
        show: true,
        message: 'New password must be at least 6 characters long.',
        variant: 'danger'
      });
      return;
    }

    try {
      await onSave(passwordForm);
      
      setAlert({
        show: true,
        message: 'Password updated successfully!',
        variant: 'success'
      });
      
      // Reset form after successful update
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setAlert({ show: false, message: '', variant: 'success' });
      }, 1500);
      
    } catch (error) {
      setAlert({
        show: true,
        message: 'Failed to update password. Please check your current password.',
        variant: 'danger'
      });
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setAlert({ show: false, message: '', variant: 'success' });
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Key className="me-2" size={20} />
          Reset Password
        </Modal.Title>
        <Button
          variant="link"
          className="text-white p-0"
          onClick={handleClose}
          style={{ textDecoration: 'none' }}
        >
          <X size={20} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {alert.show && (
          <Alert variant={alert?.variant} className="mb-3">
            {alert?.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">New Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                placeholder="Enter new password"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                className="position-absolute end-0 top-50 translate-middle-y border-0"
                style={{ background: 'none', right: '8px' }}
                onClick={() => setShowNewPassword(!showNewPassword)}
                type="button"
              >
                {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                placeholder="Confirm new password"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                className="position-absolute end-0 top-50 translate-middle-y border-0"
                style={{ background: 'none', right: '8px' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
              >
                {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
            >
              {loading ? 'Updating...' : (
                <>
                  <Key size={16} className="me-1" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ResetPasswordModal;
