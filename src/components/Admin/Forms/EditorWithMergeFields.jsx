import React, { useEffect, useState, useRef } from 'react';
import { Button, Alert, Card, Modal, Form, Row, Col } from 'react-bootstrap';
import { Pencil, ChevronDown, ChevronRight, ArrowDown, X } from 'react-bootstrap-icons';
import apiClient from '../../../api/config.js';
import { roleAPI } from '../../../api/role';
import { toast } from 'react-toastify';

const EditorWithMergeFields = ({ onInsertField, exportEditedDoc, initialUrl, readOnly = false, className = '' }) => {
  const [mergeFields, setMergeFields] = useState([]);
  const [sections, setSections] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
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
  const lastExtractedUrlRef = useRef(null);
  const isReorderRef = useRef(false);
  const [dragState, setDragState] = useState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' });
  const [sectionDragState, setSectionDragState] = useState({ fromIndex: null, overIndex: null, position: 'above' });
  
  // Toggle section collapse/expand
  const toggleSection = (index) => {
    setCollapsedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };
  
  // Reorder fields within section
  const reorderWithinSection = (sectionIndex, fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    setSections((prev) => {
      const next = [...prev];
      const fields = [...(next[sectionIndex]?.fields || [])];
      
      // Handle PART with children: when moving PART, we need to move all children together
      const fieldToMove = fields[fromIndex];
      const isPartField = isPart(fieldToMove);
      
      if (isPartField) {
        // Get PART and all its children
        const parentId = getParentId(fieldToMove);
        const childrenIndices = [];
        const children = [];
        
        fields.forEach((f, idx) => {
          if (idx === fromIndex) {
            // Skip PART itself
          } else if (f.parentTempId === parentId) {
            childrenIndices.push(idx);
            children.push(f);
          }
        });
        
        // Remove PART and all children (in reverse order to maintain indices)
        const indicesToRemove = [fromIndex, ...childrenIndices].sort((a, b) => b - a);
        indicesToRemove.forEach(idx => fields.splice(idx, 1));
        
        // Calculate new toIndex after removals
        let adjustedToIndex = toIndex;
        indicesToRemove.forEach(idx => {
          if (idx < toIndex) adjustedToIndex--;
        });
        
        // Insert PART and children at new position
        fields.splice(adjustedToIndex, 0, fieldToMove, ...children);
      } else {
        // Regular field
        const [moved] = fields.splice(fromIndex, 1);
        let adjustedToIndex = toIndex;
        if (fromIndex < toIndex) adjustedToIndex--;
        fields.splice(adjustedToIndex, 0, moved);
      }
      
      next[sectionIndex] = { ...next[sectionIndex], fields };
      return next;
    });
  };

  // Helper to get parent ID
  const getParentId = (field) => field.tempId || field.name;
  
  // Helper to check if field is PART
  const isPart = (f) => String(f.fieldType).toUpperCase() === 'PART';

  // Drag and drop handlers
  const onDragStart = (e, field) => {
    // If dragging a PART field, include all its children
    if (isPart(field)) {
      const parentId = getParentId(field);
      const children = mergeFields.filter((f) => f.parentTempId === parentId);
      // Store PART field with its children as an array
      const fieldsToMove = [field, ...children];
      e.dataTransfer.setData('text/plain', JSON.stringify(fieldsToMove));
    } else {
      // Regular field, just store the single field
      e.dataTransfer.setData('text/plain', JSON.stringify(field));
    }
  };

  const onDropToSection = (e, sectionIndex) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // Check if data is an array (PART with children) or single field
      const isPartWithChildren = Array.isArray(data);
      let fieldsToAdd = isPartWithChildren ? data : [data];
      
      // Note: We keep parentTempId as-is from source data
      // - If field has parentTempId, it's already a child of PART (will be dragged with PART)
      // - If field has null parentTempId, it's an independent field (no reset needed)
      
      // Check if this is a reorder operation (field already exists in section)
      // We need to check this before setSections to determine if we should remove from mergeFields
      // Reset ref
      isReorderRef.current = false;
      setSections((prev) => {
        const next = [...prev];
        const existingFields = next[sectionIndex]?.fields || [];
        
        // Check if this is a reorder operation (field already exists in section)
        // CRITICAL: Only consider it a reorder if we're dragging PART fields that already exist
        // OR if we're dragging fields that are exact same instances (same name AND same parentTempId/tempId)
        const draggedPartFields = fieldsToAdd.filter(isPart);
        const checkReorder = draggedPartFields.some(partField => {
          // Check if this exact PART field (by name) already exists in section
          return existingFields.some(existing => 
            isPart(existing) && existing.name === partField.name
          );
        });
        
        // Store in ref for use outside callback
        isReorderRef.current = checkReorder;
        
        if (checkReorder) {
          // Reorder: remove ONLY the dragged PART fields and their children
          // CRITICAL: Don't remove fields that have same name but different parentTempId (they belong to different PART fields)
          const partFieldNamesToRemove = new Set(draggedPartFields.map(f => f.name));
          const partTempIdsToRemove = new Set();
          
          // Get tempIds of PART fields being dragged
          draggedPartFields.forEach(partField => {
            const partId = getParentId(partField);
            partTempIdsToRemove.add(partId);
          });
          
          // Remove only:
          // 1. The PART fields themselves (by name match)
          // 2. Their children (by parentTempId match with PART's tempId)
          const filteredFields = existingFields.filter(f => {
            // Don't remove if it's a dragged PART field (by name)
            if (isPart(f) && partFieldNamesToRemove.has(f.name)) {
              return false;
            }
            // Don't remove if it's a child of a dragged PART field (by parentTempId)
            if (f.parentTempId && partTempIdsToRemove.has(f.parentTempId)) {
              return false;
            }
            // Keep all other fields (including children of other PART fields)
            return true;
          });
          
          // Insert at the end (maintains drag order)
          next[sectionIndex] = { 
            ...next[sectionIndex], 
            fields: [...filteredFields, ...fieldsToAdd] 
          };
        } else {
          // Add new fields from fields list
          // Check if any field to add has parentTempId pointing to a PART that already exists in section
          // Prevent dropping child fields into existing PART fields
          for (const field of fieldsToAdd) {
            if (field.parentTempId) {
              // Check if parent PART already exists in section (before this drop)
              const parentExistsInSection = existingFields.some((f) => {
                const fId = getParentId(f);
                return isPart(f) && fId === field.parentTempId;
              });
              
              // If parent PART already exists, this means trying to drag a child into an existing PART
              // Prevent this action
              if (parentExistsInSection) {
                toast.warning(`Cannot add field "${field.name}": Fields cannot be dragged into existing PART fields.`);
                return next; // Return unchanged state
              }
            }
          }
          
          // CRITICAL: Filter duplicates based on unique identifier
          // For PART fields: use name only (they are unique by name)
          // For child fields: use name + parentTempId (same name can belong to different PART fields)
          // For top-level non-PART fields: use name only
          const getFieldIdentifier = (f) => {
            if (isPart(f)) {
              return f.name; // PART fields are unique by name
            }
            if (f.parentTempId) {
              return `${f.name}:${f.parentTempId}`; // Children are unique by name + parentTempId
            }
            return f.name; // Top-level fields are unique by name
          };
          
          const existingIdentifiers = new Set(existingFields.map(getFieldIdentifier));
          
          // CRITICAL: Track PART field tempId mapping (old -> new) to update children's parentTempId
          const partTempIdMapping = new Map(); // old tempId/name -> new tempId
          
          // Create new field objects to ensure React treats them as new components
          // IMPORTANT: For PART fields being added to a section, ensure:
          // 1. parentTempId is null (they are always top-level in section)
          // 2. tempId is set if not already present (use name-based tempId)
          // 3. Children's parentTempId must match the PART's new tempId
          const newFields = fieldsToAdd
            .filter((f) => {
              // For PART fields, check if PART with same name already exists
              if (isPart(f)) {
                const partExists = existingFields.some(ex => isPart(ex) && ex.name === f.name);
                return !partExists;
              }
              // For other fields, use identifier-based check
              const identifier = getFieldIdentifier(f);
              return !existingIdentifiers.has(identifier);
            })
            .map(f => {
              const newField = { ...f };
              // If this is a PART field being added to section
              if (isPart(newField)) {
                console.log(`🔵 Adding PART field to section: ${newField.name}`, {
                  before: { parentTempId: newField.parentTempId, tempId: newField.tempId },
                  existingFields: existingFields.map(ex => ({ 
                    name: ex.name, 
                    fieldType: ex.fieldType, 
                    tempId: ex.tempId,
                    parentTempId: ex.parentTempId 
                  }))
                });
                
                // Always ensure it's top-level (no parent)
                const oldParentTempId = newField.parentTempId;
                newField.parentTempId = null;
                
                // Get old identifier (tempId or name) before normalization
                const oldId = newField.tempId || newField.name;
                
                // Ensure it has a tempId for proper child matching
                // Format: {name}-parent (e.g., "Apk-parent")
                const oldTempId = newField.tempId;
                if (!newField.tempId) {
                  newField.tempId = `${newField.name}-parent`;
                }
                
                // Store mapping: oldId -> new tempId (for updating children)
                partTempIdMapping.set(oldId, newField.tempId);
                
                console.log(`✅ PART field normalized: ${newField.name}`, {
                  before: { parentTempId: oldParentTempId, tempId: oldTempId },
                  after: { parentTempId: newField.parentTempId, tempId: newField.tempId },
                  oldId: oldId,
                  mapping: `${oldId} -> ${newField.tempId}`
                });
              }
              return newField;
            });
          
          // CRITICAL: Update children's parentTempId to match the PART's new tempId
          // This ensures children match correctly after PART field normalization
          console.log(`🔍 PartTempIdMapping:`, Array.from(partTempIdMapping.entries()));
          console.log(`🔍 NewFields before update:`, newFields.map(f => ({
            name: f.name,
            fieldType: f.fieldType,
            parentTempId: f.parentTempId,
            isPart: isPart(f)
          })));
          
          newFields.forEach((field) => {
            // If this field is a child (has parentTempId) and is not a PART field
            if (field.parentTempId && !isPart(field)) {
              // Check if parentTempId matches an old PART identifier
              // Try multiple matching strategies:
              // 1. Direct match with partTempIdMapping keys
              // 2. Match by finding the PART field in newFields that this child should belong to
              let newParentTempId = null;
              
              if (partTempIdMapping.has(field.parentTempId)) {
                newParentTempId = partTempIdMapping.get(field.parentTempId);
                console.log(`🔄 Updating child ${field.name}: parentTempId ${field.parentTempId} -> ${newParentTempId}`);
                field.parentTempId = newParentTempId;
              } else {
                // Fallback: Find PART field in newFields that might be the parent
                // Check if there's a PART field with tempId or name matching the parentTempId
                const parentPart = newFields.find(f => 
                  isPart(f) && (f.tempId === field.parentTempId || f.name === field.parentTempId)
                );
                if (parentPart && parentPart.tempId) {
                  newParentTempId = parentPart.tempId;
                  console.log(`🔄 Updating child ${field.name} (fallback): parentTempId ${field.parentTempId} -> ${newParentTempId}`);
                  field.parentTempId = newParentTempId;
                } else {
                  console.warn(`⚠️ Could not find parent for child ${field.name} with parentTempId: ${field.parentTempId}`, {
                    partTempIdMapping: Array.from(partTempIdMapping.entries()),
                    availableParts: newFields.filter(isPart).map(f => ({ name: f.name, tempId: f.tempId }))
                  });
                }
              }
            }
          });
          
          console.log(`🔍 NewFields after update:`, newFields.map(f => ({
            name: f.name,
            fieldType: f.fieldType,
            parentTempId: f.parentTempId,
            isPart: isPart(f)
          })));
          
          next[sectionIndex] = { 
            ...next[sectionIndex], 
            fields: [...existingFields, ...newFields] 
          };
        }
        
        return next;
      });
      
      // Remove dragged fields from mergeFields list (only if not reorder)
      // Store original fields before normalization for removal
      const originalFieldsToRemove = fieldsToAdd;
      
      if (!isReorderRef.current) {
        setMergeFields((prev) => {
          // Helper to match fields for removal
          const matchField = (field1, field2) => {
            // For PART fields, match by name
            if (isPart(field1) && isPart(field2)) {
              return field1.name === field2.name;
            }
            // For child fields, match by name + parentTempId
            if (field1.parentTempId && field2.parentTempId) {
              return field1.name === field2.name && field1.parentTempId === field2.parentTempId;
            }
            // For top-level fields, match by name
            return field1.name === field2.name && !field1.parentTempId && !field2.parentTempId;
          };
          
          // Remove fields that match the dragged fields
          return prev.filter(mergeField => {
            // Check if this mergeField should be removed
            return !originalFieldsToRemove.some(draggedField => matchField(mergeField, draggedField));
          });
        });
      }
    } catch {
      // ignore malformed drag payload
    }
  };
  

  const onAllowDrop = (e) => {
    e.preventDefault();
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

  const addSection = () => {
    const idx = sections.length + 1;
    setNewSection({
      name: '',
      label: '',
      displayOrder: idx,
      editBy: 'TRAINER',
      roleInSubject: '',
      isSubmittable: true,
      isToggleDependent: false,
      fields: []
    });
    setShowSectionModal(true);
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
      roleInSubject: newSection.editBy === 'TRAINEE' ? null : (newSection.roleInSubject || null)
    };
    setSections((prev) => [...prev, sectionToAdd]);
    setShowSectionModal(false);
  };

  const handleCloseSectionModal = () => {
    setShowSectionModal(false);
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

  const removeSection = (sectionIndex) => {
    setSections((prev) => prev.filter((_, idx) => idx !== sectionIndex));
  };

  const handleEditField = (sectionIndex, fieldIndex) => {
    const field = sections[sectionIndex]?.fields?.[fieldIndex];
    if (!field) return;
    setEditingField({ ...field });
    setEditingSectionIndex(sectionIndex);
    setEditingFieldIndex(fieldIndex);
    setShowEditModal(true);
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
    if (!editingField || !editingField.label || !editingField.name) {
      toast.warning('Please fill in all required fields');
      return;
    }

    // Validate fieldName format based on fieldType
    const validation = validateFieldName(editingField.name, editingField.fieldType);
    if (!validation.valid) {
      toast.warning(validation.message);
      return;
    }

    if (editingSectionIndex === null || editingSectionIndex < 0 || editingSectionIndex >= sections.length) {
      toast.warning('Invalid section');
      return;
    }

    const nextSections = [...sections];
    const sectionFields = nextSections[editingSectionIndex].fields || [];
    
    // Check for duplicate field name (excluding current field)
    const existingFields = sectionFields.filter((_, idx) => idx !== editingFieldIndex);
    if (existingFields.some((f) => f.name === editingField.name)) {
      toast.warning('Field name must be unique within the section');
      return;
    }

    // Auto-set roleRequired from section's editBy
    const section = nextSections[editingSectionIndex];
    const roleRequired = section?.editBy || 'TRAINER';
    const fieldToUpdate = {
      ...editingField,
      roleRequired: roleRequired
    };

    // Update the field
    nextSections[editingSectionIndex].fields = [
      ...sectionFields.slice(0, editingFieldIndex),
      fieldToUpdate,
      ...sectionFields.slice(editingFieldIndex + 1)
    ];

    setSections(nextSections);
    setShowEditModal(false);
    setEditingField(null);
    setEditingSectionIndex(null);
    setEditingFieldIndex(null);
    toast.success('Field updated successfully');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingField(null);
    setEditingSectionIndex(null);
    setEditingFieldIndex(null);
  };

  const extractFromUrl = async () => {
    try {
      setLoading(true);
      let url = initialUrl;
      
      // Try get latest edited doc url via export (non-blocking)
      if (exportEditedDoc && !url) {
        try {
          const uploaded = await exportEditedDoc();
          if (uploaded) url = uploaded;
      } catch {
          // Continue with fallback
        }
      }
      
      // Fallback to localStorage if no URL available
      if (!url) {
        try {
          const templateInfo = localStorage.getItem('templateInfo');
          if (templateInfo) {
            const parsed = JSON.parse(templateInfo);
            if (parsed.templateContent) {
              url = parsed.templateContent;
            }
          }
      } catch {
        // Ignore parse errors
        }
      }
      
      if (!url) {
        toast.error('No document URL available');
        setLoading(false);
        return;
      }
      
      const { data } = await apiClient.post('/templates/extract-fields-from-url', { url });
      const raw = data?.fields || data || [];
      const fields = raw.map((f, idx) => ({
        name: f.fieldName || f.name || `field_${idx}`,
        label: `{${f.fieldName || f.name}}`,
        fieldType: f.fieldType,
        displayOrder: f.displayOrder,
        parentTempId: f.parentTempId || null,
        tempId: f.tempId
      }));
      setMergeFields(fields);
    } catch {
      toast.error('Failed to extract fields');
    } finally {
      setLoading(false);
    }
  };

  // Auto extract once on mount (only once per initialUrl change)
  useEffect(() => {
    // Only extract if URL changed and we haven't extracted for this URL yet
    if (initialUrl && initialUrl !== lastExtractedUrlRef.current) {
      lastExtractedUrlRef.current = initialUrl;
      extractFromUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  return (
    <div className={`h-100 d-flex flex-column editor-merge-fields-wrapper ${className}`} style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div className="p-2 border-bottom bg-white" style={{ flexShrink: 0 }}>
        <div className="d-flex align-items-center gap-2">
          <Button size="sm" variant="outline-primary" onClick={addSection} disabled={loading}>
            + Add Section
          </Button>
        </div>
      </div>
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <style>{`
          .editor-merge-fields-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          .bg-part { background-color: rgba(13, 110, 253, 0.06); border-color: rgba(13, 110, 253, 0.35) !important; }
          .part-badge { background-color: rgba(13, 110, 253, 0.15); color: #0d6efd; font-size: 0.7rem; padding: 2px 6px; }
          /* Force margin-left = 0 for non-child fields to prevent CSS cascade issues */
          .section-field-non-child {
            margin-left: 0 !important;
          }
          .section-field-child {
            margin-left: 1rem !important;
          }
          
          /* Prevent text overflow in field items */
          .section-field-non-child > div:first-child,
          .section-field-child > div:first-child {
            min-width: 0 !important;
            flex: 1 !important;
            overflow: hidden !important;
          }
          
          .section-field-non-child .fw-bold,
          .section-field-child .fw-bold {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          
          .section-field-non-child .text-muted,
          .section-field-child .text-muted {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          
          .section-field-non-child > div:last-child,
          .section-field-child > div:last-child {
            flex-shrink: 0 !important;
          }
          
          /* Match CustomFieldsPanel styling */
          .section-card { border: 1px solid var(--bs-primary) !important; border-left: 4px solid var(--bs-primary) !important; border-radius: 0.5rem; }
          .section-header { background: #f8fafc; border-bottom: 1px solid var(--bs-border-color); cursor: pointer; }
          .section-body { background: #fbfdff; }
          .section-card:hover { box-shadow: 0 2px 8px rgba(13,110,253,.08); }
          .section-title { display: flex; align-items: center; gap: 0.5rem; }
          .field-count-badge { background: rgba(var(--bs-primary-rgb), .08); color: var(--bs-primary); font-weight: 600; border: 1px solid rgba(var(--bs-primary-rgb), .25); }
          .field-card-item { padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #dee2e6; margin-bottom: 0.5rem; background: white; }
          .field-card-item.bg-part { background-color: rgba(13, 110, 253, 0.06); border-color: rgba(13, 110, 253, 0.35) !important; }
          .field-title { display: flex; align-items: center; gap: 0.5rem; }
          .field-card-item.dragging { cursor: grabbing; box-shadow: 0 8px 18px rgba(0,0,0,.08); transform: scale(.995); background: #fff; }
          .field-card-item.drop-target-above { border-top: 3px solid var(--bs-primary) !important; }
          .field-card-item.drop-target-below { border-bottom: 3px solid var(--bs-primary) !important; }
          .section-card { transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
          .section-card.section-dragging { cursor: grabbing; box-shadow: 0 8px 18px rgba(0,0,0,.15); transform: scale(.98); opacity: 0.7; }
          .section-card.section-drop-target-above { border-top: 4px solid var(--bs-primary) !important; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
          .section-card.section-drop-target-below { border-bottom: 4px solid var(--bs-primary) !important; border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
        `}</style>
        {/* Sections on Top */}
        <div className="flex-shrink-0" style={{ maxHeight: '60%', overflowY: 'auto', borderBottom: '1px solid #eee', minHeight: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div className="p-3" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {sections.length === 0 && (
              <Alert variant="light" className="mb-0">
                <small>No sections yet. Click "+ Add Section" to start.</small>
              </Alert>
            )}
            {sections.length > 0 && (
            <div className="d-grid gap-2">
              {sections
                .map((sec, sIdx) => {
                  return (
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
                    if (readOnly || sectionDragState.fromIndex === null) {
                      onAllowDrop(e);
                      return;
                    }
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
                    if (readOnly || sectionDragState.fromIndex === null) {
                      onDropToSection(e, sIdx);
                      return;
                    }
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
                  >
                    <div className="d-flex flex-column">
                      <div className="section-title fw-bold">
                        {collapsedSections[sIdx] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        {sec.label}
                        <span className="badge rounded-pill ms-1 field-count-badge">
                          {sec.fields?.length || 0}
                        </span>
                      </div>
                      <small className="text-muted">Edit by: {sec.editBy || 'TRAINER'}</small>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeSection(sIdx)}
                        disabled={readOnly}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card.Header>
                  {!collapsedSections[sIdx] && (
                  <Card.Body className="section-body">
                    {sec.fields && sec.fields.length > 0 ? (
                      (() => {
                        // Keep fields in their original drag order
                        const allSorted = [...sec.fields];
                        // CRITICAL: Ensure PART fields are always in topLevel
                        // A field is top-level if:
                        // 1. It's a PART field (PART fields can never be children)
                        // 2. OR it's not a child (no parentTempId or is a PART field)
                        const topLevel = allSorted.filter((f) => {
                          // PART fields are ALWAYS top-level
                          if (isPart(f)) {
                            // Debug: Check if PART field has parentTempId (should be null)
                            if (f.parentTempId) {
                              console.error(`🚨 PART field ${f.name} has parentTempId: ${f.parentTempId} - This should be null!`);
                            }
                            return true;
                          }
                          // Non-PART fields are top-level only if they have no parentTempId
                          return !f.parentTempId || f.parentTempId === null || f.parentTempId === '';
                        });
                        
                        console.log(`📊 Section ${sIdx} fields analysis:`, {
                          totalFields: allSorted.length,
                          topLevelCount: topLevel.length,
                          topLevelFields: topLevel.map(f => ({ 
                            name: f.name, 
                            fieldType: f.fieldType, 
                            tempId: f.tempId,
                            parentTempId: f.parentTempId,
                            isPart: isPart(f)
                          })),
                          allFields: allSorted.map(f => ({ 
                            name: f.name, 
                            fieldType: f.fieldType, 
                            tempId: f.tempId,
                            parentTempId: f.parentTempId,
                            isPart: isPart(f)
                          }))
                        });
                        
                        // DEBUG: Verify PART fields don't have incorrect parentTempId
                        topLevel.forEach(f => {
                          if (isPart(f) && f.parentTempId) {
                            console.error(`❌ CRITICAL BUG: PART field ${f.name} in topLevel has parentTempId: ${f.parentTempId}`, f);
                          }
                        });
                        
                        // DEBUG: Check for any PART fields with matching parentTempId to another PART's tempId
                        const partFields = allSorted.filter(isPart);
                        partFields.forEach((part1, i) => {
                          partFields.forEach((part2, j) => {
                            if (i !== j && part1.parentTempId && part2.tempId && part1.parentTempId === part2.tempId) {
                              console.error(`❌ CRITICAL: PART field ${part1.name} has parentTempId "${part1.parentTempId}" matching PART ${part2.name}'s tempId "${part2.tempId}"`, {
                                part1: { name: part1.name, fieldType: part1.fieldType, tempId: part1.tempId, parentTempId: part1.parentTempId },
                                part2: { name: part2.name, fieldType: part2.fieldType, tempId: part2.tempId, parentTempId: part2.parentTempId }
                              });
                            }
                          });
                        });

                        const renderRow = (field, realIndex, topLevelIdx = null) => {
                          const isPartField = isPart(field);
                          
                          // DEBUG: Log which field is being rendered
                          console.log(`🎨 renderRow: ${field.name} (${field.fieldType}), realIndex: ${realIndex}, topLevelIdx: ${topLevelIdx}, isPart: ${isPartField}, parentTempId: ${field.parentTempId}, tempId: ${field.tempId}`);
                          
                          // CRITICAL: If this field is a PART field, it should NEVER be rendered as a child
                          // Double-check that PART fields don't have parentTempId set incorrectly
                          if (isPartField && field.parentTempId) {
                            console.error(`❌ CRITICAL: PART field ${field.name} has parentTempId ${field.parentTempId} - resetting to null!`, field);
                            // Force reset to prevent rendering issues
                            field.parentTempId = null;
                          }
                          
                          // ONLY PART fields can have children - don't check children for non-PART fields
                          // Use tempId if available, otherwise use name for PART fields
                          const fieldTempId = field.tempId;
                          const fieldName = field.name;
                          
                          // DEBUG: Log fieldTempId to ensure it's correct
                          if (isPartField) {
                            console.log(`🔍 PART field ${field.name} searching with tempId: "${fieldTempId}", fieldName: "${fieldName}"`);
                          }
                          
                          let children = [];
                          if (isPartField) {
                            // DEBUG: Log what we're searching for before filtering
                            console.log(`🔍 PART field ${field.name} (tempId: ${fieldTempId}, realIndex: ${realIndex}) searching for children in ${allSorted.length} total fields:`, {
                              allFields: allSorted.map(f => ({
                                name: f.name,
                                fieldType: f.fieldType,
                                isPart: isPart(f),
                                parentTempId: f.parentTempId,
                                tempId: f.tempId
                              }))
                            });
                            // Children of a PART field must:
                            // 1. Have parentTempId matching the PART's tempId (if tempId exists)
                            //    OR matching the PART's name (only if tempId doesn't exist)
                            // 2. NOT be a PART field themselves (PART fields cannot be children of other PART fields)
                            // 3. MUST have parentTempId set (null/empty fields are not children)
                            children = allSorted.filter((f) => {
                              // CRITICAL: Never include PART fields as children - check FIRST before any other logic
                              if (isPart(f)) {
                                // DEBUG: Check if PART field has matching parentTempId (this should never happen but log it)
                                if (fieldTempId && f.parentTempId === fieldTempId) {
                                  console.error(`❌ CRITICAL: PART field ${f.name} has parentTempId "${f.parentTempId}" matching PART ${field.name}'s tempId "${fieldTempId}" - BLOCKED from children!`, {
                                    childField: { name: f.name, fieldType: f.fieldType, tempId: f.tempId, parentTempId: f.parentTempId },
                                    parentField: { name: field.name, fieldType: field.fieldType, tempId: field.tempId }
                                  });
                                }
                                return false;
                              }
                              
                              // Field must have a valid parentTempId to be a child
                              if (!f.parentTempId || f.parentTempId === null || f.parentTempId === '') {
                                return false;
                              }
                              
                              // If PART has tempId, match only by tempId (strict match)
                              if (fieldTempId) {
                                const matches = f.parentTempId === fieldTempId;
                                // DEBUG: Log matching details for troubleshooting
                                if (matches) {
                                  console.log(`  ✅ Child match: ${f.name} (parentTempId: ${f.parentTempId}) matches PART ${field.name} (tempId: ${fieldTempId})`);
                                }
                                return matches;
                              }
                              
                              // If PART has no tempId, match by name (less reliable but necessary)
                              // But also check that the field's parentTempId is not a tempId (avoid false matches)
                              // Additional check: parentTempId should not look like a tempId (contains '-parent')
                              const matches = f.parentTempId === fieldName && !f.parentTempId?.includes('-parent');
                              if (matches) {
                                console.log(`  ✅ Child match by name: ${f.name} (parentTempId: ${f.parentTempId}) matches PART ${field.name} (name: ${fieldName})`);
                              }
                              return matches;
                            });
                            
                            // DEBUG: Log all fields and their parentTempId to understand why children are missing
                            if (isPartField && children.length === 0 && allSorted.length > 0) {
                              const allNonPartFields = allSorted.filter(f => !isPart(f));
                              const fieldsWithParent = allNonPartFields.filter(f => f.parentTempId);
                              const fieldsMatchingThisPart = fieldsWithParent.filter(f => f.parentTempId === fieldTempId);
                              
                              console.warn(`⚠️ PART field ${field.name} (tempId: ${fieldTempId}) has NO children. Debug info:`, {
                                totalFields: allSorted.length,
                                totalNonPartFields: allNonPartFields.length,
                                fieldsWithParent: fieldsWithParent.length,
                                fieldsMatchingThisPart: fieldsMatchingThisPart.length,
                                fieldsWithParentDetails: fieldsWithParent.map(f => ({ 
                                  name: f.name, 
                                  fieldType: f.fieldType, 
                                  parentTempId: f.parentTempId, 
                                  expected: fieldTempId, 
                                  matches: f.parentTempId === fieldTempId,
                                  // CRITICAL: Check if field name is duplicate (belongs to multiple PART fields)
                                  duplicateNames: allSorted.filter(other => 
                                    !isPart(other) && other.name === f.name && other !== f
                                  ).map(other => ({
                                    name: other.name,
                                    parentTempId: other.parentTempId,
                                    belongsTo: allSorted.find(p => isPart(p) && (p.tempId === other.parentTempId || p.name === other.parentTempId))?.name || 'unknown'
                                  }))
                                })),
                                allFieldsInSection: sec.fields.map(f => ({
                                  name: f.name,
                                  fieldType: f.fieldType,
                                  tempId: f.tempId,
                                  parentTempId: f.parentTempId,
                                  isPart: isPart(f)
                                }))
                              });
                              
                              // If there ARE fields matching but filter didn't catch them, log detailed comparison
                              if (fieldsMatchingThisPart.length > 0) {
                                console.error(`❌ CRITICAL: Found ${fieldsMatchingThisPart.length} fields with parentTempId="${fieldTempId}" but filter returned 0!`, {
                                  matchingFields: fieldsMatchingThisPart,
                                  fieldTempId: fieldTempId,
                                  fieldName: fieldName
                                });
                              }
                            }
                            
                            if (children.length > 0) {
                              console.log(`👨‍👩‍👧 PART field ${field.name} (tempId: ${fieldTempId}, realIndex: ${realIndex}) has ${children.length} children:`, 
                                children.map(c => ({ 
                                  name: c.name, 
                                  fieldType: c.fieldType, 
                                  parentTempId: c.parentTempId,
                                  expectedParentTempId: fieldTempId,
                                  matches: c.parentTempId === fieldTempId
                                }))
                              );
                            } else if (isPartField) {
                              console.log(`⚠️ PART field ${field.name} (tempId: ${fieldTempId}, realIndex: ${realIndex}) has NO children`);
                            }
                          }
                          
                          // Disable drag for children
                          // CRITICAL: PART fields are NEVER children, so isChildField should always be false for PART fields
                          const isChildField = !isPartField && field.parentTempId && field.parentTempId !== null && field.parentTempId !== '';
                          
                          // DEBUG: Verify PART fields are never marked as children
                          if (isPartField && isChildField) {
                            console.error(`❌ CRITICAL BUG: PART field ${field.name} is marked as child! parentTempId: ${field.parentTempId}`, field);
                          }
                          
                          // PART fields can always be dragged (they are never children)
                          // Non-PART fields can be dragged only if they are not children
                          const canDrag = isPartField ? true : !isChildField;
                          
                          // Handle drag for fields within section (reorder)
                          const handleDragStartInSection = (e) => {
                            if (isChildField) {
                              e.preventDefault();
                              return;
                            }
                            
                            setDragState({ sectionIndex: sIdx, fromIndex: realIndex, overIndex: realIndex, position: 'above' });
                            
                            if (isPartField) {
                              // When dragging PART, include all its children
                              // Use the same children logic as render
                              const partChildren = allSorted.filter((f) => {
                                if (isPart(f)) return false;
                                if (fieldTempId) {
                                  return f.parentTempId === fieldTempId;
                                }
                                return f.parentTempId === fieldName && !f.parentTempId?.includes('-parent');
                              });
                              const fieldsToMove = [field, ...partChildren];
                              e.dataTransfer.setData('text/plain', JSON.stringify(fieldsToMove));
                              e.dataTransfer.effectAllowed = 'move';
                            } else {
                              e.dataTransfer.setData('text/plain', JSON.stringify(field));
                              e.dataTransfer.effectAllowed = 'move';
                            }
                          };
                          
                          // Handle drag over for visual feedback (only for reorder within section)
                          const handleDragOver = (e) => {
                            // Only handle if dragging within the same section
                            if (dragState.sectionIndex !== sIdx || dragState.fromIndex === null) return;
                            e.preventDefault();
                            e.stopPropagation(); // Prevent bubbling to section drop handler
                            const rect = e.currentTarget.getBoundingClientRect();
                            const mid = rect.top + rect.height / 2;
                            const position = e.clientY < mid ? 'above' : 'below';
                            let targetIndex = realIndex;
                            if (position === 'below') targetIndex = realIndex + 1;
                            if (dragState.overIndex !== targetIndex || dragState.position !== position) {
                              setDragState((prev) => ({ ...prev, overIndex: targetIndex, position }));
                            }
                          };
                          
                          // Handle drop to reorder (only for reorder within section)
                          const handleDrop = (e) => {
                            // Only handle if this is a reorder within the same section
                            if (dragState.sectionIndex !== sIdx || dragState.fromIndex === null) return;
                            e.preventDefault();
                            e.stopPropagation(); // Prevent bubbling to section drop handler
                            const toIndex = Math.max(0, Math.min(dragState.overIndex, sec.fields.length || 0));
                            reorderWithinSection(sIdx, dragState.fromIndex, toIndex);
                            setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' });
                          };
                          
                          // Visual feedback for drag state
                          const isDragging = dragState.sectionIndex === sIdx && dragState.fromIndex === realIndex;
                          const isDropTarget = dragState.sectionIndex === sIdx && dragState.overIndex === realIndex;
                          const dropTargetClass = isDropTarget && dragState.position === 'above' ? 'drop-target-above' : 
                                                   isDropTarget && dragState.position === 'below' ? 'drop-target-below' : '';
                          
                          // Use field.name as key to ensure unique identification
                          // Include tempId to prevent React from reusing components incorrectly
                          const fieldKey = `${sIdx}-topLevel-${field.name}-${field.tempId || field.name || realIndex}`;
                          
                          // DEBUG: Log key to ensure uniqueness
                          if (isPartField) {
                            console.log(`🔑 Key for PART field ${field.name}: ${fieldKey}`);
                          }
                          
                          return (
                            <div
                              key={fieldKey}
                              className={`p-2 rounded border mb-2 field-card-item ${isPartField ? 'bg-part part-field-top-level' : ''} ${isChildField ? 'field-child' : ''} ${isDragging ? 'dragging' : ''} ${dropTargetClass}`}
                              data-field-name={field.name}
                              data-field-type={field.fieldType}
                              data-is-part={isPartField}
                              data-is-child={isChildField}
                              data-parent-temp-id={field.parentTempId || ''}
                              data-render-index={realIndex}
                              data-top-level-index={topLevelIdx !== null ? topLevelIdx : -1}
                              style={{ 
                                // CRITICAL: PART fields should NEVER have marginLeft (they are never children)
                                // Use explicit '0px' instead of 0 to prevent CSS inheritance issues
                                marginLeft: isPartField ? '0px' : (isChildField ? '1rem' : '0px'), 
                                cursor: canDrag ? 'grab' : 'default', 
                                opacity: isDragging ? 0.5 : (canDrag ? 1 : 0.8),
                                transition: 'all 0.12s ease'
                              }}
                              draggable={canDrag}
                              onDragStart={canDrag ? handleDragStartInSection : undefined}
                              onDragOver={canDrag ? handleDragOver : undefined}
                              onDrop={canDrag ? handleDrop : undefined}
                              onDragEnd={() => setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above' })}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="flex-grow-1" style={{ minWidth: 0, overflow: 'hidden', marginRight: '0.5rem' }}>
                                  <div className="fw-bold field-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {field.label} {isPartField && <span className="badge part-badge">PART</span>}
                                  </div>
                                  <small className="text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                    {field.name} ({field.fieldType}){field.roleRequired ? ` - ${field.roleRequired}` : ''}
                                  </small>
                                </div>
                                <div className="d-flex gap-1" style={{ flexShrink: 0 }}>
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
                                      const removedField = next[sIdx].fields[realIndex];
                                      next[sIdx].fields = next[sIdx].fields.filter((_, i) => i !== realIndex);
                                      setSections(next);
                                      
                                      // Add field back to mergeFields list
                                      if (removedField) {
                                        setMergeFields((prev) => {
                                          // Check if field already exists in mergeFields
                                          const fieldExists = prev.some(f => {
                                            // For PART fields, match by name
                                            if (isPart(f) && isPart(removedField)) {
                                              return f.name === removedField.name;
                                            }
                                            // For child fields, match by name + parentTempId
                                            if (f.parentTempId && removedField.parentTempId) {
                                              return f.name === removedField.name && f.parentTempId === removedField.parentTempId;
                                            }
                                            // For top-level fields, match by name
                                            return f.name === removedField.name && !f.parentTempId && !removedField.parentTempId;
                                          });
                                          
                                          if (!fieldExists) {
                                            // Restore original field state (restore parentTempId if it was a PART field)
                                            const restoredField = { ...removedField };
                                            // If this was a PART field in section, restore its original parentTempId structure
                                            // For now, just add it back as-is
                                            return [...prev, restoredField];
                                          }
                                          return prev;
                                        });
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
                                  onClick={() => onInsertField(field.name)}
                                  disabled={readOnly}
                                  className="d-flex align-items-center justify-content-center text-primary border-primary"
                                  style={{ transition: 'all 0.2s ease-in-out' }}
                                >
                                  <ArrowDown className="me-1" size={14} />
                                  Insert Field
                                </Button>
                              </div>

                              {/* Render children if this is a PART field */}
                              {isPartField && children.length > 0 && (
                                <div 
                                  key={`${sIdx}-part-children-${field.tempId || field.name}-${realIndex}`}
                                  className="mt-2 part-children" 
                                  style={{ borderLeft: '3px dashed rgba(13, 110, 253, 0.35)', marginLeft: '0.5rem', paddingLeft: '0.75rem' }}
                                  data-part-parent={field.name}
                                  data-part-tempid={field.tempId}
                                  data-part-render-index={realIndex}
                                >
                                  {(() => {
                                    console.log(`🔵 Rendering ${children.length} children for PART ${field.name} (tempId: ${field.tempId}, realIndex: ${realIndex}):`, children.map(c => ({ name: c.name, fieldType: c.fieldType, parentTempId: c.parentTempId, isPart: isPart(c) })));
                                    return children.map((child) => {
                                      // CRITICAL: Double-check that child is NOT a PART field
                                      // This should never happen due to filter logic, but add safety check
                                      if (isPart(child)) {
                                        console.error(`❌ CRITICAL BUG: Attempted to render PART field ${child.name} (${child.fieldType}) as child of PART field ${field.name} (${field.fieldType})!`, {
                                          child: { name: child.name, fieldType: child.fieldType, tempId: child.tempId, parentTempId: child.parentTempId },
                                          parent: { name: field.name, fieldType: field.fieldType, tempId: field.tempId },
                                          childrenArray: children.map(c => ({ name: c.name, fieldType: c.fieldType, isPart: isPart(c) }))
                                        });
                                        return null;
                                      }
                                      
                                      console.log(`  ✅ Rendering child: ${child.name} (${child.fieldType}) inside PART ${field.name}`);
                                    
                                    // Render child as a simple field card - children don't have their own children
                                    const realIdx = sec.fields.indexOf(child);
                                    // CRITICAL: Include parent PART field's tempId in key to ensure uniqueness
                                    // This prevents React from reusing components when multiple PART fields have children
                                    const fieldKey = `${sIdx}-child-${field.tempId || field.name}-${child.name}-${child.tempId || realIdx}`;
                                    
                                    console.log(`  🔑 Key for child ${child.name} of PART ${field.name}: ${fieldKey}`);
                                    
                                    return (
                                      <div
                                        key={fieldKey}
                                        className="p-2 rounded border mb-2 field-card-item"
                                        data-child-parent={field.name}
                                        data-child-parent-tempid={field.tempId}
                                        data-child-name={child.name}
                                        style={{ 
                                          marginLeft: '0',
                                          cursor: 'default',
                                          opacity: 0.8
                                        }}
                                        draggable={false}
                                      >
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <div className="flex-grow-1" style={{ minWidth: 0, overflow: 'hidden', marginRight: '0.5rem' }}>
                                            <div className="fw-bold field-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              {child.label}
                                            </div>
                                            <small className="text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                              {child.name} ({child.fieldType}){child.roleRequired ? ` - ${child.roleRequired}` : ''}
                                            </small>
                                          </div>
                                          <div className="d-flex gap-1" style={{ flexShrink: 0 }}>
                                            <Button
                                              variant="outline-primary"
                                              size="sm"
                                              onClick={() => handleEditField(sIdx, realIdx)}
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
                                                const removedField = next[sIdx].fields[realIdx];
                                                next[sIdx].fields = next[sIdx].fields.filter((_, i) => i !== realIdx);
                                                setSections(next);
                                                
                                                // Add field back to mergeFields list
                                                if (removedField) {
                                                  setMergeFields((prev) => {
                                                    // Check if field already exists in mergeFields
                                                    const fieldExists = prev.some(f => {
                                                      // For PART fields, match by name
                                                      if (isPart(f) && isPart(removedField)) {
                                                        return f.name === removedField.name;
                                                      }
                                                      // For child fields, match by name + parentTempId
                                                      if (f.parentTempId && removedField.parentTempId) {
                                                        return f.name === removedField.name && f.parentTempId === removedField.parentTempId;
                                                      }
                                                      // For top-level fields, match by name
                                                      return f.name === removedField.name && !f.parentTempId && !removedField.parentTempId;
                                                    });
                                                    
                                                    if (!fieldExists) {
                                                      // Restore original field state
                                                      const restoredField = { ...removedField };
                                                      return [...prev, restoredField];
                                                    }
                                                    return prev;
                                                  });
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
                                            onClick={() => onInsertField(child.name)}
                                            disabled={readOnly}
                                            className="d-flex align-items-center justify-content-center text-primary border-primary"
                                            style={{ transition: 'all 0.2s ease-in-out' }}
                                          >
                                            <ArrowDown className="me-1" size={14} />
                                            Insert Field
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  });
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        };

                        // DEBUG: Log what's being rendered
                        console.log(`🎨 Rendering ${topLevel.length} topLevel fields for section ${sIdx}:`, 
                          topLevel.map(f => ({ name: f.name, fieldType: f.fieldType, tempId: f.tempId, parentTempId: f.parentTempId }))
                        );
                        
                        return (
                          <>
                            {topLevel.map((field, topLevelIdx) => {
                              const realIndex = sec.fields.indexOf(field);
                              // DEBUG: Verify this field is indeed top-level and NOT a child
                              if (isPart(field) && field.parentTempId) {
                                console.error(`❌ CRITICAL BUG: Rendering PART field ${field.name} with parentTempId ${field.parentTempId} as topLevel!`, field);
                              }
                              // DEBUG: Log which field is being rendered at topLevel
                              console.log(`🎯 Rendering topLevel[${topLevelIdx}]: ${field.name} (${field.fieldType}), tempId: ${field.tempId}, parentTempId: ${field.parentTempId}, isPart: ${isPart(field)}`);
                              return renderRow(field, realIndex, topLevelIdx);
                            })}
                          </>
                        );
                      })()
                    ) : (
                      <Alert variant="light" className="mb-0">
                        <small>No fields in this section. Drag fields here.</small>
                      </Alert>
                    )}
                  </Card.Body>
                  )}
                </Card>
                );
                })}
            </div>
            )}
          </div>
        </div>
        {/* Fields on Bottom */}
        <div className="flex-grow-1" style={{ overflowY: 'auto', minHeight: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div className="p-2" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <style>{`
              .bg-part { background-color: rgba(13, 110, 253, 0.06); border-color: rgba(13, 110, 253, 0.35) !important; }
              .part-badge { background-color: rgba(13, 110, 253, 0.15); color: #0d6efd; font-size: 0.7rem; padding: 2px 6px; }
              .part-children { border-left: 3px dashed rgba(13, 110, 253, 0.35); margin-left: 0.5rem; padding-left: 0.75rem; }
              /* CRITICAL: Force PART fields to have no margin - they are always top-level */
              .part-field-top-level { margin-left: 0 !important; padding-left: 0 !important; }
              .part-field-top-level::before { display: none !important; }
              /* Ensure children have proper indentation */
              .field-child { margin-left: 1rem !important; }
            `}</style>
            <div className="text-muted small mb-2">Fields</div>
            {mergeFields?.length ? (
              (() => {
                // Sort fields by displayOrder
                const sortedFields = [...mergeFields].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                
                // Separate PART fields and their children
                const hasParent = (f) => !!f.parentTempId;
                
                // Get top-level fields (no parentTempId or are PART fields)
                const topLevelFields = sortedFields.filter((f) => !hasParent(f));
                
                const renderField = (field) => {
                  const isPartField = isPart(field);
                  const parentId = getParentId(field);
                  const children = sortedFields.filter((f) => f.parentTempId === parentId);
                  
                  // Check if this field is a child (has parentTempId and is not a PART field)
                  const isChildField = !isPartField && field.parentTempId && field.parentTempId !== null && field.parentTempId !== '';
                  
                  // Only allow dragging PART fields or top-level fields (not children)
                  const canDragField = !isChildField;
                  
                  return (
                    <div key={field.name} className="mb-2">
                      <Card 
                        className={`mb-2 ${isPartField ? 'bg-part' : ''}`}
                        draggable={canDragField}
                        onDragStart={canDragField ? (e) => onDragStart(e, field) : undefined}
                        style={{ cursor: canDragField ? 'grab' : 'default', opacity: canDragField ? 1 : 0.8 }}
                      >
                        <Card.Body className="py-2 px-2">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1" style={{ minWidth: 0, overflow: 'hidden', marginRight: '0.5rem' }}>
                              <div className="fw-bold" style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {field.label} {isPartField && <span className="badge part-badge ms-1">PART</span>}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {field.name} ({field.fieldType})
                              </div>
                            </div>
                          </div>
                          <div className="d-grid">
                            <Button 
                              size="sm" 
                              variant="outline-primary" 
                              onClick={() => onInsertField(field.name)} 
                              disabled={readOnly}
                              className="insert-field-btn"
                            >
                              Insert Field
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                      
                      {/* Render children if this is a PART field */}
                      {isPartField && children.length > 0 && (
                        <div className="part-children">
                          {children.map((child) => renderField(child))}
                        </div>
                      )}
                    </div>
                  );
                };
                
                return topLevelFields.map((field) => renderField(field));
              })()
            ) : (
              <Alert variant="light" className="m-0">No extracted fields.</Alert>
            )}
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <Modal show={showSectionModal} onHide={handleCloseSectionModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Label <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Display label"
                    value={newSection.label}
                    onChange={(e) => setNewSection((prev) => ({ ...prev, label: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Edit By</Form.Label>
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
                    <Form.Label>Role In Subject</Form.Label>
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
          <Button variant="outline-secondary" onClick={handleCloseSectionModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSection}>
            Save Section
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Field Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Field</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {editingField && (
            <Form>
              <Row className="g-3">
                <Col md={12}>
                  <Alert variant="light" className="py-2">
                    Editing field in section: <strong>{editingSectionIndex !== null ? sections[editingSectionIndex]?.label : 'N/A'}</strong>
                  </Alert>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Label <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Crew Communication"
                      value={editingField.label || ''}
                      onChange={(e) => setEditingField(prev => ({ ...prev, label: e.target.value }))}
                      required
                    />
                    <Form.Text className="text-muted">
                      The question or label displayed to the user (e.g., "Crew Communication").
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Field Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={
                        editingField.fieldType === 'PART' 
                          ? 'e.g., Assessment_Items' 
                          : editingField.fieldType === 'TOGGLE'
                          ? 'e.g., isGroundCourse'
                          : 'e.g., crew_communication'
                      }
                      value={editingField.name || ''}
                      onChange={(e) => setEditingField(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Form.Text className="text-muted">
                      {editingField.fieldType === 'PART' 
                        ? 'The tag name should use underscores, should not start with the word "section" and the first letter always have to be capitalized. (e.g., Assessment_Items).'
                        : editingField.fieldType === 'TOGGLE'
                        ? 'The tag name should use camelCase (e.g., isGroundCourse).'
                        : 'The variable name used in the docxtemplate (e.g., {crew_communication}). Must be unique within a template.'
                      }
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Field Type <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={editingField.fieldType || 'TEXT'}
                      onChange={(e) => setEditingField(prev => ({ ...prev, fieldType: e.target.value }))}
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
                    <Form.Label>Role Required</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingSectionIndex !== null ? (sections[editingSectionIndex]?.editBy || 'TRAINER') : 'TRAINER'}
                      readOnly
                      disabled
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                    <Form.Text className="text-muted">
                      Automatically set from section's "Edit By" value.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Parent Template ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Leave empty for root level"
                      value={editingField.parentTempId || ''}
                      onChange={(e) => setEditingField(prev => ({ ...prev, parentTempId: e.target.value || null }))}
                    />
                  </Form.Group>
                </Col>
                {editingField.tempId && (
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Template ID (read-only)</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingField.tempId}
                        readOnly
                        disabled
                      />
                      <Form.Text className="text-muted">
                        This is the unique identifier for PART fields. It cannot be changed.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveField}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditorWithMergeFields;


