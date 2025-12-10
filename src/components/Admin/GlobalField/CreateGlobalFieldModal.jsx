import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Plus, X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { globalFieldAPI } from '../../../api';
import '../../../styles/global-field-list.css';

const CreateGlobalFieldModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    label: '',
    fieldName: '',
    fieldType: 'TEXT',
    options: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valueListOptions, setValueListOptions] = useState([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  // Children fields state for PART and CHECK_BOX
  const [children, setChildren] = useState([]);
  const [newChildLabel, setNewChildLabel] = useState('');
  const [newChildFieldName, setNewChildFieldName] = useState('');

  const validateFieldName = (fieldName, fieldType) => {
    if (!fieldName) return { valid: false, message: 'Field name is required' };
    
    const type = String(fieldType || '').toUpperCase();
    
    // For global fields, we'll use snake_case as default (like TEXT type)
    // Similar to "Add New Field" logic but simplified for global fields
    if (type === 'PART' || type === 'CHECK_BOX') {
      // PART/CHECK_BOX: underscores, capitalized first letter, not start with "section"
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
    if (!formData.label || !formData.fieldName) {
      toast.warning('Please fill in all required fields');
      return;
    }

    // Validate VALUE_LIST option if fieldType is VALUE_LIST
    if (formData.fieldType === 'VALUE_LIST') {
      if (!valueListOptions || valueListOptions.length === 0) {
        toast.warning('Please add at least one option for VALUE_LIST field');
        return;
      }
    }

    // Validate fieldName format based on fieldType
    const validation = validateFieldName(formData.fieldName, formData.fieldType);
    if (!validation.valid) {
      toast.warning(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare options for VALUE_LIST
      let options = null;
      if (formData.fieldType === 'VALUE_LIST' && valueListOptions.length > 0) {
        options = { items: valueListOptions };
      }

      // Build payload with children if PART or CHECK_BOX
      const payload = {
        label: formData.label.trim(),
        fieldName: formData.fieldName.trim(),
        fieldType: formData.fieldType,
        roleRequired: null,
        options: options
      };

      // Add children for PART and CHECK_BOX fields
      if ((formData.fieldType === 'PART' || formData.fieldType === 'CHECK_BOX') && children.length > 0) {
        // Generate tempId for parent
        const parentTempId = `parent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        payload.tempId = parentTempId;
        payload.children = children.map(child => ({
          label: child.label,
          fieldName: child.fieldName,
          parentTempId: parentTempId
        }));
      }

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
      options: null
    });
    setValueListOptions([]);
    setNewOptionInput('');
    setChildren([]);
    setNewChildLabel('');
    setNewChildFieldName('');
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg"
      centered
      fullscreen="md-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>Create Global Field</Modal.Title>
      </Modal.Header>
      <Modal.Body 
        style={{ 
          maxHeight: '70vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem'
        }}
        className="modal-body-scrollable"
      >
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
                    formData.fieldType === 'PART' || formData.fieldType === 'CHECK_BOX'
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
                  {formData.fieldType === 'PART' || formData.fieldType === 'CHECK_BOX'
                    ? 'The tag name should use underscores, should not start with the word "section" and the first letter always have to be capitalized. (e.g., Assessment_Items).'
                    : formData.fieldType === 'TOGGLE'
                    ? 'The tag name should use camelCase (e.g., isGroundCourse).'
                    : 'The variable name used in the docxtemplate (e.g., {crew_communication}). Must be unique within a template.'
                  }
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-primary-custom">Field Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.fieldType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData(prev => ({ ...prev, fieldType: newType, options: null }));
                    // Reset options array when changing field type
                    if (newType !== 'VALUE_LIST') {
                      setValueListOptions([]);
                      setNewOptionInput('');
                    }
                    // Reset children when changing away from PART/CHECK_BOX
                    if (newType !== 'PART' && newType !== 'CHECK_BOX') {
                      setChildren([]);
                      setNewChildLabel('');
                      setNewChildFieldName('');
                    }
                  }}
                  required
                >
                  <option value="TEXT">TEXT</option>
                  <option value="PART">PART</option>
                  <option value="CHECK_BOX">CHECK_BOX</option>
                  <option value="TOGGLE">TOGGLE</option>
                  <option value="VALUE_LIST">VALUE_LIST</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {/* VALUE_LIST Options Field */}
            {formData.fieldType === 'VALUE_LIST' && (
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Options <span className="text-danger">*</span></Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Enter option value (e.g., Pass, Fail)"
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmedValue = newOptionInput.trim();
                          if (trimmedValue) {
                            // Check for duplicate
                            if (valueListOptions.includes(trimmedValue)) {
                              toast.warning('This option already exists. Please enter a different value.');
                              return;
                            }
                            setValueListOptions(prev => [...prev, trimmedValue]);
                            setNewOptionInput('');
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        const trimmedValue = newOptionInput.trim();
                        if (trimmedValue) {
                          // Check for duplicate
                          if (valueListOptions.includes(trimmedValue)) {
                            toast.warning('This option already exists. Please enter a different value.');
                            return;
                          }
                          setValueListOptions(prev => [...prev, trimmedValue]);
                          setNewOptionInput('');
                        }
                      }}
                      disabled={!newOptionInput.trim()}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  {valueListOptions.length > 0 && (
                    <div className="d-flex flex-column gap-2 mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {valueListOptions.map((option, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 p-2 border rounded">
                          <span className="flex-grow-1">{option}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setValueListOptions(prev => prev.filter((_, i) => i !== idx));
                            }}
                            style={{ padding: '0.25rem 0.4rem' }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Form.Text className="text-muted">
                    Add options one by one.
                  </Form.Text>
                </Form.Group>
              </Col>
            )}
            {/* Children Fields Section for PART and CHECK_BOX */}
            {(formData.fieldType === 'PART' || formData.fieldType === 'CHECK_BOX') && (
              <Col md={12}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="text-primary-custom mb-0">
                      Children Fields (Optional)
                    </Form.Label>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        if (!newChildLabel.trim() || !newChildFieldName.trim()) {
                          toast.warning('Please enter both label and field name for the child field');
                          return;
                        }
                        // Validate child fieldName format (should be snake_case for TEXT children)
                        const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;
                        if (!snakeCaseRegex.test(newChildFieldName.trim())) {
                          toast.warning('Child field name must be in snake_case format (e.g., first_name)');
                          return;
                        }
                        // Check for duplicate fieldName
                        if (children.some(child => child.fieldName === newChildFieldName.trim())) {
                          toast.warning('This field name already exists in children');
                          return;
                        }
                        setChildren(prev => [...prev, {
                          label: newChildLabel.trim(),
                          fieldName: newChildFieldName.trim()
                        }]);
                        setNewChildLabel('');
                        setNewChildFieldName('');
                      }}
                      disabled={!newChildLabel.trim() || !newChildFieldName.trim()}
                    >
                      <Plus size={14} className="me-1" />
                      Add Child
                    </Button>
                  </div>
                  <Form.Text className="text-muted d-block mb-3">
                    Add child fields that will be nested under this {formData.fieldType} field. Children are automatically created as TEXT type.
                  </Form.Text>
                  
                  {/* Add Child Form */}
                  <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <Row className="g-2">
                      <Col md={5}>
                        <Form.Control
                          type="text"
                          placeholder="Child Label (e.g., First Name)"
                          value={newChildLabel}
                          onChange={(e) => setNewChildLabel(e.target.value)}
                          size="sm"
                        />
                      </Col>
                      <Col md={5}>
                        <Form.Control
                          type="text"
                          placeholder="Field Name (e.g., first_name)"
                          value={newChildFieldName}
                          onChange={(e) => setNewChildFieldName(e.target.value)}
                          size="sm"
                        />
                      </Col>
                    </Row>
                  </div>

                  {/* Children List */}
                  {children.length > 0 && (
                    <div className="border rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {children.map((child, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 mb-2 border-bottom">
                          <div className="flex-grow-1">
                            <div className="fw-medium">{child.label}</div>
                            <code className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {child.fieldName}
                            </code>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setChildren(prev => prev.filter((_, i) => i !== idx));
                            }}
                            style={{ padding: '0.25rem 0.4rem' }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>
            )}
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

