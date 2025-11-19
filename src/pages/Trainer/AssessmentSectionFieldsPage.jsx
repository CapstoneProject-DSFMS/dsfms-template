import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'react-bootstrap-icons';
import assessmentAPI from '../../api/assessment';
import { toast } from 'react-toastify';
import '../../styles/assessment-section-fields.css';

const AssessmentSectionFieldsPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    error: null,
    sectionInfo: null,
    fields: [],
    fieldValues: {}
  });

  const fetchFields = useCallback(async () => {
    if (!sectionId) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await assessmentAPI.getAssessmentSectionFields(sectionId);
      
      if (response?.success) {
        const fields = response.fields || [];
        const fieldValues = {};
        
        // Initialize field values from API - lấy toàn bộ từ assessmentValue.answerValue
        fields.forEach((field) => {
          const fieldId = field.templateField?.id;
          if (fieldId) {
            // Lấy giá trị từ API, nếu null thì để rỗng
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
  }, [sectionId]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

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

  const renderFieldInput = (field, isNested = false) => {
    const templateField = field.templateField;
    if (!templateField) return null;

    const fieldId = templateField.id;
    const fieldType = templateField.fieldType;
    // Lấy label từ API - templateField.label hoặc fallback fieldName
    const label = templateField.label || templateField.fieldName || 'Unnamed Field';
    // Lấy value từ state.fieldValues (đã được khởi tạo từ assessmentValue.answerValue)
    const value = state.fieldValues[fieldId] || '';

    // Render input dựa trên fieldType
    if (fieldType === 'TOGGLE') {
      return (
        <div key={fieldId} className="field-input-wrapper">
          <Form.Label className="field-label">{label}</Form.Label>
          <Form.Check
            type="switch"
            checked={value === 'true' || value === true}
            onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
            className="field-toggle"
          />
        </div>
      );
    }

    // TEXT, NUMBER, DATE, etc. - render as text input
    return (
      <div key={fieldId} className="field-input-wrapper">
        <Form.Label className="field-label">{label}</Form.Label>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="field-input"
        />
      </div>
    );
  };

  const renderFieldGroup = (field) => {
    const templateField = field.templateField;
    if (!templateField || templateField.fieldType !== 'PART') return null;

    const fieldId = templateField.id;
    const label = templateField.label || templateField.fieldName || 'Unnamed Group';
    const { childrenMap } = organizeFields();
    const children = childrenMap[fieldId] || [];
    const itemCount = children.length;

    return (
      <div key={fieldId} className="field-group">
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
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    toast.success('Section saved (mock).');
  };

  const handleSubmit = () => {
    toast.success('Section submitted (mock).');
  };

  if (state.loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="mb-0">
          {state.error}
        </Alert>
      </Container>
    );
  }

  const { parentFields } = organizeFields();
  const sectionLabel = state.sectionInfo?.templateSection?.label || 'Section';

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          className="me-3 d-flex align-items-center justify-content-center"
          onClick={handleBack}
          style={{ borderRadius: '999px', padding: '0.45rem 1.5rem' }}
        >
          <ArrowLeft size={16} className="me-2" />
          Back
        </Button>
        <div>
          <h4 className="mb-1">{sectionLabel}</h4>
          {state.sectionInfo?.templateSection && (
            <p className="text-muted mb-0">
              {state.sectionInfo.templateSection.editBy} · {state.sectionInfo.templateSection.roleInSubject}
            </p>
          )}
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="assessment-section-fields">
            <div className="fields-container">
              <Row className="g-3">
                {parentFields.map((field, idx) => {
                  const templateField = field.templateField;
                  if (!templateField) return null;

                  if (templateField.fieldType === 'PART') {
                    // PART fields span full width
                    return (
                      <Col xs={12} key={templateField.id}>
                        {renderFieldGroup(field)}
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
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end gap-3 mt-4">
        <Button variant="outline-primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </Container>
  );
};

export default AssessmentSectionFieldsPage;

