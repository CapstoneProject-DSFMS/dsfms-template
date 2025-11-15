import React, { useState, useEffect } from 'react';
import { Button, Alert, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { Plus, X, ArrowDown, Pencil, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { roleAPI } from '../../../api/role';
import { readTemplateMetaFromStorage, buildTemplatePayload } from '../../../utils/templateBuilder';
import apiClient from '../../../api/config.js';
import { API_CONFIG } from '../../../config/api.js';
import { uploadAPI } from '../../../api/upload.js';

const CustomFieldsPanel = ({ 
  customFields = [], 
  onAddField,
  onRemoveField,
  onInsertField,
  // eslint-disable-next-line no-unused-vars
  exportEditedDoc, // Kept for backward compatibility but not used
  // eslint-disable-next-line no-unused-vars
  exportAndUploadEditedDoc, // Kept for backward compatibility but not used
  forceSaveAndPoll,
  getDocumentKey,
  addSystemFieldToSectionRef,
  initialSections = null, // ← NEW prop to restore sections from draft
  readOnly = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  
  // Restore sections from prop (when loading draft)
  useEffect(() => {
    if (initialSections && Array.isArray(initialSections) && initialSections.length > 0) {
      // Only restore if sections are empty (avoid overwriting when user is editing)
      if (sections.length === 0) {
        console.log('📥 Restoring sections from draft:', initialSections);
        setSections(initialSections);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSections]); // Only run when initialSections changes (sections.length check is intentional)
  const [collapsedSections, setCollapsedSections] = useState({});
  const [dragState, setDragState] = useState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' });
  const [sectionDragState, setSectionDragState] = useState({ fromIndex: null, overIndex: null, position: 'above' });

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
    parentTempId: null,
    option: null // For VALUE_LIST: JSON string like '{"items": ["Pass", "Fail"]}'
  });
  const [valueListOptions, setValueListOptions] = useState([]); // For VALUE_LIST: Array of option strings
  const [newOptionInput, setNewOptionInput] = useState(''); // Input for adding new option

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

  // Expose functions to parent component via ref
  useEffect(() => {
    if (addSystemFieldToSectionRef) {
      addSystemFieldToSectionRef.current = {
        getSections: () => sections,
        addSystemField: (sectionIndex, fieldData) => {
          if (sectionIndex === null || sectionIndex < 0 || sectionIndex >= sections.length) {
            toast.error('Invalid section index');
            return false; // Return false to indicate failure
          }

          const section = sections[sectionIndex];
          const sectionFields = section.fields || [];
          
          // Check if fieldName already exists
          if (sectionFields.some(f => f.fieldName === fieldData.fieldName)) {
            toast.warning(`Field "${fieldData.fieldName}" already exists in this section`);
            return false; // Return false to indicate failure
          }

          // Use section's editBy as roleRequired if not provided
          const fieldToAdd = {
            ...fieldData,
            roleRequired: fieldData.roleRequired || section.editBy || 'TRAINER'
          };

          const nextSections = [...sections];
          nextSections[sectionIndex] = {
            ...section,
            fields: [...sectionFields, fieldToAdd]
          };

          setSections(nextSections);

          // Notify parent component - use setTimeout to avoid "Cannot update component while rendering" warning
          if (onAddField) {
            const flattened = nextSections.flatMap((s) => s.fields || []);
            // Defer callback to avoid updating parent during render phase
            setTimeout(() => {
              onAddField(flattened);
            }, 0);
          }
          
          return true; // Return true to indicate success
        },
        // Expose function to build and submit draft template
        buildAndSubmitDraftTemplate: async (draftUrl) => {
          try {
            console.log('📤 Building and submitting draft template...');
            console.log('📄 Draft URL (OnlyOffice):', draftUrl);
            
            // Step 1: Upload from OnlyOffice URL to S3
            let s3Url = null;
            const meta = readTemplateMetaFromStorage(); // Read meta once at the beginning
            
            try {
              console.log('📤 Uploading from OnlyOffice URL to S3...');
              
              // Get fileName from template name
              const templateName = meta.name || 'template';
              const sanitizedFileName = templateName
                .replace(/[^a-zA-Z0-9]/g, '_')
                .toLowerCase()
                .substring(0, 50);
              const fileName = `${sanitizedFileName}_draft.docx`;
              
              console.log('📝 File name for upload:', fileName);
              
              // Upload from URL to S3
              s3Url = await uploadAPI.uploadFromUrl(draftUrl, fileName);
              
              if (s3Url) {
                console.log('✅ Upload from URL success! S3 URL:', s3Url);
              } else {
                console.warn('⚠️ No S3 URL received from upload-from-url');
                throw new Error('Failed to upload to S3');
              }
            } catch (uploadErr) {
              console.error('❌ Upload from URL failed:', uploadErr);
              toast.error('Could not upload draft document to S3');
              throw uploadErr;
            }
            
            // Step 2: Build template payload with status DRAFT
            const effectiveMeta = {
              ...meta,
              templateContent: meta.templateContent, // Original file import
              templateConfig: s3Url // S3 URL of edited document
            };
            
            const basePayload = buildTemplatePayload(effectiveMeta, sections);
            
            // Build payload with status DRAFT
            const payload = {
              name: basePayload.name,
              description: basePayload.description,
              departmentId: basePayload.departmentId,
              templateContent: basePayload.templateContent,
              templateConfig: basePayload.templateConfig || null,
              status: 'DRAFT', // Set status to DRAFT
              sections: basePayload.sections
            };
            
            console.log('🧩 Draft template payload built:');
            console.log('  📄 templateContent (file import):', payload.templateContent);
            console.log('  ✏️ templateConfig (file đã chỉnh sửa):', payload.templateConfig || 'null');
            console.log('  📊 Status:', payload.status);
            console.log('🧩 Full payload:\n', JSON.stringify(payload, null, 2));
            
            // Step 3: Check currentTemplateId and call appropriate API
            // IMPORTANT: Read currentTemplateId fresh from localStorage (not from meta which was read at start)
            const freshMeta = readTemplateMetaFromStorage();
            const currentTemplateId = freshMeta.currentTemplateId || localStorage.getItem('currentTemplateId');
            
            console.log('🔍 Checking currentTemplateId:');
            console.log('  📦 freshMeta.currentTemplateId:', freshMeta.currentTemplateId);
            console.log('  📦 localStorage.getItem("currentTemplateId"):', localStorage.getItem('currentTemplateId'));
            console.log('  ✅ Final currentTemplateId:', currentTemplateId);
            
            if (currentTemplateId) {
              // UPDATE existing draft
              console.log('📝 Updating existing draft:', currentTemplateId);
              const res = await apiClient.put(`/templates/update-draft/${currentTemplateId}`, {
                ...payload,
                id: currentTemplateId,
                status: 'DRAFT'
              });
              toast.success('Draft template updated successfully!');
              console.log('✅ Draft updated successfully:', res?.data ?? res);
              return res?.data ?? res;
            } else {
              // CREATE new draft
              console.log('➕ Creating new draft');
              const res = await apiClient.post('/templates', payload);
              
              // Save currentTemplateId from response
              // Log full response structure to debug
              console.log('🔍 Response structure check:');
              console.log('  📦 Full res?.data:', JSON.stringify(res?.data, null, 2));
              console.log('  📦 res?.data?.id:', res?.data?.id);
              console.log('  📦 res?.data?.data:', res?.data?.data);
              console.log('  📦 res?.data?.data?.id:', res?.data?.data?.id);
              console.log('  📦 res?.data?.data?.templateForm?.id:', res?.data?.data?.templateForm?.id);
              console.log('  📦 res?.data?.data?.template?.id:', res?.data?.data?.template?.id);
              console.log('  📦 res?.data?.template?.id:', res?.data?.template?.id);
              
              // Try multiple possible response structures
              const newTemplateId = res?.data?.id || 
                                   res?.data?.data?.id || 
                                   res?.data?.data?.templateForm?.id ||
                                   res?.data?.data?.template?.id ||
                                   res?.data?.template?.id ||
                                   (res?.data?.data?.template ? res.data.data.template.id : null);
              
              console.log('  ✅ Extracted newTemplateId:', newTemplateId);
              
              if (newTemplateId) {
                // Read fresh meta to preserve all existing fields
                const freshMetaForUpdate = readTemplateMetaFromStorage();
                const updatedMeta = {
                  ...freshMetaForUpdate,
                  currentTemplateId: newTemplateId
                };
                localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
                localStorage.setItem('currentTemplateId', newTemplateId);
                console.log('💾 Saved currentTemplateId:', newTemplateId);
                console.log('💾 Updated templateInfo:', updatedMeta);
              } else {
                console.warn('⚠️ No template ID found in response! Response structure:', res?.data);
              }
              
              toast.success('Draft template saved successfully!');
              console.log('✅ Draft created successfully:', res?.data ?? res);
              return res?.data ?? res;
            }
          } catch (error) {
            console.error('❌ Error building/submitting draft template:', error);
            // Extract error message from backend response
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error(errorMessage);
            throw error;
          }
        }
      };
    }

    // Cleanup
    return () => {
      if (addSystemFieldToSectionRef) {
        addSystemFieldToSectionRef.current = null;
      }
    };
  }, [sections, addSystemFieldToSectionRef, onAddField]);

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
      // notify parent (flattened) if needed - use setTimeout to avoid render phase update
      if (onAddField) {
        const flattened = next.flatMap((s) => s.fields || []);
        setTimeout(() => {
          onAddField(flattened, { silent: true });
        }, 0);
      }
      return next;
    });
  };

  const reorderSections = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    setSections((prev) => {
      // Directly reorder array without sorting (sections are already in correct order)
      const reordered = [...prev];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      // Only reorder array, DO NOT update displayOrder (will be calculated on submit)
      return reordered;
    });
  };

  const removeSection = (sectionIndex) => {
    if (readOnly) return;
    
    const section = sections[sectionIndex];
    if (!section) return;
    
    // Remove section from sections array
    setSections((prev) => prev.filter((_, idx) => idx !== sectionIndex));
    
    // Update flattened fields for parent component if needed
    if (onAddField) {
      const updatedSections = sections.filter((_, idx) => idx !== sectionIndex);
      const flattened = updatedSections.flatMap((s) => s.fields || []);
      setTimeout(() => {
        onAddField(flattened, { silent: true });
      }, 0);
    }
  };

  const handleSaveSection = () => {
    if (!newSection.label) {
      toast.warning('Please fill in section label');
      return;
    }
    // If editBy is TRAINEE, set roleInSubject to null; if TRAINER, keep the value
    const sectionToAdd = {
      ...newSection,
      name: newSection.label, // Use label as name
      roleInSubject: newSection.editBy === 'TRAINEE' ? null : (newSection.roleInSubject || null),
      fields: [...(newSection.fields || [])]
    };
    
    // If isToggleDependent is true, automatically create a SECTION_CONTROL_TOGGLE field
    if (sectionToAdd.isToggleDependent) {
      const toggleFieldName = `${sectionToAdd.name.toLowerCase().replace(/\s+/g, '_')}_toggle`;
      const toggleField = {
        label: `${sectionToAdd.label} Toggle`,
        fieldName: toggleFieldName,
        fieldType: 'SECTION_CONTROL_TOGGLE',
        roleRequired: sectionToAdd.editBy || 'TRAINER',
        parentTempId: null
      };
      sectionToAdd.fields = [toggleField];
    }
    
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
      parentTempId: null,
      option: null
    });
    setValueListOptions([]); // Reset options array
    setNewOptionInput(''); // Reset input
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

    // Prepare field to save with option if VALUE_LIST
    let fieldToSave = { ...newField };
    
    // Validate VALUE_LIST option if fieldType is VALUE_LIST
    if (newField.fieldType === 'VALUE_LIST') {
      if (!valueListOptions || valueListOptions.length === 0) {
        toast.warning('Please add at least one option for VALUE_LIST field');
        return;
      }
      // Convert array to JSON string and set directly on fieldToSave (not async state)
      const optionJson = JSON.stringify({ items: valueListOptions });
      fieldToSave.option = optionJson;
      // Also update state for consistency
      setNewField(prev => ({ ...prev, option: optionJson }));
    }

    // Validate fieldName format based on fieldType
    const validation = validateFieldName(fieldToSave.fieldName, fieldToSave.fieldType);
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
    
    if (existingFields.some(field => field.fieldName === fieldToSave.fieldName)) {
      toast.warning('Field name must be unique');
      return;
    }

    const nextSections = [...sections];
    if (editingFieldIndex !== null) {
      // Update existing field in the selected section
      nextSections[editingSectionIndex].fields = [
        ...sectionFields.slice(0, editingFieldIndex),
        fieldToSave,
        ...sectionFields.slice(editingFieldIndex + 1)
      ];
    } else {
      // Add new field in the selected section (no displayOrder; computed on submit)
      nextSections[editingSectionIndex].fields = [...sectionFields, fieldToSave];
    }

    setSections(nextSections);
    // Keep external callback compatible if provided - use setTimeout to avoid render phase update
    if (onAddField) {
      // Flatten all fields to maintain backward compatibility for parent state
      const flattened = nextSections.flatMap((s) => s.fields || []);
      setTimeout(() => {
      onAddField(flattened);
      }, 0);
    }
    
    setShowFieldModal(false);
    setShowEditModal(false);
    setEditingSectionIndex(null);
    setEditingFieldIndex(null);
    setValueListOptions([]); // Reset options
    setNewOptionInput(''); // Reset input
  };

  const handleEditField = (sectionIndex, fieldIndex) => {
    const field = sections[sectionIndex]?.fields?.[fieldIndex];
    if (!field) return;
    setNewField({ ...field });
    
    // Load options from JSON if VALUE_LIST
    if (field.fieldType === 'VALUE_LIST' && field.option) {
      try {
        const parsed = JSON.parse(field.option);
        if (parsed.items && Array.isArray(parsed.items)) {
          setValueListOptions(parsed.items);
        } else {
          setValueListOptions([]);
        }
      } catch {
        setValueListOptions([]);
      }
    } else {
      setValueListOptions([]);
    }
    setNewOptionInput('');
    
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
    setValueListOptions([]); // Reset options
    setNewOptionInput(''); // Reset input
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitTemplate = async () => {
    try {
      setIsSubmitting(true);
      const meta = readTemplateMetaFromStorage();
      
      // Get documentKey for logging
      const documentKey = getDocumentKey ? getDocumentKey() : null;
      console.log('🔑 DocumentKey:', documentKey);
      
      // Step: ForceSave → Backend Callback → Polling → Get S3 URL for templateConfig
      let templateConfigUrl = null;
      const originalTemplateContent = meta.templateContent;
      
      if (forceSaveAndPoll) {
        try {
          console.log('📤 Triggering callback flow...');
          const onlyOfficeUrl = await forceSaveAndPoll();
          
          if (onlyOfficeUrl) {
            console.log('✅ Callback flow success! OnlyOffice URL:', onlyOfficeUrl);
            
            // Step: Upload from OnlyOffice URL to S3
            try {
              console.log('📤 Uploading from OnlyOffice URL to S3...');
              
              // Get fileName from template name (sanitize for filename)
              const templateName = meta.name || 'template';
              const sanitizedFileName = templateName
                .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
                .toLowerCase()
                .substring(0, 50); // Limit length
              const fileName = `${sanitizedFileName}.docx`;
              
              console.log('📝 File name for upload:', fileName);
              
              // Upload from URL to S3
              templateConfigUrl = await uploadAPI.uploadFromUrl(onlyOfficeUrl, fileName);
              
              if (templateConfigUrl) {
                console.log('✅ Upload from URL success! S3 URL:', templateConfigUrl);
              } else {
                console.warn('⚠️ No S3 URL received from upload-from-url');
                templateConfigUrl = null;
              }
            } catch (uploadErr) {
              console.error('❌ Upload from URL failed:', uploadErr);
              toast.warning('Could not upload document to S3');
              templateConfigUrl = null;
            }
          } else {
            console.warn('⚠️ No OnlyOffice URL received');
            templateConfigUrl = null;
          }
        } catch (err) {
          console.error('❌ Callback flow failed:', err);
          toast.warning('Could not get edited document from backend');
          templateConfigUrl = null;
        }
      } else {
        console.warn('⚠️ forceSaveAndPoll function not available');
        templateConfigUrl = null;
      }
      
      console.log('📤 Submitting template to backend...');
      
      // Validate FINAL_SCORE_TEXT and FINAL_SCORE_NUM (must have exactly 1 of each)
      const allFields = sections.flatMap(s => s.fields || []);
      const finalScoreTextFields = allFields.filter(f => f.fieldType === 'FINAL_SCORE_TEXT');
      const finalScoreNumFields = allFields.filter(f => f.fieldType === 'FINAL_SCORE_NUM');
      
      if (finalScoreTextFields.length !== 1) {
        toast.error(`Template must have exactly 1 FINAL_SCORE_TEXT field. Found: ${finalScoreTextFields.length}`);
        setIsSubmitting(false);
        return;
      }
      
      if (finalScoreNumFields.length !== 1) {
        toast.error(`Template must have exactly 1 FINAL_SCORE_NUM field. Found: ${finalScoreNumFields.length}`);
        setIsSubmitting(false);
        return;
      }

      // Validate FINAL_SCORE_TEST fields
      const finalScoreTestFields = allFields.filter(f => f.fieldType === 'FINAL_SCORE_TEST');
      const hasFinalScoreNum = finalScoreNumFields.length > 0;
      const hasFinalScoreText = finalScoreTextFields.length > 0;
      const hasBoth = hasFinalScoreNum && hasFinalScoreText;

      for (const testField of finalScoreTestFields) {
        // If both FINAL_SCORE_NUM and FINAL_SCORE_TEXT exist, options are not required
        if (hasBoth) {
          // Options not required - skip validation
          continue;
        }

        // If only FINAL_SCORE_TEXT exists (no FINAL_SCORE_NUM), options are required
        if (hasFinalScoreText && !hasFinalScoreNum) {
          if (!testField.option || !testField.option.trim()) {
            toast.error(`FINAL_SCORE_TEST field "${testField.label || testField.fieldName || testField.name}" requires options when only FINAL_SCORE_TEXT exists. Please provide options in JSON format: {"items": ["value1", "value2", ...]}`);
            setIsSubmitting(false);
            return;
          }

          // Validate options format
          try {
            const parsed = JSON.parse(testField.option);
            if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
              toast.error(`FINAL_SCORE_TEST field "${testField.label || testField.fieldName || testField.name}" options must be a JSON object with a non-empty "items" array. Example: {"items": ["value1", "value2"]}`);
              setIsSubmitting(false);
              return;
            }
          } catch {
            toast.error(`FINAL_SCORE_TEST field "${testField.label || testField.fieldName || testField.name}" has invalid JSON format for options. Example: {"items": ["value1", "value2"]}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Build payload:
      // - templateContent: URL file import ban đầu
      // - templateConfig: URL file đã chỉnh sửa (nếu callback thành công)
      const effectiveMeta = { 
        ...meta, 
        templateContent: originalTemplateContent, // Giữ nguyên file import
        templateConfig: templateConfigUrl // URL file đã chỉnh sửa từ backend
      };
      
      const basePayload = buildTemplatePayload(effectiveMeta, sections);
      
      // Build payload with status right after templateConfig
      const payload = {
        name: basePayload.name,
        description: basePayload.description,
        departmentId: basePayload.departmentId,
        templateContent: basePayload.templateContent,
        templateConfig: basePayload.templateConfig || null,
        status: 'PENDING', // Override status to PENDING when submitting
        sections: basePayload.sections
      };
      
      console.log('🧩 Template payload built:');
      console.log('  📄 templateContent (file import):', payload.templateContent);
      console.log('  ✏️ templateConfig (file đã chỉnh sửa):', payload.templateConfig || 'null');
      console.log('  📊 Status:', payload.status);
      console.log('  🔑 documentKey:', documentKey);
      console.log('🧩 Full payload:\n', JSON.stringify(payload, null, 2));
      
      // Check currentTemplateId and call appropriate API
      const currentTemplateId = meta.currentTemplateId || localStorage.getItem('currentTemplateId');
      
      if (currentTemplateId) {
        // UPDATE existing draft to PENDING (submit)
        console.log('📝 Updating existing draft to PENDING:', currentTemplateId);
        const res = await apiClient.put(`/templates/update-draft/${currentTemplateId}`, {
          ...payload,
          id: currentTemplateId,
          status: 'PENDING'
        });
        toast.success('Template submitted successfully');
        console.log('✅ Template updated and submitted:', res?.data ?? res);
        
        // Clear currentTemplateId after successful submit
        const updatedMeta = {
          ...meta,
          currentTemplateId: null
        };
        localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
        localStorage.removeItem('currentTemplateId');
        console.log('🗑️ Cleared currentTemplateId after submit');
      } else {
        // CREATE new template
        console.log('➕ Creating new template');
      const res = await apiClient.post('/templates', payload);
      toast.success('Template submitted successfully');
      console.log('✅ Backend response:', res?.data ?? res);
      }

      // Navigate back to forms list after successful submit
      setTimeout(() => {
        navigate('/admin/forms');
      }, 1500);
    } catch (err) {
      console.error('❌ Submit template failed:', err);
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      toast.error(errorMessage);
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
      case 'IMAGE':
      case 'SIGNATURE_DRAW':
      case 'SIGNATURE_IMAGE':
      case 'FINAL_SCORE_TEXT':
      case 'FINAL_SCORE_NUM':
      case 'VALUE_LIST':
      case 'TEXT':
      default:
        // text : {field_name} (IMAGE is also treated as TEXT - URL link)
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
      setTimeout(() => {
      onAddField(flattened);
      }, 0);
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
          .section-card { transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
          .section-card.section-dragging { cursor: grabbing; box-shadow: 0 8px 18px rgba(0,0,0,.15); transform: scale(.98); opacity: 0.7; }
          .section-card.section-drop-target-above { border-top: 4px solid var(--bs-primary) !important; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
          .section-card.section-drop-target-below { border-bottom: 4px solid var(--bs-primary) !important; border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
        `}
      </style>
      <div className={`p-2 p-md-3 bg-light custom-fields-panel ${className}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="d-flex justify-content-between align-items-center mb-2 mb-md-3 flex-wrap gap-2 flex-shrink-0">
        <h6 className="mb-0 text-muted custom-fields-title" style={{ fontSize: '0.95rem' }}>Available Custom Fields</h6>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleAddSection}
          disabled={readOnly}
          className="custom-fields-add-section-btn"
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Plus className="me-1" size={14} />
          <span className="d-none d-sm-inline">Add Section</span>
          <span className="d-inline d-sm-none">Section</span>
        </Button>
      </div>
      
      <div className="flex-grow-1 custom-fields-content" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: '0', flex: '1 1 auto' }}>
        <div className="d-grid gap-2 custom-fields-grid">
          {sections.length > 0 ? (
            sections
              .map((section, sIdx) => (
                <Card 
                  key={sIdx} 
                  className={`border section-card ${sectionDragState.fromIndex === sIdx ? 'section-dragging' : ''} ${sectionDragState.overIndex === sIdx ? (sectionDragState.position === 'above' ? 'section-drop-target-above' : 'section-drop-target-below') : ''}`}
                  draggable={!readOnly}
                  onDragStart={(e) => {
                    if (readOnly) {
                      e.preventDefault();
                      return;
                    }
                    setSectionDragState({ fromIndex: sIdx, overIndex: sIdx, position: 'above' });
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (readOnly || sectionDragState.fromIndex === null) return;
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mid = rect.top + rect.height / 2;
                    const position = e.clientY < mid ? 'above' : 'below';
                    let targetIndex = sIdx;
                    if (position === 'below' && sectionDragState.fromIndex < sIdx) {
                      targetIndex = sIdx + 1;
                    } else if (position === 'above' && sectionDragState.fromIndex > sIdx) {
                      targetIndex = sIdx;
                    } else if (position === 'below' && sectionDragState.fromIndex > sIdx) {
                      targetIndex = sIdx + 1;
                    } else if (position === 'above' && sectionDragState.fromIndex < sIdx) {
                      targetIndex = sIdx;
                    }
                    if (sectionDragState.overIndex !== targetIndex || sectionDragState.position !== position) {
                      setSectionDragState((prev) => ({ ...prev, overIndex: targetIndex, position }));
                    }
                  }}
                  onDrop={(e) => {
                    if (readOnly || sectionDragState.fromIndex === null) return;
                    e.preventDefault();
                    const toIndex = Math.max(0, Math.min(sectionDragState.overIndex, sections.length));
                    reorderSections(sectionDragState.fromIndex, toIndex);
                    setSectionDragState({ fromIndex: null, overIndex: null, position: 'above' });
                  }}
                  onDragEnd={() => {
                    setSectionDragState({ fromIndex: null, overIndex: null, position: 'above' });
                  }}
                  style={{ cursor: readOnly ? 'default' : 'grab' }}
                >
                  <Card.Header 
                    className="d-flex justify-content-between align-items-center section-header"
                    onClick={() => toggleSection(sIdx)}
                    aria-expanded={!collapsedSections[sIdx]}
                    onDragStart={(e) => e.stopPropagation()}
                    style={{ padding: '0.75rem' }}
                  >
                    <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0, marginRight: '0.5rem' }}>
                      <div className="section-title fw-bold d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                        {collapsedSections[sIdx] ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}
                        <span className="text-truncate ms-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={section.label}>
                          {section.label}
                        </span>
                        <span className="badge rounded-pill ms-1 field-count-badge flex-shrink-0">
                          {section.fields?.length || 0}
                        </span>
                    </div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>Edit by: {section.editBy}</small>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleAddField(sIdx)}
                        disabled={readOnly}
                        className="custom-fields-add-field-btn"
                        style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Plus className="me-1" size={12} />
                        <span className="d-none d-sm-inline">Add Field</span>
                        <span className="d-inline d-sm-none">Field</span>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeSection(sIdx)}
                        disabled={readOnly}
                        title="Remove Section"
                        className="text-danger border-danger"
                        style={{ padding: '0.25rem 0.4rem' }}
                      >
                        <X size={12} />
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
                            className={`p-2 p-md-2 rounded border mb-2 mb-md-2 draggable-item custom-field-item ${isPart ? 'bg-part part-card' : 'bg-white child-row'} ${dragState.sectionIndex===sIdx && dragState.overIndex===realIndex ? 'border-primary' : ''} ${dragState.sectionIndex===sIdx && dragState.overIndex===realIndex && dragState.position==='above' ? 'drop-target-above' : ''} ${dragState.sectionIndex===sIdx && dragState.overIndex===realIndex && dragState.position==='below' ? 'drop-target-below' : ''} ${dragState.sectionIndex===sIdx && dragState.fromIndex===realIndex ? 'dragging' : ''}`}
                            draggable
                            style={{ display: 'block', visibility: 'visible', opacity: 1, cursor: 'grab' }}
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
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <div className="fw-bold field-title d-flex align-items-center flex-wrap gap-1" style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
                                  <span className="text-truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }} title={field.label}>
                                    {field.label}
                                  </span>
                                  {isPart && (<span className="badge part-badge flex-shrink-0">PART</span>)}
                                </div>
                                <small className="text-muted d-block" style={{ fontSize: '0.7rem', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${field.fieldName} (${field.fieldType})${field.roleRequired ? ` - ${field.roleRequired}` : ''}`}>
                                  {field.fieldName} ({field.fieldType}){field.roleRequired ? ` - ${field.roleRequired}` : ''}
                                </small>
                              </div>
                              <div className="d-flex gap-1 flex-shrink-0">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEditField(sIdx, realIndex)}
                                  disabled={readOnly}
                                  title="Edit Field"
                                  className="text-primary border-primary"
                                  style={{ padding: '0.25rem 0.4rem' }}
                                >
                                  <Pencil size={12} />
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
                                  style={{ padding: '0.25rem 0.4rem' }}
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            </div>
                            <div className="d-grid gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onInsertField(buildTemplateForField(field))}
                                disabled={readOnly}
                                className="d-flex align-items-center justify-content-center text-primary border-primary insert-field-btn"
                                style={{ transition: 'all 0.2s ease-in-out', fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                              >
                                <ArrowDown className="me-1" size={12} />
                                <span className="d-none d-sm-inline">Insert Field</span>
                                <span className="d-inline d-sm-none">Insert</span>
                              </Button>
                              {String(field.fieldType).toUpperCase() === 'PART' && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="mt-0 text-primary border-primary"
                                  onClick={() => openInsertPartField(sIdx, realIndex, field)}
                                  disabled={readOnly}
                                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                                >
                                  <ArrowDown className="me-1" size={12} />
                                  <span className="d-none d-sm-inline">Add Field to PART</span>
                                  <span className="d-inline d-sm-none">Add to PART</span>
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
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-2 mt-md-3 gap-2 flex-shrink-0" style={{ borderTop: '1px solid #dee2e6', paddingTop: '0.75rem' }}>
        <Alert variant="info" className="mb-0 custom-fields-tip" style={{ fontSize: '0.75rem', padding: '0.5rem', flex: '1 1 auto', marginRight: '0.5rem' }}>
          <strong>Tip:</strong> <span className="d-none d-sm-inline">Create sections first, then add fields inside each section.</span>
          <span className="d-inline d-sm-none">Create sections, then add fields.</span>
        </Alert>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleSubmitTemplate} 
          disabled={isSubmitting}
          className="custom-fields-submit-btn flex-shrink-0"
          style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
        >
          {isSubmitting ? 'Submitting...' : <><span className="d-none d-sm-inline">Submit Template</span><span className="d-inline d-sm-none">Submit</span></>}
        </Button>
      </div>

      {/* Add Section Modal */}
      <Modal show={showSectionModal} onHide={handleCloseModals} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
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
                      style={{ minWidth: '200px' }}
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
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                    onChange={(e) => {
                      const newType = e.target.value;
                      setNewField(prev => ({ 
                        ...prev, 
                        fieldType: newType,
                        option: newType === 'VALUE_LIST' ? prev.option : null // Clear option if not VALUE_LIST
                      }));
                      // Reset options array when changing field type
                      if (newType !== 'VALUE_LIST') {
                        setValueListOptions([]);
                        setNewOptionInput('');
                      }
                    }}
                    required
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="PART">PART</option>
                    <option value="TOGGLE">TOGGLE</option>
                    <option value="SECTION_CONTROL_TOGGLE">SECTION_CONTROL_TOGGLE</option>
                    <option value="SIGNATURE_DRAW">SIGNATURE_DRAW</option>
                    <option value="SIGNATURE_IMAGE">SIGNATURE_IMAGE</option>
                    <option value="FINAL_SCORE_TEXT">FINAL_SCORE_TEXT</option>
                    <option value="FINAL_SCORE_NUM">FINAL_SCORE_NUM</option>
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
              {/* VALUE_LIST Options Field */}
              {newField.fieldType === 'VALUE_LIST' && (
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
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                    onChange={(e) => {
                      const newType = e.target.value;
                      setNewField(prev => ({ 
                        ...prev, 
                        fieldType: newType,
                        option: newType === 'VALUE_LIST' ? prev.option : null // Clear option if not VALUE_LIST
                      }));
                      // Reset options array when changing field type
                      if (newType !== 'VALUE_LIST') {
                        setValueListOptions([]);
                        setNewOptionInput('');
                      }
                    }}
                    required
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="PART">PART</option>
                    <option value="TOGGLE">TOGGLE</option>
                    <option value="SECTION_CONTROL_TOGGLE">SECTION_CONTROL_TOGGLE</option>
                    <option value="SIGNATURE_DRAW">SIGNATURE_DRAW</option>
                    <option value="SIGNATURE_IMAGE">SIGNATURE_IMAGE</option>
                    <option value="FINAL_SCORE_TEXT">FINAL_SCORE_TEXT</option>
                    <option value="FINAL_SCORE_NUM">FINAL_SCORE_NUM</option>
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
              {/* VALUE_LIST Options Field */}
              {newField.fieldType === 'VALUE_LIST' && (
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
