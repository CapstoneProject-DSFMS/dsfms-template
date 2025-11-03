import React, { useState, useEffect } from 'react';
import { Button, Alert, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { Plus, X, ArrowDown, Pencil, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { roleAPI } from '../../../api/role';
import { readTemplateMetaFromStorage, buildTemplatePayload } from '../../../utils/templateBuilder';
import apiClient from '../../../api/config.js';

const CustomFieldsPanel = ({ 
  customFields = [], 
  onAddField,
  onRemoveField,
  onInsertField,
  exportEditedDoc,
  exportAndUploadEditedDoc,
  readOnly = false,
  className = ""
}) => {
  const [sections, setSections] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [dragState, setDragState] = useState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' });

  // Section modal state
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSection, setNewSection] = useState({
    name: '',
    label: '',
    displayOrder: 1,
    editBy: 'TRAINER',
    roleInSubject: '',
    isSubmittable: true,
    isToggleDependent: false,
    fields: []
  });
  const [availableRoles, setAvailableRoles] = useState(['TRAINER', 'TRAINEE']);

  // Field modal state
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [newField, setNewField] = useState({
    label: '',
    fieldName: '',
    fieldType: 'TEXT',
    roleRequired: 'TRAINER',
    parentTempId: null
  });

  // If legacy customFields prop provided, seed a default section once
  useEffect(() => {
    if (customFields && customFields.length > 0 && sections.length === 0) {
      setSections([
        {
          name: 'Default',
          label: 'Default',
          displayOrder: 1,
          editBy: 'TRAINER',
          roleInSubject: '',
          isSubmittable: true,
          isToggleDependent: false,
          fields: [...customFields]
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSection = () => {
    setNewSection({
      name: '',
      label: '',
      displayOrder: sections.length + 1,
      editBy: 'TRAINER',
      roleInSubject: '',
      isSubmittable: true,
      isToggleDependent: false,
      fields: []
    });
    setShowSectionModal(true);
  };

  const toggleSection = (index) => {
    setCollapsedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const reorderWithinSection = (sectionIndex, fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    setSections((prev) => {
      const next = [...prev];
      const fields = [...(next[sectionIndex]?.fields || [])];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      // do not reassign displayOrder here; compute at submit time
      next[sectionIndex] = { ...next[sectionIndex], fields };
      // notify parent (flattened) if needed
      if (onAddField) {
        const flattened = next.flatMap((s) => s.fields || []);
        onAddField(flattened, { silent: true });
      }
      return next;
    });
  };

  const handleSaveSection = () => {
    if (!newSection.name || !newSection.label) {
      toast.warning('Please fill in section name and label');
      return;
    }
    // simple unique section name check
    if (sections.some((s) => s.name === newSection.name)) {
      toast.warning('Section name must be unique');
      return;
    }
    // If editBy is TRAINEE, set roleInSubject to null; if TRAINER, keep the value
    const sectionToAdd = {
      ...newSection,
      roleInSubject: newSection.editBy === 'TRAINEE' ? null : (newSection.roleInSubject || null)
    };
    setSections((prev) => [...prev, sectionToAdd]);
    setShowSectionModal(false);
  };

  // Load roles and filter to TRAINER/TRAINEE when opening section modal
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await roleAPI.getRoles();
        const roles = Array.isArray(data?.roles) ? data.roles : (Array.isArray(data) ? data : []);
        const filtered = roles
          .map((r) => (typeof r === 'string' ? r : (r.name || r.code || r.roleName || '')))
          .filter((name) => typeof name === 'string')
          .map((n) => n.toUpperCase())
          .filter((n) => n.includes('TRAINER') || n.includes('TRAINEE'))
          .map((n) => (n.includes('TRAINER') ? 'TRAINER' : 'TRAINEE'));
        const unique = Array.from(new Set(filtered));
        if (unique.length > 0) setAvailableRoles(unique);
      } catch {
        // fallback already set
      }
    };
    if (showSectionModal) {
      loadRoles();
    }
  }, [showSectionModal]);

  const handleAddField = (sectionIndex) => {
    const section = sections[sectionIndex];
    const roleRequired = section?.editBy || 'TRAINER';
    setNewField({
      label: '',
      fieldName: '',
      fieldType: 'TEXT',
      roleRequired: roleRequired,
      displayOrder: 1,
      parentTempId: null
    });
    setEditingSectionIndex(sectionIndex);
    setShowFieldModal(true);
  };

  // Validation helper for field name based on field type
  const validateFieldName = (fieldName, fieldType) => {
    if (!fieldName) return { valid: false, message: 'Field name is required' };
    
    const type = String(fieldType || '').toUpperCase();
    
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
      // Other types (TEXT, etc.): snake_case (default)
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

  const handleSaveField = () => {
    if (!newField.label || !newField.fieldName) {
      toast.warning('Please fill in all required fields');
      return;
    }

    // Validate fieldName format based on fieldType
    const validation = validateFieldName(newField.fieldName, newField.fieldType);
    if (!validation.valid) {
      toast.warning(validation.message);
      return;
    }

    // Section must be selected
    if (editingSectionIndex === null || editingSectionIndex < 0 || editingSectionIndex >= sections.length) {
      toast.warning('Please choose a section');
      return;
    }

    // Check if fieldName already exists within the section (exclude current field if editing)
    const sectionFields = sections[editingSectionIndex].fields || [];
    const existingFields = editingFieldIndex !== null 
      ? sectionFields.filter((_, index) => index !== editingFieldIndex)
      : sectionFields;
    
    if (existingFields.some(field => field.fieldName === newField.fieldName)) {
      toast.warning('Field name must be unique');
      return;
    }

    const nextSections = [...sections];
    if (editingFieldIndex !== null) {
      // Update existing field in the selected section
      nextSections[editingSectionIndex].fields = [
        ...sectionFields.slice(0, editingFieldIndex),
        newField,
        ...sectionFields.slice(editingFieldIndex + 1)
      ];
    } else {
      // Add new field in the selected section (no displayOrder; computed on submit)
      nextSections[editingSectionIndex].fields = [...sectionFields, { ...newField }];
    }

    setSections(nextSections);
    // Keep external callback compatible if provided
    if (onAddField) {
      // Flatten all fields to maintain backward compatibility for parent state
      const flattened = nextSections.flatMap((s) => s.fields || []);
      onAddField(flattened);
    }
    
    setShowFieldModal(false);
    setShowEditModal(false);
    setEditingSectionIndex(null);
    setEditingFieldIndex(null);
  };

  const handleEditField = (sectionIndex, fieldIndex) => {
    const field = sections[sectionIndex]?.fields?.[fieldIndex];
    if (!field) return;
    setNewField({ ...field });
    setEditingSectionIndex(sectionIndex);
    setEditingFieldIndex(fieldIndex);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowFieldModal(false);
    setShowEditModal(false);
    setShowSectionModal(false);
    setEditingSectionIndex(null);
    setEditingFieldIndex(null);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitTemplate = async () => {
    try {
      setIsSubmitting(true);
      const meta = readTemplateMetaFromStorage();
      
      // Step: Export → Fetch → Upload → Get S3 URL for templateConfig
      let templateConfigUrl = null; // URL của file đã chỉnh sửa
      const originalTemplateContent = meta.templateContent; // URL file import ban đầu
      
      console.log('📋 Original templateContent (file import):', originalTemplateContent);
      
      if (exportAndUploadEditedDoc) {
        try {
          console.log('📤 Step 1: Starting export and upload flow...');
          console.log('📤 Step 2: Calling editor.downloadAs("docx")...');
          
          templateConfigUrl = await exportAndUploadEditedDoc();
          
          console.log('✅ Step 3: Export and upload SUCCESS!');
          console.log('✅ templateConfig URL (file đã chỉnh sửa):', templateConfigUrl);
          console.log('📊 Export flow status: ✅ HOẠT ĐỘNG');
        } catch (err) {
          console.error('❌ Export/Upload failed:', err);
          console.log('📊 Export flow status: ❌ KHÔNG HOẠT ĐỘNG - Using fallback');
          toast.warning('Could not upload edited document, templateConfig will be null');
          templateConfigUrl = null;
        }
      } else {
        console.log('⚠️ exportAndUploadEditedDoc function not available');
        console.log('📊 Export flow status: ⚠️ FUNCTION KHÔNG TỒN TẠI');
        templateConfigUrl = null;
      }
      
      // Build payload:
      // - templateContent: URL file import ban đầu
      // - templateConfig: URL file đã chỉnh sửa (nếu export thành công)
      const effectiveMeta = { 
        ...meta, 
        templateContent: originalTemplateContent, // Giữ nguyên file import
        templateConfig: templateConfigUrl // URL file đã chỉnh sửa
      };
      
      const payload = buildTemplatePayload(effectiveMeta, sections);
      
      console.log('🧩 Template payload built:');
      console.log('  📄 templateContent (file import):', payload.templateContent);
      console.log('  ✏️ templateConfig (file đã chỉnh sửa):', payload.templateConfig || 'null');
      console.log('🧩 Full payload:\n', JSON.stringify(payload, null, 2));
      
      const res = await apiClient.post('/templates', payload);
      toast.success('Template submitted successfully');
      console.log('✅ Backend response:', res?.data ?? res);
    } catch (err) {
      console.error('❌ Submit template failed:', err);
      toast.error('Failed to submit template: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildTemplateForField = (field) => {
    const name = field.fieldName;
    if (!name) return '';
    switch ((field.fieldType || 'TEXT').toUpperCase()) {
      case 'TOGGLE':
        // {#condition}{/condition}  {^condition}{/condition}
        return `{#${name}}{/` + name + `} {^${name}}{/` + name + `}`;
      case 'PART':
        // {#condition} {test_field} {/condition}
        return `{#${name}} {test_field} {/${name}}`;
      case 'TEXT':
      default:
        // text : {field_name}
        return `{${name}}`;
    }
  };

  // Insert Part Field modal state (full add-field-like form)
  const [showPartFieldModal, setShowPartFieldModal] = useState(false);
  const [activePartField, setActivePartField] = useState(null); // the PART field object
  const [activePartSectionIndex, setActivePartSectionIndex] = useState(null);
  // index kept out to avoid unused variable; we don't need the field index currently
  const [partSubFieldName, setPartSubFieldName] = useState('');
  const [partSubFieldType, setPartSubFieldType] = useState('TEXT'); // TEXT | TOGGLE | IMAGE
  const [partSubFieldLabel, setPartSubFieldLabel] = useState('');
  // displayOrder is auto-assigned based on creation order
  const [partSubFieldRoleRequired, setPartSubFieldRoleRequired] = useState('TRAINER');

  const openInsertPartField = (sectionIndex, fieldIndex, partField) => {
    setActivePartSectionIndex(sectionIndex);
    setActivePartField(partField);
    setPartSubFieldName('');
    setPartSubFieldType('TEXT');
    setPartSubFieldLabel('');
    // order auto
    setPartSubFieldRoleRequired('TRAINER');
    setShowPartFieldModal(true);
  };

  const handleInsertPartField = () => {
    const snake = /^[a-z][a-z0-9_]*$/;
    if (!partSubFieldLabel || !partSubFieldName || !snake.test(partSubFieldName)) {
      toast.warning('Please enter label and snake_case field name, e.g., focus_item');
      return;
    }
    const partName = activePartField?.fieldName;
    if (!partName) {
      toast.error('Invalid PART field');
      return;
    }
    // ensure section context
    if (activePartSectionIndex === null || activePartSectionIndex < 0 || activePartSectionIndex >= sections.length) {
      toast.error('Invalid section');
      return;
    }
    const sectionFields = sections[activePartSectionIndex].fields || [];
    if (sectionFields.some((f) => f.fieldName === partSubFieldName)) {
      toast.warning('Field name must be unique within section');
      return;
    }
    const newSubField = {
      label: partSubFieldLabel,
      fieldName: partSubFieldName,
      fieldType: partSubFieldType,
      roleRequired: partSubFieldRoleRequired,
      parentTempId: activePartField?.tempId || activePartField?.fieldName || null
    };
    const nextSections = [...sections];
    nextSections[activePartSectionIndex].fields = [...sectionFields, newSubField];
    setSections(nextSections);
    if (onAddField) {
      const flattened = nextSections.flatMap((s) => s.fields || []);
      onAddField(flattened);
    }
    // Build inner template based on selected type (TEXT/TOGGLE/IMAGE)
    let inner = `{${partSubFieldName}}`;
    const typeUpper = String(partSubFieldType).toUpperCase();
    if (typeUpper === 'TOGGLE') {
      inner = `{#${partSubFieldName}}{/${partSubFieldName}} {^${partSubFieldName}}{/${partSubFieldName}}`;
    } else if (typeUpper === 'IMAGE') {
      // Image placeholder behaves like text token in template
      inner = `{${partSubFieldName}}`;
    }
    // Insert only the inner field so it goes inside the existing part block
    const template = ` ${inner}`;
    // Defer insertion to next tick to avoid parent state updates during render
    setTimeout(() => onInsertField(template), 0);
    setShowPartFieldModal(false);
    setActivePartField(null);
    setActivePartSectionIndex(null);
    setPartSubFieldName('');
    setPartSubFieldType('TEXT');
    setPartSubFieldLabel('');
    // order auto
    setPartSubFieldRoleRequired('TRAINER');
  };

  return (
    <>
      <style>
        {`
          .insert-field-btn {
            background-color: transparent !important;
            border-color: #007bff !important;
            color: #007bff !important;
          }
          .insert-field-btn:hover:not(:disabled) {
            background-color: #007bff !important;
            border-color: #007bff !important;
            color: white !important;
          }
          .insert-field-btn:focus {
            background-color: transparent !important;
            border-color: #007bff !important;
            color: #007bff !important;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
          }
          /* Visual grouping for PART and its children */
          .bg-part { background-color: rgba(var(--bs-primary-rgb), .06); border-color: rgba(var(--bs-primary-rgb), .35) !important; }
          .part-badge { font-size: 0.65rem; background: var(--bs-primary); }
          .part-children { border-left: 3px dashed rgba(var(--bs-primary-rgb), .35); margin-left: .5rem; padding-left: .75rem; }
          .child-row { background: #ffffff; }
          .field-title { display: flex; align-items: center; gap: .5rem; }
          .section-card { border: 1px solid var(--bs-primary) !important; border-left: 4px solid var(--bs-primary) !important; border-radius: .5rem; }
          .section-header { background: #f8fafc; border-bottom: 1px solid var(--bs-neutral-200); cursor: pointer; }
          .section-body { background: #fbfdff; }
          .section-toggle { color: var(--bs-primary); border-color: var(--bs-primary); background: rgba(var(--bs-primary-rgb), .08); }
          .section-toggle:hover { background: rgba(var(--bs-primary-rgb), .15); }
          .section-card:hover { box-shadow: 0 2px 8px rgba(13,110,253,.08); }
          .section-title { display:flex; align-items:center; gap:.5rem; }
          .field-count-badge { background: rgba(var(--bs-primary-rgb), .08); color: var(--bs-primary); font-weight:600; border:1px solid rgba(var(--bs-primary-rgb), .25); }
          .draggable-item { transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease; }
          .draggable-item.dragging { cursor: grabbing; box-shadow: 0 8px 18px rgba(0,0,0,.08); transform: scale(.995); background:#fff; }
          .drop-target-above { border-top: 3px solid var(--bs-primary) !important; }
          .drop-target-below { border-bottom: 3px solid var(--bs-primary) !important; }
        `}
      </style>
      <div className={`p-3 bg-light custom-fields-panel ${className}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 text-muted">Custom Fields</h6>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleAddSection}
          disabled={readOnly}
        >
          <Plus className="me-1" size={14} />
          Add Section
        </Button>
      </div>
      
      <div className="flex-grow-1" style={{ overflowY: 'auto', minHeight: '0' }}>
        <div className="d-grid gap-2">
          {sections.length > 0 ? (
            sections
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((section, sIdx) => (
                <Card key={sIdx} className="border section-card">
                  <Card.Header 
                    className="d-flex justify-content-between align-items-center section-header"
                    onClick={() => toggleSection(sIdx)}
                    aria-expanded={!collapsedSections[sIdx]}
                  >
                    <div className="d-flex flex-column">
                      <div className="section-title fw-bold">
                        {collapsedSections[sIdx] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        {section.label}
                        <span className="badge rounded-pill ms-1 field-count-badge">
                          {section.fields?.length || 0}
                        </span>
                      </div>
                      <small className="text-muted">Order: {section.displayOrder} • Edit by: {section.editBy}</small>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleAddField(sIdx)}
                        disabled={readOnly}
                      >
                        <Plus className="me-1" size={14} />
                        Add Field
                      </Button>
                    </div>
                  </Card.Header>
                  {!collapsedSections[sIdx] && (
                  <Card.Body className="section-body">
                    {section.fields && section.fields.length > 0 ? (
                      (() => {
                        const allSorted = [...section.fields].sort((a, b) => a.displayOrder - b.displayOrder);
                        const parentIdOf = (f) => (f?.tempId || f?.fieldName || null);
                        const isChild = (f) => !!f.parentTempId;
                        const topLevel = allSorted.filter((f) => !isChild(f));

                        const renderRow = (field, realIndex) => {
                          const isPart = String(field.fieldType).toUpperCase() === 'PART';
                          return (
                          <div
                            key={`${sIdx}-${realIndex}`}
                            className={`p-2 rounded border mb-2 draggable-item ${isPart ? 'bg-part part-card' : 'bg-white child-row'} ${dragState.sectionIndex===sIdx && dragState.overIndex===realIndex ? 'border-primary' : ''} ${dragState.sectionIndex===sIdx && dragState.overIndex===realIndex && dragState.position==='above' ? 'drop-target-above' : ''} ${dragState.sectionIndex===sIdx && dragState.overIndex===realIndex && dragState.position==='below' ? 'drop-target-below' : ''} ${dragState.sectionIndex===sIdx && dragState.fromIndex===realIndex ? 'dragging' : ''}`}
                            draggable
                            onDragStart={(e) => {
                              setDragState({ sectionIndex: sIdx, fromIndex: realIndex, overIndex: realIndex, position: 'above' });
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const mid = rect.top + rect.height / 2;
                              const position = e.clientY < mid ? 'above' : 'below';
                              let targetIndex = realIndex;
                              if (position === 'below') targetIndex = realIndex + 1;
                              if (dragState.sectionIndex === sIdx && (dragState.overIndex !== targetIndex || dragState.position !== position)) {
                                setDragState((prev) => ({ ...prev, overIndex: targetIndex, position }));
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragState.sectionIndex === sIdx) {
                                const toIndex = Math.max(0, Math.min(dragState.overIndex, sections[sIdx]?.fields?.length || 0));
                                reorderWithinSection(sIdx, dragState.fromIndex, toIndex);
                              }
                              setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' });
                            }}
                            onDragEnd={() => setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' })}
                            style={{ cursor: 'grab' }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="flex-grow-1">
                                <div className="fw-bold field-title">{field.label} {isPart && (<span className="badge part-badge">PART</span>)} </div>
                                <small className="text-muted">
                                  {field.fieldName} ({field.fieldType}){field.roleRequired ? ` - ${field.roleRequired}` : ''}
                                </small>
                              </div>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEditField(sIdx, realIndex)}
                                  disabled={readOnly}
                                  title="Edit Field"
                                  className="text-primary border-primary"
                                >
                                  <Pencil size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    const next = [...sections];
                                    next[sIdx].fields = next[sIdx].fields.filter((_, i) => i !== realIndex);
                                    setSections(next);
                                    if (onRemoveField) {
                                      const flattened = next.flatMap((s) => s.fields || []);
                                      onRemoveField(flattened);
                                    }
                                  }}
                                  disabled={readOnly}
                                  title="Remove Field"
                                  className="text-danger border-danger"
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            </div>
                            <div className="d-grid">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onInsertField(buildTemplateForField(field))}
                                disabled={readOnly}
                                className="d-flex align-items-center justify-content-center text-primary border-primary insert-field-btn"
                                style={{ transition: 'all 0.2s ease-in-out' }}
                              >
                                <ArrowDown className="me-1" size={14} />
                                Insert Field
                              </Button>
                              {String(field.fieldType).toUpperCase() === 'PART' && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="mt-2 text-primary border-primary"
                                  onClick={() => openInsertPartField(sIdx, realIndex, field)}
                                  disabled={readOnly}
                                >
                                  <ArrowDown className="me-1" size={14} />
                                  Add Field to PART
                                </Button>
                              )}
                            </div>

                            {String(field.fieldType).toUpperCase() === 'PART' && (
                              (() => {
                                const pid = parentIdOf(field);
                                const children = allSorted.filter((f) => f.parentTempId === pid);
                                if (!children.length) return null;
                                return (
                                  <div className="mt-2 part-children">
                                    {children.map((child) => {
                                      const realIdx = section.fields.indexOf(child);
                                      return renderRow(child, realIdx);
                                    })}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        ); };

                        return (
                          <>
                            {topLevel.map((field) => {
                              const realIndex = section.fields.indexOf(field);
                              return renderRow(field, realIndex);
                            })}
                          </>
                        );
                      })()
                    ) : (
                      <Alert variant="light" className="mb-0">
                        <small>No fields in this section. Click "Add Field".</small>
                      </Alert>
                    )}
                  </Card.Body>
                  )}
                </Card>
              ))
          ) : (
            <Alert variant="light" className="mb-0">
              <small>No sections yet. Click "Add Section" to start.</small>
            </Alert>
          )}
        </div>
      </div>
      
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Alert variant="info" className="mb-0" style={{ fontSize: '0.8rem' }}>
          <strong>Tip:</strong> Create sections first, then add fields inside each section.
        </Alert>
        <Button variant="primary" size="sm" onClick={handleSubmitTemplate} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Template'}
        </Button>
      </div>

      {/* Add Section Modal */}
      <Modal show={showSectionModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Basic Information"
                    value={newSection.name}
                    onChange={(e) => setNewSection((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Label <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Display label"
                    value={newSection.label}
                    onChange={(e) => setNewSection((prev) => ({ ...prev, label: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              {/* Display Order is auto-assigned; hidden from UI */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Edit By</Form.Label>
                  <Form.Select
                    value={newSection.editBy}
                    onChange={(e) => {
                      const editBy = e.target.value;
                      setNewSection((prev) => ({ 
                        ...prev, 
                        editBy,
                        // Clear roleInSubject if TRAINEE
                        roleInSubject: editBy === 'TRAINEE' ? '' : prev.roleInSubject
                      }));
                    }}
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {newSection.editBy === 'TRAINER' && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Role In Subject</Form.Label>
                    <Form.Select
                      value={newSection.roleInSubject || 'ASSESSMENT_REVIEWER'}
                      onChange={(e) => setNewSection((prev) => ({ ...prev, roleInSubject: e.target.value }))}
                    >
                      <option value="ASSESSMENT_REVIEWER">ASSESSMENT_REVIEWER</option>
                      <option value="EXAMINER">EXAMINER</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col md={12}>
                <Form.Group className="d-flex flex-row align-items-center gap-4">
                  <div className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      checked={newSection.isSubmittable}
                      onChange={(e) => setNewSection((prev) => ({ ...prev, isSubmittable: e.target.checked }))}
                      id="section-submittable"
                    />
                    <Form.Label htmlFor="section-submittable" className="mb-0 ms-2">Submittable</Form.Label>
                  </div>
                  <div className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      checked={newSection.isToggleDependent}
                      onChange={(e) => setNewSection((prev) => ({ ...prev, isToggleDependent: e.target.checked }))}
                      id="section-toggle-dependent"
                    />
                    <Form.Label htmlFor="section-toggle-dependent" className="mb-0 ms-2">Toggle Dependent</Form.Label>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSection}>
            Save Section
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Field Modal */}
      <Modal show={showFieldModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Alert variant="light" className="py-2">
                  Adding field to section: <strong>{editingSectionIndex !== null ? sections[editingSectionIndex]?.label : 'N/A'}</strong>
                </Alert>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Label <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Crew Communication"
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
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
                    placeholder="e.g., crew_communication"
                    value={newField.fieldName}
                    onChange={(e) => setNewField(prev => ({ ...prev, fieldName: e.target.value }))}
                    required
                  />
                  <Form.Text className="text-muted">
                    The variable name used in the docxtemplate (e.g., {`{crew_communication}`}). Must be unique within a template.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Field Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={newField.fieldType}
                    onChange={(e) => setNewField(prev => ({ ...prev, fieldType: e.target.value }))}
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
                  <Form.Control
                    type="text"
                    value={editingSectionIndex !== null ? (sections[editingSectionIndex]?.editBy || 'TRAINER') : 'TRAINER'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    required
                  />
                  <Form.Text className="text-muted">
                    Automatically set from section's "Edit By" value.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Parent Template ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Leave empty for root level"
                    value={newField.parentTempId || ''}
                    onChange={(e) => setNewField(prev => ({ ...prev, parentTempId: e.target.value || null }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveField}>
            Save Field
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Field Modal */}
      <Modal show={showEditModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Field</Modal.Title>
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
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    required
                  />
                  <Form.Text className="text-muted">
                    The question or label displayed to the user (e.g., "Crew Communication").
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Field Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={newField.fieldType}
                    onChange={(e) => setNewField(prev => ({ ...prev, fieldType: e.target.value }))}
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
                  <Form.Control
                    type="text"
                    value={editingSectionIndex !== null ? (sections[editingSectionIndex]?.editBy || 'TRAINER') : 'TRAINER'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    required
                  />
                  <Form.Text className="text-muted">
                    Automatically set from section's "Edit By" value.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Field Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={
                      newField.fieldType === 'PART' 
                        ? 'e.g., Assessment_Items' 
                        : newField.fieldType === 'TOGGLE'
                        ? 'e.g., isGroundCourse'
                        : 'e.g., crew_communication'
                    }
                    value={newField.fieldName}
                    onChange={(e) => setNewField(prev => ({ ...prev, fieldName: e.target.value }))}
                    required
                  />
                  <Form.Text className="text-muted">
                    {newField.fieldType === 'PART' 
                      ? 'The tag name should use underscores, should not start with the word "section" and the first letter always have to be capitalized. (e.g., Assessment_Items).'
                      : newField.fieldType === 'TOGGLE'
                      ? 'The tag name should use camelCase (e.g., isGroundCourse).'
                      : 'The variable name used in the docxtemplate (e.g., {crew_communication}). Must be unique within a template.'
                    }
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Parent Template ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Leave empty for root level"
                    value={newField.parentTempId || ''}
                    onChange={(e) => setNewField(prev => ({ ...prev, parentTempId: e.target.value || null }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveField}>
            Update Field
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Insert Part Sub Field Modal */}
      <Modal show={showPartFieldModal} onHide={() => setShowPartFieldModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Insert Part Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Alert variant="light" className="py-2">
                  Insert field into PART: <strong>{activePartField?.label} ({activePartField?.fieldName})</strong>
                </Alert>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Label <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Focus Item"
                    value={partSubFieldLabel}
                    onChange={(e) => setPartSubFieldLabel(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Field Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., focus_item"
                    value={partSubFieldName}
                    onChange={(e) => setPartSubFieldName(e.target.value)}
                  />
                  <Form.Text className="text-muted">snake_case only</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Type</Form.Label>
                  <Form.Select
                    value={partSubFieldType}
                    onChange={(e) => setPartSubFieldType(e.target.value)}
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="TOGGLE">TOGGLE</option>
                    <option value="IMAGE">IMAGE</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-primary-custom">Role Required</Form.Label>
                  <Form.Select
                    value={partSubFieldRoleRequired}
                    onChange={(e) => setPartSubFieldRoleRequired(e.target.value)}
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Text className="text-muted">Display order is assigned automatically by creation order.</Form.Text>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowPartFieldModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInsertPartField}>
            Insert
          </Button>
        </Modal.Footer>
      </Modal>

      </div>
    </>
  );
};

export default CustomFieldsPanel;
