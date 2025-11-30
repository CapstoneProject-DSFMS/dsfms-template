import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Pencil } from 'react-bootstrap-icons';

const EditSubjectModal = ({ show, onClose, onSave, subject, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 'Beginner'
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (subject && show) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        level: subject.level || 'Beginner'
      });
      setErrors([]);
    }
  }, [subject, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.name.trim()) {
      newErrors.push('Subject name is required');
    }
    
    if (!formData.code.trim()) {
      newErrors.push('Subject code is required');
    }
    
    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      level: 'Beginner'
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Pencil className="me-2" size={20} />
          Edit Subject
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {errors.length > 0 && (
          <Alert variant="danger" className="mb-3">
            <ul className="mb-0">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter subject name"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter subject code"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Level</Form.Label>
                <Form.Select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter subject description"
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose} 
          disabled={loading}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <Pencil className="me-2" size={16} />
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSubjectModal;
