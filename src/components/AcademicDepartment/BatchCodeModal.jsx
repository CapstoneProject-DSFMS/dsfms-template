import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';

const BatchCodeModal = ({ show, onClose, onConfirm, loading = false }) => {
  const [batchCode, setBatchCode] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setBatchCode('');
      setError('');
    }
  }, [show]);

  // Validate batch code
  const validateBatchCode = (code) => {
    if (!code || code.trim() === '') {
      return 'Batch code is required';
    }
    
    if (code.length < 3) {
      return 'Batch code must be at least 3 characters long';
    }
    
    if (code.length > 20) {
      return 'Batch code must be no more than 20 characters long';
    }
    
    // Check for special characters (only allow alphanumeric and underscore)
    const specialCharRegex = /[^a-zA-Z0-9_]/;
    if (specialCharRegex.test(code)) {
      return 'Batch code can only contain letters, numbers, and underscores';
    }
    
    return null;
  };

  const handleBatchCodeChange = (e) => {
    const value = e.target.value;
    setBatchCode(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleConfirm = () => {
    const validationError = validateBatchCode(batchCode);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onConfirm(batchCode.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <ExclamationTriangle className="me-2 text-warning" size={20} />
          Enter Batch Code
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Batch Code <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter batch code (e.g., SAF0012025, CCT_BATCH_01)"
              value={batchCode}
              onChange={handleBatchCodeChange}
              onKeyPress={handleKeyPress}
              isInvalid={!!error}
              disabled={loading}
              autoFocus
            />
            <Form.Text className="text-muted">
              Only letters, numbers, and underscores are allowed. 3-20 characters.
            </Form.Text>
            {error && (
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Form>
        
        <Alert variant="info" className="mb-0">
          <small>
            <strong>Note:</strong> This batch code will be used to identify the enrollment group. 
            Make sure it's unique and descriptive for your course.
          </small>
        </Alert>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm}
          disabled={loading || !batchCode.trim()}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Enrolling...
            </>
          ) : (
            'Confirm & Enroll'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchCodeModal;
