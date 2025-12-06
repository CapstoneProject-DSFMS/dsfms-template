import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Key, Eye, EyeSlash, X } from 'react-bootstrap-icons';

const ResetPasswordModal = ({ show, onClose, onSave, loading = false }) => {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      throw new Error('New password and confirm password do not match.');
    }

    if (passwordForm.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    try {
      await onSave(passwordForm);
      
      // Reset form after successful update
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close modal immediately (toast will show success)
      onClose();
      
    } catch (error) {
      // Error is handled by toast in parent component
      throw error;
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Key className="me-2" size={20} />
          Change Password
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
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Current Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showOldPassword ? 'text' : 'password'}
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter current password"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                className="position-absolute end-0 top-50 translate-middle-y border-0"
                style={{ background: 'none', right: '8px' }}
                onClick={() => setShowOldPassword(!showOldPassword)}
                type="button"
              >
                {showOldPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </Form.Group>

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
                  Change Password
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
