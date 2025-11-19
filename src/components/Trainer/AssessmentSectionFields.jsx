import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Plus, X, Download, Upload } from 'react-bootstrap-icons';
import assessmentAPI from '../../api/assessment';
import { toast } from 'react-toastify';
import '../../styles/assessment-section-fields.css';

const AssessmentSectionFields = ({ sectionId, onFieldsLoaded }) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    sectionInfo: null,
    fields: [],
    fieldValues: {}
  });

  const fetchFields = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await assessmentAPI.getAssessmentSectionFields(sectionId);
      
      if (response?.success) {
        const fields = response.fields || [];
        const fieldValues = {};
        
        // Initialize field values from API
        fields.forEach((field) => {
          const fieldId = field.templateField?.id;
          if (fieldId) {
            fieldValues[fieldId] = field.assessmentValue?.answerValue || '';
          }
        });

        setState({
          loading: false,
          error: null,
          sectionInfo: response.assessmentSectionInfo || null,
          fields: fields,
          fieldValues: fieldValues
        });

        if (onFieldsLoaded) {
          onFieldsLoaded(response);
        }
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load section fields'
        }));
      }
    } catch (error) {
      console.error('Error loading section fields:', error);
      toast.error('Failed to load section fields');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load section fields'
      }));
    }
  }, [sectionId, onFieldsLoaded]);

  useEffect(() => {
    if (sectionId) {
      fetchFields();
    }
  }, [sectionId, fetchFields]);

  const handleFieldChange = (fieldId, value) => {
    setState((prev) => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      }
    }));
  };

  // Organize fields into hierarchy (parent fields and their children)
  const organizeFields = () => {
    const parentFields = [];
    const childrenMap = {};

    state.fields.forEach((field) => {
      const templateField = field.templateField;
      if (!templateField) return;

      if (!templateField.parentId) {
        // Root level field
        parentFields.push(field);
      } else {
        // Child field
        if (!childrenMap[templateField.parentId]) {
          childrenMap[templateField.parentId] = [];
        }
        childrenMap[templateField.parentId].push(field);
      }
    });

    // Sort by displayOrder
    parentFields.sort((a, b) => (a.templateField?.displayOrder || 0) - (b.templateField?.displayOrder || 0));
    Object.keys(childrenMap).forEach((parentId) => {
      childrenMap[parentId].sort((a, b) => (a.templateField?.displayOrder || 0) - (b.templateField?.displayOrder || 0));
    });

    return { parentFields, childrenMap };
  };

  const renderField = (field, isNested = false) => {
    const templateField = field.templateField;
    if (!templateField) return null;

    const fieldId = templateField.id;
    const fieldType = templateField.fieldType;
    const label = templateField.label || templateField.fieldName;

    if (fieldType === 'PART') {
      // PART fields are containers, render their children
      const { childrenMap } = organizeFields();
      const children = childrenMap[fieldId] || [];
      const itemCount = children.length;

      return (
        <div key={fieldId} className={`field-group ${isNested ? 'nested-group' : ''}`}>
          <div className="field-group-header">
            <h6 className="field-group-title">{label}</h6>
            {itemCount > 0 && (
              <span className="field-item-count">{itemCount} ITEMS</span>
            )}
          </div>
          <div className="field-group-content">
            {children.length > 0 && (
              <Row className="g-3">
                {children.map((childField, idx) => {
                  if (idx % 2 === 0) {
                    const leftField = childField;
                    const rightField = children[idx + 1];
                    return (
                      <React.Fragment key={`row-${idx}`}>
                        <Col md={6}>
                          {renderFieldInput(leftField, true)}
                        </Col>
                        {rightField && (
                          <Col md={6}>
                            {renderFieldInput(rightField, true)}
                          </Col>
                        )}
                      </React.Fragment>
                    );
                  }
                  return null;
                })}
              </Row>
            )}
            <div className="field-group-actions">
              <Button variant="outline-danger" size="sm" className="delete-group-btn">
                <X size={14} className="me-1" />
                Delete
              </Button>
              <Button variant="outline-primary" size="sm" className="add-item-btn">
                <Plus size={14} className="me-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Regular field input (rendered in pairs)
    return null;
  };

  const renderFieldInput = (field, isNested = false) => {
    const templateField = field.templateField;
    if (!templateField) return null;

    const fieldId = templateField.id;
    const fieldType = templateField.fieldType;
    const label = templateField.label || templateField.fieldName;

    if (fieldType === 'PART') {
      return renderField(field, isNested);
    }

    return (
      <div key={fieldId} className="field-input-wrapper">
        <Form.Label className="field-label">{label}</Form.Label>
        <Form.Control
          type="text"
          value={state.fieldValues[fieldId] || ''}
          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="field-input"
        />
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-4">
        <Spinner animation="border" role="status" size="sm">
          <span className="visually-hidden">Loading fields...</span>
        </Spinner>
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert variant="danger" className="mb-0">
        {state.error}
      </Alert>
    );
  }

  const { parentFields } = organizeFields();

  return (
    <div className="assessment-section-fields">
      <div className="fields-toolbar">
        <Button variant="outline-secondary" size="sm">
          <Download size={14} className="me-1" />
          Import
        </Button>
        <Button variant="outline-secondary" size="sm">
          <Upload size={14} className="me-1" />
          Export
        </Button>
      </div>

      <div className="fields-container">
        <Row className="g-3">
          {parentFields.map((field, idx) => {
            const templateField = field.templateField;
            if (!templateField) return null;

            if (templateField.fieldType === 'PART') {
              // PART fields span full width
              return (
                <Col xs={12} key={templateField.id}>
                  {renderField(field)}
                </Col>
              );
            }

            // Regular fields in pairs (2 columns)
            if (idx % 2 === 0) {
              const leftField = field;
              const rightField = parentFields[idx + 1];
              return (
                <React.Fragment key={`row-${idx}`}>
                  <Col md={6}>
                    {renderFieldInput(leftField)}
                  </Col>
                  {rightField && rightField.templateField?.fieldType !== 'PART' && (
                    <Col md={6}>
                      {renderFieldInput(rightField)}
                    </Col>
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}
        </Row>
      </div>
    </div>
  );
};

export default AssessmentSectionFields;

