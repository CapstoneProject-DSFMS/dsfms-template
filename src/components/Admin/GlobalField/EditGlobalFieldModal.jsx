import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { X, Save, Plus, Pencil } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { globalFieldAPI } from '../../../api';

const EditGlobalFieldModal = ({ show, onHide, field, onSuccess }) => {
  const [formData, setFormData] = useState({
    label: '',
    fieldName: '',
    fieldType: 'TEXT',
    options: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingField, setLoadingField] = useState(false);
  // Children fields state for PART and CHECK_BOX
  const [children, setChildren] = useState([]);
  const [newChildLabel, setNewChildLabel] = useState('');
  const [newChildFieldName, setNewChildFieldName] = useState('');
  const [editingChildIndex, setEditingChildIndex] = useState(null);
  // Options for VALUE_LIST field
  const [valueListOptions, setValueListOptions] = useState([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  useEffect(() => {
    const loadFieldDetail = async () => {
      if (field && show && field.id) {
        try {
          setLoadingField(true);
          // Fetch field detail to ensure we have complete information including fieldType
          const response = await globalFieldAPI.getGlobalFieldDetail(field.id);
          const fieldDetail = response?.data || response || field;
          
          // Normalize fieldType - check multiple possible property names and normalize to uppercase
          const rawFieldType = fieldDetail?.fieldType || fieldDetail?.type || field?.fieldType || field?.type;
          const normalizedFieldType = rawFieldType ? String(rawFieldType).toUpperCase().trim() : 'TEXT';
          
          console.log('EditGlobalFieldModal - Field detail loaded:', {
            fieldFromProp: field,
            responseData: response,
            fieldDetail: fieldDetail,
            rawFieldType: rawFieldType,
            normalizedFieldType: normalizedFieldType
          });
          
          setFormData({
            label: fieldDetail.label || field.label || '',
            fieldName: fieldDetail.fieldName || field.fieldName || '',
            fieldType: normalizedFieldType,
            options: fieldDetail.options || field.options || null
          });
          // Load children if field has them
          if (fieldDetail.children && Array.isArray(fieldDetail.children)) {
            setChildren(fieldDetail.children.map(child => ({
              id: child.id,
              label: child.label || '',
              fieldName: child.fieldName || ''
            })));
          } else {
            setChildren([]);
          }
          // Load options for VALUE_LIST field
          if (normalizedFieldType === 'VALUE_LIST' && fieldDetail.options?.items) {
            setValueListOptions(fieldDetail.options.items);
          } else {
            setValueListOptions([]);
          }
          setErrors({});
        } catch (error) {
          console.error('Error loading field detail:', error);
          // Fallback to field from prop if detail fetch fails
          const fieldTypeToUse = field.fieldType || 'TEXT';
          setFormData({
            label: field.label || '',
            fieldName: field.fieldName || '',
            fieldType: fieldTypeToUse,
            options: field.options || null
          });
          // Load children if field has them
          if (field.children && Array.isArray(field.children)) {
            setChildren(field.children.map(child => ({
              id: child.id,
              label: child.label || '',
              fieldName: child.fieldName || ''
            })));
          } else {
            setChildren([]);
          }
          // Load options for VALUE_LIST field
          if (fieldTypeToUse === 'VALUE_LIST' && field.options?.items) {
            setValueListOptions(field.options.items);
          } else {
            setValueListOptions([]);
          }
          setErrors({});
        } finally {
          setLoadingField(false);
        }
      }
    };

    loadFieldDetail();
  }, [field, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (!formData.fieldName.trim()) {
      newErrors.fieldName = 'Field Name is required';
    }

    if (!formData.fieldType) {
      newErrors.fieldType = 'Field Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare options for VALUE_LIST
      let options = formData.options || null;
      if (formData.fieldType === 'VALUE_LIST') {
        if (!valueListOptions || valueListOptions.length === 0) {
          toast.warning('Please add at least one option for VALUE_LIST field');
          setIsSubmitting(false);
          return;
        }
        options = { items: valueListOptions };
      }

      const payload = {
        label: formData.label.trim(),
        fieldName: formData.fieldName.trim(),
        fieldType: formData.fieldType,
        roleRequired: null,
        options: options
      };

      // Add children for PART and CHECK_BOX fields (complete replacement strategy)
      if (formData.fieldType === 'PART' || formData.fieldType === 'CHECK_BOX') {
        payload.children = children.map(child => {
          // If child has id, it's existing - include id to keep/update it
          if (child.id) {
            return {
              id: child.id,
              label: child.label.trim(),
              // Only include fieldName if it's a new field (no id) or if updating
              ...(child.fieldName && { fieldName: child.fieldName.trim() })
            };
          } else {
            // New child - must have label and fieldName
            return {
              label: child.label.trim(),
              fieldName: child.fieldName.trim()
            };
          }
        });
      }

      await globalFieldAPI.updateGlobalField(field.id, payload);
      
      toast.success('Global field updated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onHide();
    } catch (error) {
      console.error('Error updating global field:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update global field';
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
    setErrors({});
    setChildren([]);
    setNewChildLabel('');
    setNewChildFieldName('');
    setEditingChildIndex(null);
    setValueListOptions([]);
    setNewOptionInput('');
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
      <Modal.Header 
        className="bg-primary-custom text-white border-0 d-flex align-items-center justify-content-between"
        style={{ 
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem',
          padding: '1.25rem 1.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0">
          <Save className="me-2" size={20} />
          <span>Edit Global Field</span>
        </Modal.Title>
        <button 
          onClick={handleClose} 
          className="btn btn-link text-white p-0"
          style={{ 
            border: 'none', 
            background: 'none', 
            opacity: 0.9
          }}
        >
          <X size={24} />
        </button>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body 
          style={{ 
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '1.5rem'
          }}
        >
          {loadingField && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span>Loading field details...</span>
            </div>
          )}
          
          {!loadingField && (
            <>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">
              Label <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              isInvalid={!!errors.label}
              placeholder="Enter field label"
            />
            <Form.Control.Feedback type="invalid">
              {errors.label}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">
              Field Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleChange}
              isInvalid={!!errors.fieldName}
              placeholder="Enter field name (e.g., template_name)"
            />
            <Form.Control.Feedback type="invalid">
              {errors.fieldName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">
              Field Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="fieldType"
              value={formData.fieldType}
              onChange={handleChange}
              isInvalid={!!errors.fieldType}
            >
              <option value="TEXT">TEXT</option>
              <option value="PART">PART</option>
              <option value="CHECK_BOX">CHECK_BOX</option>
              <option value="TOGGLE">TOGGLE</option>
              <option value="VALUE_LIST">VALUE_LIST</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.fieldType}
            </Form.Control.Feedback>
          </Form.Group>

          {/* VALUE_LIST Options Field */}
          {formData.fieldType === 'VALUE_LIST' && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                Options <span className="text-danger">*</span>
              </Form.Label>
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
          )}

          {/* Children Fields Section for PART and CHECK_BOX */}
          {(formData.fieldType === 'PART' || formData.fieldType === 'CHECK_BOX') && (
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-medium mb-0">
                  Children Fields
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
                Manage child fields nested under this {formData.fieldType} field. Children not included will be deleted. Children are automatically TEXT type.
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
                    <div key={child.id || idx} className="d-flex align-items-center justify-content-between p-2 mb-2 border-bottom">
                      <div className="flex-grow-1">
                        {editingChildIndex === idx ? (
                          <Row className="g-2">
                            <Col md={5}>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={child.label}
                                onChange={(e) => {
                                  const updatedChildren = [...children];
                                  updatedChildren[idx] = { ...updatedChildren[idx], label: e.target.value };
                                  setChildren(updatedChildren);
                                }}
                              />
                            </Col>
                            <Col md={5}>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={child.fieldName}
                                onChange={(e) => {
                                  const updatedChildren = [...children];
                                  updatedChildren[idx] = { ...updatedChildren[idx], fieldName: e.target.value };
                                  setChildren(updatedChildren);
                                }}
                                disabled={!!child.id} // Can't change fieldName of existing children
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => setEditingChildIndex(null)}
                                style={{ padding: '0.25rem 0.4rem' }}
                              >
                                <Save size={12} />
                              </Button>
                            </Col>
                          </Row>
                        ) : (
                          <>
                            <div className="fw-medium">{child.label}</div>
                            <code className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {child.fieldName}
                            </code>
                            {child.id && (
                              <small className="text-muted d-block">(Existing)</small>
                            )}
                          </>
                        )}
                      </div>
                      {editingChildIndex !== idx && (
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setEditingChildIndex(idx)}
                            style={{ padding: '0.25rem 0.4rem' }}
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setChildren(prev => prev.filter((_, i) => i !== idx));
                              setEditingChildIndex(null);
                            }}
                            style={{ padding: '0.25rem 0.4rem' }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {children.length === 0 && (
                <Alert variant="info" className="mb-0">
                  No children fields. Add children using the form above.
                </Alert>
              )}
            </Form.Group>
          )}
          </>
          )}
        </Modal.Body>
        
        <Modal.Footer className="bg-light border-0 d-flex flex-wrap gap-2" style={{ justifyContent: 'flex-end' }}>
          <Button 
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || loadingField}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            type="submit"
            disabled={isSubmitting || loadingField}
            className="d-flex align-items-center"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                Update Global Field
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditGlobalFieldModal;

