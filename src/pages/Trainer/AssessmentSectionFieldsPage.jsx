import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Card, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gear } from 'react-bootstrap-icons';
import assessmentAPI from '../../api/assessment';
import { toast } from 'react-toastify';
import '../../styles/assessment-section-fields.css';

const AssessmentSectionFieldsPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    error: null,
    sectionInfo: null,
    fields: [],
    fieldValues: {},
    sectionControlToggleValue: false,
    isSectionDisabled: false,
    canUpdate: false,
    canSave: false
  });
  
  // State for CHECKBOX default values (fieldId -> default value)
  const [checkboxDefaults, setCheckboxDefaults] = useState({});
  const [showCheckboxConfigModal, setShowCheckboxConfigModal] = useState(false);
  const [currentCheckboxField, setCurrentCheckboxField] = useState(null);
  const [currentCheckboxDefault, setCurrentCheckboxDefault] = useState('X');
  const [saving, setSaving] = useState(false);

  const fetchFields = useCallback(async () => {
    if (!sectionId) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await assessmentAPI.getAssessmentSectionFields(sectionId);
      
      if (response?.success) {
        const fields = response.fields || [];
        const fieldValues = {};
        let sectionControlToggleValue = true; // Default to true
        
        // Initialize field values from API
        fields.forEach((field) => {
          const fieldId = field.templateField?.id;
          if (fieldId) {
            const fieldType = field.templateField?.fieldType;
            const value = field.assessmentValue?.answerValue;
            
            // Handle SECTION_CONTROL_TOGGLE
            if (fieldType === 'SECTION_CONTROL_TOGGLE') {
              // If API has value, use it; otherwise default to true
              sectionControlToggleValue = value !== null && value !== undefined 
                ? (value === 'true' || value === true || value === 'TRUE')
                : true;
            } else {
              // Keep null as null, don't convert to empty string
              fieldValues[fieldId] = value !== null && value !== undefined ? value : null;
            }
            
            // Initialize checkbox defaults
            if (fieldType === 'CHECK_BOX') {
              if (!checkboxDefaults[fieldId]) {
                setCheckboxDefaults(prev => ({ ...prev, [fieldId]: 'X' }));
              }
            }
          }
        });

        const sectionInfo = response.assessmentSectionInfo || null;
        const canUpdate = sectionInfo?.canUpdated || false;
        const canSave = sectionInfo?.canSave || false;
        
        setState({
          loading: false,
          error: null,
          sectionInfo: sectionInfo,
          fields: fields,
          fieldValues: fieldValues,
          sectionControlToggleValue: sectionControlToggleValue,
          // When toggle is TRUE, fields are enabled (not disabled)
          // When toggle is FALSE, fields are disabled
          isSectionDisabled: !sectionControlToggleValue || (!canUpdate && !canSave),
          canUpdate: canUpdate,
          canSave: canSave
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
  }, [sectionId, checkboxDefaults]);

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

  const handleSectionControlToggle = (checked) => {
    setState((prev) => ({
      ...prev,
      sectionControlToggleValue: checked,
      // When toggle is TRUE (checked), fields are enabled (not disabled)
      // When toggle is FALSE (!checked), fields are disabled
      isSectionDisabled: !checked || (!prev.canUpdate && !prev.canSave)
    }));
  };

  const handleCheckboxChange = (fieldId, checked, parentFieldId) => {
    const defaultValue = checkboxDefaults[parentFieldId] || 'X';
    handleFieldChange(fieldId, checked ? defaultValue : null);
  };

  const handleOpenCheckboxConfig = (field) => {
    const fieldId = field.templateField?.id;
    const currentDefault = checkboxDefaults[fieldId] || 'X';
    setCurrentCheckboxField(field);
    setCurrentCheckboxDefault(currentDefault);
    setShowCheckboxConfigModal(true);
  };

  const handleSaveCheckboxConfig = () => {
    if (currentCheckboxField) {
      const fieldId = currentCheckboxField.templateField?.id;
      setCheckboxDefaults(prev => ({ ...prev, [fieldId]: currentCheckboxDefault }));
      setShowCheckboxConfigModal(false);
      toast.success('Checkbox default value updated');
    }
  };

  // Organize fields into hierarchy (parent fields and their children)
  const organizeFields = () => {
    const parentFields = [];
    const childrenMap = {};
    let sectionControlToggleField = null;

    state.fields.forEach((field) => {
      const templateField = field.templateField;
      if (!templateField) return;

      if (templateField.fieldType === 'SECTION_CONTROL_TOGGLE') {
        sectionControlToggleField = field;
        return;
      }

      if (!templateField.parentId) {
        parentFields.push(field);
      } else {
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

    return { parentFields, childrenMap, sectionControlToggleField };
  };

  const renderFieldInput = (field) => {
    const templateField = field.templateField;
    if (!templateField) return null;

    const fieldId = templateField.id;
    const fieldType = templateField.fieldType;
    const label = templateField.label || templateField.fieldName || 'Unnamed Field';
    const value = state.fieldValues[fieldId] ?? '';
    const options = templateField.options?.items || null;
    const disabled = state.isSectionDisabled || (!state.canUpdate && !state.canSave);

    // Check if field has options - render dropdown
    if (options && Array.isArray(options) && options.length > 0) {
      return (
        <div key={fieldId} className="field-input-wrapper">
          <Form.Label className="field-label">{label}</Form.Label>
          <Form.Select
            value={value}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            disabled={disabled}
            className="field-input"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </div>
      );
    }

    // FINAL_SCORE_NUM - validate number input
    if (fieldType === 'FINAL_SCORE_NUM') {
      return (
        <div key={fieldId} className="field-input-wrapper">
          <Form.Label className="field-label">{label}</Form.Label>
          <Form.Control
            type="number"
            value={value}
            onChange={(e) => {
              const numValue = e.target.value;
              // Only allow numbers (including decimals)
              if (numValue === '' || /^-?\d*\.?\d*$/.test(numValue)) {
                handleFieldChange(fieldId, numValue);
              }
            }}
            placeholder={`Enter ${label.toLowerCase()}`}
            disabled={disabled}
            className="field-input"
          />
        </div>
      );
    }

    // TOGGLE
    if (fieldType === 'TOGGLE') {
      return (
        <div key={fieldId} className="field-input-wrapper">
          <Form.Label className="field-label">{label}</Form.Label>
          <Form.Check
            type="switch"
            checked={value === 'true' || value === true || value === 'TRUE'}
            onChange={(e) => handleFieldChange(fieldId, e.target.checked ? 'true' : 'false')}
            disabled={disabled}
            className="field-toggle"
          />
        </div>
      );
    }

    // TEXT and other types - render as text input
    return (
      <div key={fieldId} className="field-input-wrapper">
        <Form.Label className="field-label">{label}</Form.Label>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
          className="field-input"
        />
      </div>
    );
  };

  const renderCheckboxField = (field) => {
    const templateField = field.templateField;
    if (!templateField || templateField.fieldType !== 'CHECK_BOX') return null;

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
          <Button
            variant="link"
            size="sm"
            className="p-0 ms-2"
            onClick={() => handleOpenCheckboxConfig(field)}
            style={{ color: '#6c757d' }}
            title="Configure checkbox value"
          >
            <Gear size={14} />
          </Button>
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
                        {renderCheckboxInput(leftField)}
                      </Col>
                      {rightField && (
                        <Col md={6}>
                          {renderCheckboxInput(rightField)}
                        </Col>
                      )}
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </Row>
          )}
        </div>
      </div>
    );
  };

  const renderCheckboxInput = (field) => {
    const templateField = field.templateField;
    if (!templateField) return null;

    const fieldId = templateField.id;
    const label = templateField.label || templateField.fieldName || 'Unnamed Field';
    const value = state.fieldValues[fieldId];
    // Checkbox is checked if value exists and is not null/empty
    const checked = value !== null && value !== undefined && value !== '';
    const disabled = state.isSectionDisabled || (!state.canUpdate && !state.canSave);

    return (
      <div key={fieldId} className="field-input-wrapper">
        <Form.Label className="field-label">{label}</Form.Label>
        <Form.Check
          type="checkbox"
          checked={checked}
          onChange={(e) => handleCheckboxChange(fieldId, e.target.checked, templateField.parentId)}
          disabled={disabled}
          className="field-checkbox"
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
        </div>
      </div>
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Build values array for API payload (shared by Save, Update)
  const buildValuesPayload = () => {
    const { sectionControlToggleField } = organizeFields();
    const allFields = [...state.fields];
    const values = [];
    const processedFieldIds = new Set();
    
    allFields.forEach((field) => {
      const templateField = field.templateField;
      if (!templateField) return;
      
      const fieldId = templateField.id;
      const fieldType = templateField.fieldType;
      const assessmentValueId = field.assessmentValue?.id;
      
      if (fieldType === 'SECTION_CONTROL_TOGGLE') return;
      if (!assessmentValueId) return;
      if (processedFieldIds.has(assessmentValueId)) return;
      processedFieldIds.add(assessmentValueId);

      let answerValue = state.fieldValues[fieldId];
      
      if (answerValue === undefined || answerValue === null) {
        answerValue = null;
      } else {
        if (typeof answerValue === 'string' && answerValue.trim() === '') {
          answerValue = null;
        }
      }
      
      if (fieldType === 'FINAL_SCORE_NUM' && answerValue !== null) {
        answerValue = String(answerValue);
      }

      // Handle TOGGLE fields specially
      if (fieldType === 'TOGGLE') {
        // When toggle is FALSE, set TOGGLE field to 'false' (section is disabled)
        // When toggle is TRUE, keep the value as-is or default to 'false'
        if (!state.sectionControlToggleValue) {
          answerValue = 'false';
        } else {
          // Section is enabled, use current value or default to 'false'
          answerValue = answerValue || 'false';
        }
      } else {
        // For non-TOGGLE fields
        // When toggle is FALSE, set all other fields to null (fields are disabled)
        // When toggle is TRUE, keep the values as they are (fields are enabled)
        if (!state.sectionControlToggleValue) {
          answerValue = null;
        }
      }

      values.push({
        assessmentValueId: assessmentValueId,
        answerValue: answerValue
      });
    });

    if (sectionControlToggleField) {
      const toggleAssessmentValueId = sectionControlToggleField.assessmentValue?.id;
      if (toggleAssessmentValueId) {
        values.push({
          assessmentValueId: toggleAssessmentValueId,
          answerValue: state.sectionControlToggleValue ? 'true' : 'false'
        });
      }
    }

    return {
      assessmentSectionId: sectionId,
      values: values
    };
  };

  const handleSave = async () => {
    if (!sectionId || !state.canSave) return;

    try {
      setSaving(true);
      const payload = buildValuesPayload();
      await assessmentAPI.saveSectionValues(payload);
      toast.success('Section saved successfully');
      // Navigate back after 1 second to let toast show
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error(error.response?.data?.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!sectionId || !state.canUpdate) return;

    try {
      setSaving(true);
      const payload = buildValuesPayload();
      await assessmentAPI.updateSectionValues(payload);
      toast.success('Section updated successfully');
      // Navigate back after 1 second to let toast show
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error(error.response?.data?.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
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

  const { parentFields, sectionControlToggleField } = organizeFields();
  const sectionLabel = state.sectionInfo?.templateSection?.label || 'Section';
  const sectionSubtitle = state.sectionInfo?.templateSection 
    ? `${state.sectionInfo.templateSection.editBy} · ${state.sectionInfo.templateSection.roleInSubject}`
    : '';

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
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
            {sectionSubtitle && (
              <p className="text-muted mb-0">{sectionSubtitle}</p>
            )}
          </div>
        </div>
        
        {/* SECTION_CONTROL_TOGGLE */}
        {sectionControlToggleField && (
          <div className="d-flex align-items-center">
            <Form.Label className="me-2 mb-0">
              {sectionControlToggleField.templateField?.label || 'Section Control'}
            </Form.Label>
            <Form.Check
              type="switch"
              checked={state.sectionControlToggleValue}
              onChange={(e) => handleSectionControlToggle(e.target.checked)}
              disabled={!state.canUpdate && !state.canSave}
            />
          </div>
        )}
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
                    return (
                      <Col xs={12} key={templateField.id}>
                        {renderFieldGroup(field)}
                      </Col>
                    );
                  }

                  if (templateField.fieldType === 'CHECK_BOX') {
                    return (
                      <Col xs={12} key={templateField.id}>
                        {renderCheckboxField(field)}
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
                        {rightField && 
                         rightField.templateField?.fieldType !== 'PART' && 
                         rightField.templateField?.fieldType !== 'CHECK_BOX' && (
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
        {state.canUpdate && (
          <Button variant="warning" onClick={handleUpdate} disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </Button>
        )}
        {state.canSave && (
          <Button variant="outline-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>

      {/* Checkbox Config Modal */}
      <Modal show={showCheckboxConfigModal} onHide={() => setShowCheckboxConfigModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Configure Checkbox Value</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Default Value (when checked)</Form.Label>
            <Form.Control
              type="text"
              value={currentCheckboxDefault}
              onChange={(e) => setCurrentCheckboxDefault(e.target.value)}
              placeholder="Enter default value (e.g., X, Y, PASS)"
            />
            <Form.Text className="text-muted">
              This value will be sent to backend when checkbox is checked. Default: "X"
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckboxConfigModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCheckboxConfig}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AssessmentSectionFieldsPage;
