import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { X, Save } from 'react-bootstrap-icons';
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
          setErrors({});
        } catch (error) {
          console.error('Error loading field detail:', error);
          // Fallback to field from prop if detail fetch fails
          setFormData({
            label: field.label || '',
            fieldName: field.fieldName || '',
            fieldType: field.fieldType || 'TEXT',
            options: field.options || null
          });
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

      const payload = {
        label: formData.label.trim(),
        fieldName: formData.fieldName.trim(),
        fieldType: formData.fieldType,
        roleRequired: null,
        options: formData.options || null
      };

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
        <Modal.Body style={{ padding: '1.5rem' }}>
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

