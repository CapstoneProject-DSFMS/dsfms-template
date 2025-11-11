import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { globalFieldAPI } from '../../../api';

const CreateGlobalFieldModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    label: '',
    fieldName: '',
    fieldType: 'TEXT',
    roleRequired: '',
    options: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFieldName = (fieldName, fieldType) => {
    if (!fieldName) return { valid: false, message: 'Field name is required' };
    
    const type = String(fieldType || '').toUpperCase();
    
    // For global fields, we'll use snake_case as default (like TEXT type)
    // Similar to "Add New Field" logic but simplified for global fields
    if (type === 'PART') {
      // PART: underscores, capitalized first letter, not start with "section"
      const partRegex = /^[A-Z][A-Za-z0-9_]*$/;
      if (!partRegex.test(fieldName)) {
        return {
          valid: false,
          message: 'The tag name should use underscores, should not start with the word "section" and the first letter always have to be capitalized. (e.g., Assessment_Items).'
        };
      }
      if (fieldName.toLowerCase().startsWith('section')) {
        return {
          valid: false,
          message: 'The tag name should use underscores, should not start with the word "section" and the first letter always have to be capitalized. (e.g., Assessment_Items).'
        };
      }
      return { valid: true, message: '' };
    } else if (type === 'TOGGLE') {
      // TOGGLE: camelCase - must have at least one uppercase letter after the first lowercase letter
      const camelCaseRegex = /^[a-z]+[A-Z][a-zA-Z0-9]*$/;
      if (!camelCaseRegex.test(fieldName)) {
        return {
          valid: false,
          message: 'The tag name should use camelCase (e.g., isGroundCourse).'
        };
      }
      return { valid: true, message: '' };
    } else {
      // Other types (TEXT, NUMBER, DATE, SELECT, CHECKBOX): snake_case (default)
      const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;
      if (!snakeCaseRegex.test(fieldName)) {
        return {
          valid: false,
          message: 'Field name must be in snake_case format (e.g., crew_communication).'
        };
      }
      return { valid: true, message: '' };
    }
  };

  const handleSaveField = async () => {
    if (!formData.label || !formData.fieldName || !formData.roleRequired) {
      toast.warning('Please fill in all required fields');
      return;
    }

    // Validate fieldName format based on fieldType
    const validation = validateFieldName(formData.fieldName, formData.fieldType);
    if (!validation.valid) {
      toast.warning(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        label: formData.label.trim(),
        fieldName: formData.fieldName.trim(),
        fieldType: formData.fieldType,
        roleRequired: formData.roleRequired || null,
        options: formData.options || null
      };

      await globalFieldAPI.createGlobalField(payload);
      
      toast.success('Global field created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating global field:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create global field';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      label: '',
      fieldName: '',
      fieldType: 'TEXT',
      roleRequired: '',
      options: null
    });
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Create Global Field</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-primary-custom">Label <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Crew Communication"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  required
                />
                <Form.Text className="text-muted">
                  The question or label displayed to the user (e.g., "Crew Communication").
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-primary-custom">Field Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder={
                    formData.fieldType === 'PART' 
                      ? 'e.g., Assessment_Items' 
                      : formData.fieldType === 'TOGGLE'
                      ? 'e.g., isGroundCourse'
                      : 'e.g., crew_communication'
                  }
                  value={formData.fieldName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldName: e.target.value }))}
                  required
                />
                <Form.Text className="text-muted">
                  {formData.fieldType === 'PART' 
                    ? 'The tag name should use underscores, should not start with the word "section" and the first letter always have to be capitalized. (e.g., Assessment_Items).'
                    : formData.fieldType === 'TOGGLE'
                    ? 'The tag name should use camelCase (e.g., isGroundCourse).'
                    : 'The variable name used in the docxtemplate (e.g., {crew_communication}). Must be unique within a template.'
                  }
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-primary-custom">Field Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.fieldType}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldType: e.target.value }))}
                  required
                >
                  <option value="TEXT">TEXT</option>
                  <option value="PART">PART</option>
                  <option value="TOGGLE">TOGGLE</option>
                  <option value="SECTION_CONTROL_TOGGLE">SECTION_CONTROL_TOGGLE</option>
                  <option value="VALUE_LIST">VALUE_LIST</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-primary-custom">Role Required <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.roleRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleRequired: e.target.value }))}
                  required
                >
                  <option value="">Select role</option>
                  <option value="TRAINER">TRAINER</option>
                  <option value="TRAINEE">TRAINEE</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveField} disabled={isSubmitting}>
          Save Field
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGlobalFieldModal;

