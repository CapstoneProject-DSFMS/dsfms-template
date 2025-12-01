import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert, Modal, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Plus, X, ArrowDown, Pencil, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'react-toastify';
import { roleAPI } from '../../../api/role';
import { readTemplateMetaFromStorage, buildTemplatePayload } from '../../../utils/templateBuilder';
import { validateFields } from '../../../utils/fieldValidator';
import apiClient from '../../../api/config.js';
import { API_CONFIG } from '../../../config/api.js';
import { uploadAPI } from '../../../api/upload.js';
import templateAPI from '../../../api/template';
import { PermissionWrapper } from '../../Common';

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
  className = "",
  onSubmittingChange // Callback to notify parent about submit state
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
  const [dragState, setDragState] = useState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null });
  const [sectionDragState, setSectionDragState] = useState({ fromIndex: null, overIndex: null, position: 'above' });
  const processingOperationsRef = useRef(new Set()); // Track processing operations by unique key

  // Section modal state
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null); // null = add mode, number = edit mode
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
            
            // Step 2: Check originalTemplateId FIRST, then currentTemplateId, and call appropriate API
            // IMPORTANT: Read metadata fresh from localStorage (not from meta which was read at start)
            const freshMeta = readTemplateMetaFromStorage();
            const originalTemplateId = freshMeta.originalTemplateId;
            // Check both currentTemplateId and id (for backward compatibility with "Your Drafts")
            const currentTemplateId = freshMeta.currentTemplateId || 
                                     freshMeta.id || 
                                     localStorage.getItem('currentTemplateId');
            
            // Step 3: Load existing fields if updating draft (to convert parentTempId → parentId)
            let existingFields = null;
            if (currentTemplateId && !originalTemplateId) {
              // Only load existing fields when updating draft (not creating new version)
              try {
                console.log('📥 Loading existing draft fields for parentId conversion...');
                const existingDraftResponse = await templateAPI.getTemplateById(currentTemplateId);
                const existingSections = existingDraftResponse?.data?.sections || 
                                        existingDraftResponse?.data?.data?.sections || [];
                // Flatten all fields from all sections
                existingFields = existingSections.flatMap(section => section.fields || []);
                console.log(`✅ Loaded ${existingFields.length} existing fields for conversion`);
              } catch (loadError) {
                console.warn('⚠️ Failed to load existing draft fields, will use parentTempId:', loadError);
                // Continue without existingFields - will use parentTempId (for CREATE flow)
              }
            }
            
            // Step 4: Build template payload with status DRAFT
            const effectiveMeta = {
              ...meta,
              templateContent: meta.templateContent, // Original file import
              templateConfig: s3Url // S3 URL of edited document
            };
            
            // Pass existingFields to buildTemplatePayload for parentId conversion
            const basePayload = buildTemplatePayload(effectiveMeta, sections, existingFields);
            
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
            console.log('  🔄 Using existingFields for conversion:', existingFields ? 'Yes' : 'No');
            console.log('🧩 Full payload:\n', JSON.stringify(payload, null, 2));
            
            console.log('🔍 Checking flow type:');
            console.log('  📦 freshMeta.originalTemplateId:', originalTemplateId);
            console.log('  📦 freshMeta.currentTemplateId:', freshMeta.currentTemplateId);
            console.log('  📦 freshMeta.id:', freshMeta.id);
            console.log('  📦 localStorage.getItem("currentTemplateId"):', localStorage.getItem('currentTemplateId'));
            console.log('  ✅ Final originalTemplateId:', originalTemplateId);
            console.log('  ✅ Final currentTemplateId:', currentTemplateId);
            
            // PRIORITY 1: Check originalTemplateId FIRST (Create Version flow)
            // In "Create Version" flow, we ALWAYS use create-version API, even if currentTemplateId exists
            if (originalTemplateId) {
                // This is "Create Version" flow - use create-version API
                console.log('🔄 Creating new draft for version (with originalTemplateId):', originalTemplateId);
                
                // Build version payload with originalTemplateId and status DRAFT
                const versionPayload = {
                  originalTemplateId: originalTemplateId,
                  ...payload
                };
                
                try {
                  const res = await templateAPI.createVersion(versionPayload);
                  
                  // Save currentTemplateId from response
                  const templateForm = res?.data?.templateForm || res?.data?.data?.templateForm || res?.data?.data?.template || res?.data?.template;
                  const newTemplateId = templateForm?.id || 
                                     res?.data?.id || 
                                     res?.data?.data?.id || 
                                     res?.data?.data?.templateForm?.id ||
                                     res?.data?.data?.template?.id ||
                                     res?.data?.template?.id ||
                                     (res?.data?.data?.template ? res.data.data.template.id : null);
                  
                  if (newTemplateId) {
                    const freshMetaForUpdate = readTemplateMetaFromStorage();
                    const updatedMeta = {
                      ...freshMetaForUpdate,
                      currentTemplateId: newTemplateId
                    };
                    localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
                    localStorage.setItem('currentTemplateId', newTemplateId);
                    console.log('💾 Saved currentTemplateId:', newTemplateId);
                  }
                  
                  toast.success('Draft template saved successfully!');
                  console.log('✅ Draft version created successfully:', res?.data ?? res);
                  return res?.data ?? res;
                } catch (createError) {
                  // Check if error is "Template name already exists"
                  const errorMessage = createError?.response?.data?.message || createError?.message || '';
                  const statusCode = createError?.response?.statusCode || createError?.response?.status;
                  
                  const isNameExistsError = statusCode === 400 && 
                    (errorMessage.includes('already exists') || 
                     errorMessage.includes('Template name') ||
                     errorMessage.toLowerCase().includes('duplicate'));
                  
                  if (isNameExistsError) {
                    // Retry without name - backend will auto-generate name
                    console.log('⚠️ Template name already exists, retrying without name...');
                    toast.warning('Template name already exists. System will auto-generate a new name...');
                    
                    // Create new payload without name
                    const retryPayload = {
                      originalTemplateId: originalTemplateId,
                      description: payload.description,
                      departmentId: payload.departmentId,
                      templateContent: payload.templateContent,
                      templateConfig: payload.templateConfig || null,
                      status: 'DRAFT',
                      sections: payload.sections
                      // Note: name is intentionally omitted - backend will auto-generate
                    };
                    
                    try {
                      const retryRes = await templateAPI.createVersion(retryPayload);
                      
                      // Save currentTemplateId from response
                      const templateForm = retryRes?.data?.templateForm || retryRes?.data?.data?.templateForm || retryRes?.data?.data?.template || retryRes?.data?.template;
                      const newTemplateId = templateForm?.id || 
                                         retryRes?.data?.id || 
                                         retryRes?.data?.data?.id || 
                                         retryRes?.data?.data?.templateForm?.id ||
                                         retryRes?.data?.data?.template?.id ||
                                         retryRes?.data?.template?.id ||
                                         (retryRes?.data?.data?.template ? retryRes.data.data.template.id : null);
                      
                      if (newTemplateId) {
                        const freshMetaForUpdate = readTemplateMetaFromStorage();
                        const updatedMeta = {
                          ...freshMetaForUpdate,
                          currentTemplateId: newTemplateId
                        };
                        localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
                        localStorage.setItem('currentTemplateId', newTemplateId);
                        console.log('💾 Saved currentTemplateId (retry):', newTemplateId);
                      }
                      
                      toast.success('Draft template saved successfully with auto-generated name!');
                      console.log('✅ Draft version created successfully (retry):', retryRes?.data ?? retryRes);
                      return retryRes?.data ?? retryRes;
                    } catch (retryError) {
                      // If retry also fails, throw error
                      console.error('❌ Retry failed:', retryError);
                      throw retryError;
                    }
                  } else {
                    // If error is not "name already exists", throw error
                    throw createError;
                  }
                }
            } else if (currentTemplateId) {
              // PRIORITY 2: Update existing draft (only when NOT in Create Version flow)
              console.log('📝 Updating existing draft:', currentTemplateId);
              const res = await apiClient.put(`/templates/update-draft/${currentTemplateId}`, {
                ...payload,
                id: currentTemplateId,
                status: 'DRAFT'
              });
              toast.success('Draft template saved successfully!');
              console.log('✅ Draft updated successfully:', res?.data ?? res);
              return res?.data ?? res;
            } else {
              // PRIORITY 3: Create new draft (normal flow, not Create Version, not existing draft)
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
    setEditingSectionIndex(null); // Add mode
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

  const handleEditSection = (sectionIndex) => {
    if (readOnly) return;
    
    const section = sections[sectionIndex];
    if (!section) return;
    
    setEditingSectionIndex(sectionIndex); // Edit mode
    setNewSection({
      name: section.name || section.label || '',
      label: section.label || '',
      displayOrder: section.displayOrder || sectionIndex + 1,
      editBy: section.editBy || 'TRAINER',
      roleInSubject: section.roleInSubject || '',
      isSubmittable: section.isSubmittable !== undefined ? section.isSubmittable : true,
      isToggleDependent: section.isToggleDependent !== undefined ? section.isToggleDependent : false,
      fields: section.fields || []
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

  // Move field from one section to another
  const moveFieldBetweenSections = (fromSectionIndex, fromFieldIndex, toSectionIndex, toFieldIndex) => {
    if (readOnly) return;
    if (fromSectionIndex === null || fromFieldIndex === null || toSectionIndex === null) return;
    if (fromSectionIndex === toSectionIndex) {
      // Same section - use reorderWithinSection instead
      reorderWithinSection(fromSectionIndex, fromFieldIndex, toFieldIndex);
      return;
    }

    // For deduplication, use a key based on indices
    // This will prevent the same exact operation from running twice
    const dedupeKey = `${fromSectionIndex}-${fromFieldIndex}-${toSectionIndex}`;
    
    // Atomic check-and-add: Try to add the key, and check if it was already there
    // This ensures that only one of the concurrent calls will proceed
    const sizeBefore = processingOperationsRef.current.size;
    processingOperationsRef.current.add(dedupeKey);
    const sizeAfter = processingOperationsRef.current.size;
    
    // If size didn't increase, the key was already in the Set (operation already processing)
    if (sizeBefore === sizeAfter) {
      console.warn('⚠️ Move operation already in progress, skipping...', dedupeKey);
      return;
    }
    
    // Key was successfully added, proceed with the operation

    setSections((prev) => {
      const next = [...prev];
      const fromSection = next[fromSectionIndex];
      const toSection = next[toSectionIndex];
      
      if (!fromSection || !toSection) {
        setTimeout(() => { processingOperationsRef.current.delete(dedupeKey); }, 0);
        return prev;
      }
      
      const fromFields = [...(fromSection.fields || [])];
      const toFields = [...(toSection.fields || [])];
      
      // Validate index
      if (fromFieldIndex < 0 || fromFieldIndex >= fromFields.length) {
        console.warn('⚠️ Invalid fromFieldIndex:', fromFieldIndex, 'Fields length:', fromFields.length);
        setTimeout(() => { processingOperationsRef.current.delete(dedupeKey); }, 0);
        return prev;
      }
      
      // Get the field to move
      const fieldToMove = fromFields[fromFieldIndex];
      if (!fieldToMove) {
        console.warn('⚠️ Field not found at index:', fromFieldIndex);
        setTimeout(() => { processingOperationsRef.current.delete(dedupeKey); }, 0);
        return prev;
      }
      
      // Debug: Log the field being moved
      console.log('🔍 moveFieldBetweenSections:', {
        fromFieldIndex,
        fieldToMove: fieldToMove.label || fieldToMove.fieldName,
        fieldType: fieldToMove.fieldType,
        parentTempId: fieldToMove.parentTempId,
        allFields: fromFields.map((f, i) => ({ idx: i, label: f.label || f.fieldName, type: f.fieldType, parent: f.parentTempId }))
      });
      
      // Check if it's a PART field - need to move children too
      const isPart = String(fieldToMove.fieldType || '').toUpperCase() === 'PART';
      const partTempId = isPart ? (fieldToMove.tempId || `${fieldToMove.fieldName}-parent`) : null;
      
      // Collect all fields to move (PART + children if applicable, or just the field if it's a child)
      const fieldsToMove = [fieldToMove];
      const indicesToRemove = new Set([fromFieldIndex]);
      
      if (isPart && partTempId) {
        // Find all children of this PART field and collect their indices
        // Only include children that come AFTER the PART field in the array
        fromFields.forEach((f, idx) => {
          // Only add children that belong to this PART field (by parentTempId)
          // and make sure we don't add the PART field itself again
          if (f.parentTempId === partTempId && idx !== fromFieldIndex) {
            console.log('  ➕ Adding child:', { idx, label: f.label || f.fieldName, parentTempId: f.parentTempId });
            fieldsToMove.push(f);
            indicesToRemove.add(idx);
          }
        });
      }
      // Note: If moving a child field (isChildOfPart), we only move that child
      // We don't move the parent PART field or other children
      
      console.log('  📦 Fields to move:', fieldsToMove.map(f => f.label || f.fieldName));
      console.log('  🗑️ Indices to remove:', Array.from(indicesToRemove));
      
      // Remove fields from source section by index
      // This ensures we only remove the exact field at fromFieldIndex and its children (if PART)
      const remainingFields = fromFields.filter((f, idx) => {
        const shouldRemove = indicesToRemove.has(idx);
        if (shouldRemove) {
          console.log(`  ❌ Removing field at index ${idx}:`, f.label || f.fieldName);
        }
        return !shouldRemove;
      });
      
      console.log('  ✅ Remaining fields:', remainingFields.map((f, i) => ({ idx: i, label: f.label || f.fieldName })));
      
      // Insert fields into target section at the specified index
      const insertIndex = toFieldIndex !== null ? Math.max(0, Math.min(toFieldIndex, toFields.length)) : toFields.length;
      toFields.splice(insertIndex, 0, ...fieldsToMove);
      
      // Update sections
      next[fromSectionIndex] = { ...fromSection, fields: remainingFields };
      next[toSectionIndex] = { ...toSection, fields: toFields };
      
      // Notify parent component
      if (onAddField) {
        const flattened = next.flatMap((s) => s.fields || []);
        setTimeout(() => {
          onAddField(flattened, { silent: true });
        }, 0);
      }
      
      // Remove operation key after state update completes
      setTimeout(() => {
        processingOperationsRef.current.delete(dedupeKey);
      }, 0);
      
      return next;
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
    
    // Check for duplicate section label
    const trimmedLabel = newSection.label.trim();
    const isDuplicate = sections.some((section, index) => {
      // When editing, exclude the current section from duplicate check
      if (editingSectionIndex !== null && index === editingSectionIndex) {
        return false;
      }
      // Case-insensitive comparison
      return section.label && section.label.trim().toLowerCase() === trimmedLabel.toLowerCase();
    });
    
    if (isDuplicate) {
      toast.warning(`Section with label "${trimmedLabel}" already exists. Please use a different label.`);
      return;
    }
    
    // If editBy is TRAINEE, set roleInSubject to null; if TRAINER, keep the value
    const sectionToSave = {
      ...newSection,
      name: trimmedLabel, // Use trimmed label as name
      label: trimmedLabel, // Use trimmed label
      roleInSubject: newSection.editBy === 'TRAINEE' ? null : (newSection.roleInSubject || null),
      fields: [...(newSection.fields || [])]
    };
    
    if (editingSectionIndex !== null) {
      // Edit mode: Update existing section (preserve fields)
      setSections((prev) => {
        const next = [...prev];
        const existingSection = next[editingSectionIndex];
        const existingFields = existingSection.fields || [];
        
        // Handle isToggleDependent change
        let updatedFields = [...existingFields];
        const hadToggleField = existingFields.some(f => f.fieldType === 'SECTION_CONTROL_TOGGLE');
        const needsToggleField = sectionToSave.isToggleDependent;
        
        if (needsToggleField && !hadToggleField) {
          // Add toggle field if it doesn't exist
          const toggleFieldName = `${sectionToSave.name.toLowerCase().replace(/\s+/g, '_')}_toggle`;
          const toggleField = {
            label: `${sectionToSave.label} Toggle`,
            fieldName: toggleFieldName,
            fieldType: 'SECTION_CONTROL_TOGGLE',
            roleRequired: sectionToSave.editBy || 'TRAINER',
            parentTempId: null
          };
          updatedFields = [toggleField, ...updatedFields];
        } else if (!needsToggleField && hadToggleField) {
          // Remove toggle field if it exists
          updatedFields = updatedFields.filter(f => f.fieldType !== 'SECTION_CONTROL_TOGGLE');
        }
        
        next[editingSectionIndex] = {
          ...existingSection,
          label: sectionToSave.label,
          name: sectionToSave.name,
          editBy: sectionToSave.editBy,
          roleInSubject: sectionToSave.roleInSubject,
          isSubmittable: sectionToSave.isSubmittable,
          isToggleDependent: sectionToSave.isToggleDependent,
          displayOrder: sectionToSave.displayOrder,
          // Use updated fields (with toggle field handling)
          fields: updatedFields
        };
        return next;
      });
      toast.success('Section updated successfully');
    } else {
      // Add mode: Add new section
      // If isToggleDependent is true, automatically create a SECTION_CONTROL_TOGGLE field
      if (sectionToSave.isToggleDependent) {
        const toggleFieldName = `${sectionToSave.name.toLowerCase().replace(/\s+/g, '_')}_toggle`;
        const toggleField = {
          label: `${sectionToSave.label} Toggle`,
          fieldName: toggleFieldName,
          fieldType: 'SECTION_CONTROL_TOGGLE',
          roleRequired: sectionToSave.editBy || 'TRAINER',
          parentTempId: null
        };
        sectionToSave.fields = [toggleField];
      }
      
      setSections((prev) => [...prev, sectionToSave]);
      toast.success('Section added successfully');
    }
    
    setShowSectionModal(false);
    setEditingSectionIndex(null);
  };

  const handleRemoveSectionFromModal = () => {
    if (editingSectionIndex === null) return;
    
    const section = sections[editingSectionIndex];
    if (!section) return;
    
    // Confirm before removing
    if (window.confirm(`Are you sure you want to remove section "${section.label}"? This action cannot be undone.`)) {
      removeSection(editingSectionIndex);
      setShowSectionModal(false);
      setEditingSectionIndex(null);
      toast.success('Section removed successfully');
    }
  };

  // Load roles and filter to TRAINER/TRAINEE when opening section modal
  useEffect(() => {
    const loadRoles = async () => {
      try {
        // Use public API (no permission required)
        const data = await roleAPI.getPublicRoles();
        const roles = Array.isArray(data) ? data : [];
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
  
  // Notify parent about submit state changes
  useEffect(() => {
    if (onSubmittingChange) {
      onSubmittingChange(isSubmitting);
    }
  }, [isSubmitting, onSubmittingChange]);
  
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
      
      // Validate FINAL_SCORE_TEXT and FINAL_SCORE_NUM
      const allFields = sections.flatMap(s => s.fields || []);
      const finalScoreTextFields = allFields.filter(f => f.fieldType === 'FINAL_SCORE_TEXT');
      const finalScoreNumFields = allFields.filter(f => f.fieldType === 'FINAL_SCORE_NUM');
      
      // Must have at least 1 of either field
      if (finalScoreTextFields.length === 0 && finalScoreNumFields.length === 0) {
        toast.error('Template must have at least 1 FINAL_SCORE_TEXT or FINAL_SCORE_NUM field (or both)');
        setIsSubmitting(false);
        return;
      }
      
      // Cannot have more than 1 of each type
      if (finalScoreTextFields.length > 1) {
        toast.error(`Template must have at most 1 FINAL_SCORE_TEXT field. Found: ${finalScoreTextFields.length}`);
        setIsSubmitting(false);
        return;
      }
      
      if (finalScoreNumFields.length > 1) {
        toast.error(`Template must have at most 1 FINAL_SCORE_NUM field. Found: ${finalScoreNumFields.length}`);
        setIsSubmitting(false);
        return;
      }

      // Validate signatures based on roles
      // 1. Trainer can have one or more signature fields of either type (IMAGE or DRAW)
      const trainerSignatureFields = allFields.filter(f =>
        (f.fieldType === 'SIGNATURE_IMAGE' || f.fieldType === 'SIGNATURE_DRAW') &&
        f.roleRequired === 'TRAINER'
      );
      if (trainerSignatureFields.length === 0) { // Changed condition: check for at least one
        toast.error('Template must have at least one signature field (IMAGE or DRAW) for the TRAINER role.'); // Updated error message
        setIsSubmitting(false);
        return;
      }

      // 2. Trainee must have exactly one signature field of type DRAW
      const traineeSignatureFields = allFields.filter(f => 
        f.fieldType === 'SIGNATURE_DRAW' && 
        f.roleRequired === 'TRAINEE'
      );
      if (traineeSignatureFields.length !== 1) {
        toast.error('Template must have exactly one SIGNATURE_DRAW field for the TRAINEE role.');
        setIsSubmitting(false);
        return;
      }

      // Validate FINAL_SCORE_TEST fields
      const finalScoreTestFields = allFields.filter(f => f.fieldType === 'FINAL_SCORE_TEST');
      const hasFinalScoreNum = finalScoreNumFields.length > 0;
      const hasFinalScoreText = finalScoreTextFields.length > 0;
      // const hasBoth = hasFinalScoreNum && hasFinalScoreText;

      // TODO: Uncomment this validation when FINAL_SCORE_TEXT options UI is implemented
      // for (const testField of finalScoreTestFields) {
      //   // If both FINAL_SCORE_NUM and FINAL_SCORE_TEXT exist, options are not required
      //   if (hasBoth) {
      //     // Options not required - skip validation
      //     continue;
      //   }

      //   // If only FINAL_SCORE_TEXT exists (no FINAL_SCORE_NUM), options are required
      //   if (hasFinalScoreText && !hasFinalScoreNum) {
      //     if (!testField.option || !testField.option.trim()) {
      //       toast.error(`FINAL_SCORE_TEST field "${testField.label || testField.fieldName || testField.name}" requires options when only FINAL_SCORE_TEXT exists. Please provide options in JSON format: {"items": ["value1", "value2", ...]}`);
      //       setIsSubmitting(false);
      //       return;
      //     }

      //     // Validate options format
      //     try {
      //       const parsed = JSON.parse(testField.option);
      //       if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      //         toast.error(`FINAL_SCORE_TEST field "${testField.label || testField.fieldName || testField.name}" options must be a JSON object with a non-empty "items" array. Example: {"items": ["value1", "value2"]}`);
      //         setIsSubmitting(false);
      //         return;
      //       }
      //     } catch {
      //       toast.error(`FINAL_SCORE_TEST field "${testField.label || testField.fieldName || testField.name}" has invalid JSON format for options. Example: {"items": ["value1", "value2"]}`);
      //       setIsSubmitting(false);
      //       return;
      //     }
      //   }
      // }
      
      // Check if this is a create version flow (has originalTemplateId) or update draft (has currentTemplateId)
      const originalTemplateId = meta.originalTemplateId;
      const currentTemplateId = meta.currentTemplateId || localStorage.getItem('currentTemplateId');
      
      // Load existing fields if updating draft (to convert parentTempId → parentId)
      let existingFields = null;
      if (currentTemplateId && !originalTemplateId) {
        // Only load existing fields when updating draft (not creating new version or new template)
        try {
          console.log('📥 Loading existing draft fields for parentId conversion (Submit)...');
          const existingDraftResponse = await templateAPI.getTemplateById(currentTemplateId);
          const existingSections = existingDraftResponse?.data?.sections || 
                                  existingDraftResponse?.data?.data?.sections || [];
          // Flatten all fields from all sections
          existingFields = existingSections.flatMap(section => section.fields || []);
          console.log(`✅ Loaded ${existingFields.length} existing fields for conversion (Submit)`);
        } catch (loadError) {
          console.warn('⚠️ Failed to load existing draft fields, will use parentTempId:', loadError);
          // Continue without existingFields - will use parentTempId (for CREATE flow)
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
      
      // Pass existingFields to buildTemplatePayload for parentId conversion
      const basePayload = buildTemplatePayload(effectiveMeta, sections, existingFields);
      
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
      console.log('  🔄 Using existingFields for conversion:', existingFields ? 'Yes' : 'No');
      console.log('🧩 Full payload:\n', JSON.stringify(payload, null, 2));
      
      // Step: Validate fields from editor against Available Custom Fields
      // Only validate if templateConfigUrl exists (document has been saved)
      if (templateConfigUrl) {
        try {
          console.log('🔍 Validating fields from editor against Available Custom Fields...');
          console.log('  📄 Document URL:', templateConfigUrl);
          
          // Call extract-fields API with templateConfigUrl
          const extractResponse = await templateAPI.extractFields(templateConfigUrl);
          console.log('✅ Extract fields response:', extractResponse);
          
          // Validate extracted fields against payload fields (bidirectional)
          // Compare: fields in editor (extract-fields) vs fields in Available Custom Fields (payload)
          const validationResult = validateFields(extractResponse, payload.sections);
          
          console.log('🔍 Validation result:', {
            isValid: validationResult.isValid,
            missingInSchema: validationResult.missingInSchema,
            missingInDocument: validationResult.missingInDocument,
            totalExtractFields: validationResult.totalExtractFields,
            totalPayloadFields: validationResult.totalPayloadFields
          });
          
          if (!validationResult.isValid) {
            // Show error for fields in editor but not in Available Custom Fields (block submit)
            if (validationResult.missingInSchema.length > 0) {
              console.error('❌ Field validation failed - fields in editor but not in Available Custom Fields:', validationResult.missingInSchema);
              toast.error(validationResult.errorMessage);
              setIsSubmitting(false);
              return;
            }
            
            // Show error for fields in Available Custom Fields but not in editor (block submit)
            if (validationResult.missingInDocument.length > 0) {
              console.error('❌ Field validation failed - fields in Available Custom Fields but not in editor:', validationResult.missingInDocument);
              toast.error(validationResult.warningMessage); // Use warningMessage but show as error
              setIsSubmitting(false);
              return;
            }
          }
          
          if (validationResult.isValid) {
            console.log('✅ Field validation passed - all fields match between editor and Available Custom Fields');
          }
        } catch (extractError) {
          // If extract-fields API fails, log warning but continue with submit
          // (Don't block submit if API is unavailable)
          console.warn('⚠️ Failed to validate fields (extract-fields API error):', extractError);
          console.warn('⚠️ Continuing with submit without field validation');
          // Don't show error to user - just log warning
          // toast.warning('Could not validate fields from document. Proceeding with submit...');
        }
      } else {
        console.warn('⚠️ No templateConfigUrl available - skipping field validation');
      }
      
      if (originalTemplateId) {
        // CREATE NEW VERSION from published template
        console.log('🔄 Creating new version from published template:', originalTemplateId);
        const versionPayload = {
          originalTemplateId: originalTemplateId,
          ...payload
        };
        
        try {
          const res = await templateAPI.createVersion(versionPayload);
          toast.success('Template version created successfully');
          console.log('✅ Template version created:', res?.data ?? res);
          
          // Clear originalTemplateId after successful submit
          const updatedMeta = {
            ...meta,
            originalTemplateId: null
          };
          localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
          console.log('🗑️ Cleared originalTemplateId after version creation');
          
          // Navigate back to forms list after successful submit
          setTimeout(() => {
            navigate(ROUTES.TEMPLATES);
          }, 1500);
        } catch (versionError) {
          // Check if error is "Template name already exists"
          const errorMessage = versionError?.response?.data?.message || versionError?.message || '';
          const statusCode = versionError?.response?.statusCode || versionError?.response?.status;
          
          const isNameExistsError = statusCode === 400 && 
            (errorMessage.includes('already exists') || 
             errorMessage.includes('Template name') ||
             errorMessage.toLowerCase().includes('duplicate'));
          
          if (isNameExistsError) {
            // Retry without name - backend will auto-generate name
            console.log('⚠️ Template name already exists, retrying without name...');
            toast.warning('Template name already exists. System will auto-generate a new name...');
            
            // Create new payload without name
            const retryPayload = {
              originalTemplateId: originalTemplateId,
              description: payload.description,
              departmentId: payload.departmentId,
              templateContent: payload.templateContent,
              templateConfig: payload.templateConfig || null,
              status: payload.status,
              sections: payload.sections
              // Note: name is intentionally omitted - backend will auto-generate
            };
            
            try {
              const retryRes = await templateAPI.createVersion(retryPayload);
              toast.success('Template version created successfully with auto-generated name');
              console.log('✅ Template version created (retry):', retryRes?.data ?? retryRes);
              
              // Clear originalTemplateId after successful submit
              const updatedMeta = {
                ...meta,
                originalTemplateId: null
              };
              localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
              console.log('🗑️ Cleared originalTemplateId after version creation (retry)');
              
              // Navigate back to forms list after successful submit
              setTimeout(() => {
                navigate('/templates');
              }, 1500);
            } catch (retryError) {
              // If retry also fails, throw error to outer catch block
              console.error('❌ Retry failed:', retryError);
              throw retryError;
            }
          } else {
            // If error is not "name already exists", throw to outer catch block
            throw versionError;
          }
        }
      } else {
        // Use currentTemplateId already checked above
        if (currentTemplateId) {
          // UPDATE existing rejected template (submit)
          console.log('📝 Updating existing rejected template:', currentTemplateId);
          // Create a payload without the status field for the update-rejected endpoint
          const { status: removedStatus, ...payloadWithoutStatus } = payload; // Destructure to omit status
          const res = await apiClient.put(`/templates/update-rejected/${currentTemplateId}`, {
            ...payloadWithoutStatus,
            id: currentTemplateId,
            // The status is managed by the backend for rejected templates, so it's not sent from frontend.
          });
          toast.success('Template submitted successfully');
          console.log('✅ Rejected template updated and submitted:', res?.data ?? res);
          
          // Clear currentTemplateId after successful submit
          const updatedMeta = {
            ...meta,
            currentTemplateId: null
          };
          localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
          localStorage.removeItem('currentTemplateId');
          console.log('🗑️ Cleared currentTemplateId after submit');
          
          // Navigate back to forms list after successful submit
          setTimeout(() => {
            navigate(ROUTES.TEMPLATES);
          }, 1500);
        } else {
          // CREATE new template
          console.log('➕ Creating new template');
      const res = await apiClient.post('/templates', payload);
      toast.success('Template submitted successfully');
      console.log('✅ Backend response:', res?.data ?? res);
          
          // Navigate back to forms list after successful submit
          setTimeout(() => {
            navigate(ROUTES.TEMPLATES);
          }, 1500);
        }
      }
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
  
  // Determine current section being edited for field type filtering
  const currentSectionForField = editingSectionIndex !== null && editingSectionIndex < sections.length
    ? sections[editingSectionIndex]
    : null;
  
  const isTraineeSectionForField = currentSectionForField?.editBy === 'TRAINEE';

  const allFieldTypeOptions = [
    { value: 'TEXT', label: 'TEXT' },
    { value: 'TOGGLE', label: 'TOGGLE' },
    { value: 'IMAGE', label: 'IMAGE' },
    { value: 'PART', label: 'PART' },
    { value: 'SIGNATURE_DRAW', label: 'SIGNATURE_DRAW' },
    { value: 'SIGNATURE_IMAGE', label: 'SIGNATURE_IMAGE' },
    { value: 'FINAL_SCORE_TEXT', label: 'FINAL_SCORE_TEXT' },
    { value: 'FINAL_SCORE_NUM', label: 'FINAL_SCORE_NUM' },
    { value: 'VALUE_LIST', label: 'VALUE_LIST' },
  ];

  const traineeBlockedTypes = ['SIGNATURE_IMAGE', 'FINAL_SCORE_NUM', 'FINAL_SCORE_TEXT'];

  const availableFieldTypeOptions = isTraineeSectionForField
    ? allFieldTypeOptions.filter(option => !traineeBlockedTypes.includes(option.value))
    : allFieldTypeOptions;

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
          .section-body.section-drop-target { 
            background-color: rgba(0, 123, 255, 0.05) !important; 
            border: 2px dashed var(--bs-primary) !important; 
            border-radius: 0.375rem;
          }
          .section-header.section-header-drop-target {
            background-color: rgba(0, 123, 255, 0.1) !important;
            border: 2px dashed var(--bs-primary) !important;
            border-radius: 0.375rem;
          }
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
                    // Only handle section drag, ignore field drag
                    if (readOnly || sectionDragState.fromIndex === null) return;
                    // If dragging field, don't handle here (let Card.Header or Card.Body handle it)
                    if (dragState.sectionIndex !== null) return;
                    
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
                    // Only handle section drag, ignore field drag
                    if (readOnly || sectionDragState.fromIndex === null) return;
                    // If dragging field, don't handle here (let Card.Header or Card.Body handle it)
                    if (dragState.sectionIndex !== null) return;
                    
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
                    className={`d-flex justify-content-between align-items-center section-header ${collapsedSections[sIdx] && dragState.sectionIndex !== null && dragState.sectionIndex !== sIdx && dragState.targetSectionIndex === sIdx ? 'section-header-drop-target' : ''}`}
                    onClick={() => toggleSection(sIdx)}
                    aria-expanded={!collapsedSections[sIdx]}
                    onDragStart={(e) => e.stopPropagation()}
                    onDragOver={(e) => {
                      // Handle field drag into collapsed section header
                      if (readOnly || dragState.sectionIndex === null) return;
                      if (dragState.sectionIndex === sIdx) return; // Same section - no need to handle
                      if (!collapsedSections[sIdx]) return; // Only handle when collapsed

                      // NEW: Check if source and target sections have matching editBy roles
                      const sourceSection = sections[dragState.sectionIndex];
                      const targetSection = sections[sIdx];
                      if (sourceSection.editBy !== targetSection.editBy) {
                          // If roles don't match, do not allow drag over visual feedback
                          return; 
                      }
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Update target section index
                      if (dragState.targetSectionIndex !== sIdx) {
                        setDragState((prev) => ({ 
                          ...prev, 
                          targetSectionIndex: sIdx,
                          overIndex: section.fields?.length || 0,
                          position: 'below'
                        }));
                      }
                    }}
                    onDrop={(e) => {
                      // Handle field drop into collapsed section header
                      if (readOnly || dragState.sectionIndex === null || dragState.fromIndex === null) return;
                      if (dragState.sectionIndex === sIdx) return; // Same section - handled elsewhere
                      if (!collapsedSections[sIdx]) return; // Only handle when collapsed

                      // NEW: Check if source and target sections have matching editBy roles
                      const sourceSection = sections[dragState.sectionIndex];
                      const targetSection = sections[sIdx];
                      if (sourceSection.editBy !== targetSection.editBy) {
                          toast.warning('Cannot move fields between sections with different "Edit By" roles.');
                          setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null });
                          return; // Do not proceed with the drop
                      }
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Auto-expand section
                      setCollapsedSections((prev) => ({ ...prev, [sIdx]: false }));
                      
                      // Move field to end of target section
                      const toIndex = section.fields?.length || 0;
                      moveFieldBetweenSections(dragState.sectionIndex, dragState.fromIndex, sIdx, toIndex);
                      setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null });
                    }}
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
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditSection(sIdx)}
                        disabled={readOnly}
                        title="Edit Section"
                        className="text-primary border-primary"
                        style={{ padding: '0.25rem 0.4rem' }}
                      >
                        <Pencil size={12} />
                      </Button>
                    </div>
                  </Card.Header>
                  {!collapsedSections[sIdx] && (
                  <Card.Body 
                    className={`section-body ${dragState.sectionIndex !== null && dragState.sectionIndex !== sIdx && dragState.targetSectionIndex === sIdx ? 'section-drop-target' : ''}`}
                    onDragOver={(e) => {
                      // Allow dropping fields from other sections into empty section body
                      if (readOnly || dragState.sectionIndex === null) return;
                      if (dragState.sectionIndex === sIdx) return; // Same section - handled by field onDragOver

                      // NEW: Check if source and target sections have matching editBy roles
                      const sourceSection = sections[dragState.sectionIndex];
                      const targetSection = sections[sIdx];
                      if (sourceSection.editBy !== targetSection.editBy) {
                          // If roles don't match, do not allow drag over visual feedback
                          return;
                      }
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Update target section index
                      if (dragState.targetSectionIndex !== sIdx) {
                        setDragState((prev) => ({ 
                          ...prev, 
                          targetSectionIndex: sIdx,
                          overIndex: section.fields?.length || 0,
                          position: 'below'
                        }));
                      }
                    }}
                    onDrop={(e) => {
                      // Handle drop into empty section body or at the end of section
                      if (readOnly || dragState.sectionIndex === null || dragState.fromIndex === null) return;
                      if (dragState.sectionIndex === sIdx) return; // Same section - handled by field onDrop

                      // NEW: Check if source and target sections have matching editBy roles
                      const sourceSection = sections[dragState.sectionIndex];
                      const targetSection = sections[sIdx];
                      if (sourceSection.editBy !== targetSection.editBy) {
                          toast.warning('Cannot move fields between sections with different "Edit By" roles.');
                          setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null });
                          return; // Do not proceed with the drop
                      }
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Move field to end of target section
                      const toIndex = section.fields?.length || 0;
                      moveFieldBetweenSections(dragState.sectionIndex, dragState.fromIndex, sIdx, toIndex);
                      setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null });
                    }}
                    style={{ 
                      minHeight: dragState.sectionIndex !== null && dragState.sectionIndex !== sIdx && dragState.targetSectionIndex === sIdx ? '60px' : 'auto',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {section.fields && section.fields.length > 0 ? (
                      (() => {
                        // Create a map from field object reference to its actual index in section.fields
                        // This ensures we always get the correct index even after fields are removed
                        const fieldToIndexMap = new Map();
                        section.fields.forEach((f, idx) => {
                          // Use object reference as key to ensure uniqueness
                          fieldToIndexMap.set(f, idx);
                        });
                        
                        const allSorted = [...section.fields].sort((a, b) => a.displayOrder - b.displayOrder);
                        const parentIdOf = (f) => (f?.tempId || f?.fieldName || null);
                        const isChild = (f) => !!f.parentTempId;
                        const topLevel = allSorted.filter((f) => !isChild(f));

                        const renderRow = (field, realIndex) => {
                          const isPart = String(field.fieldType).toUpperCase() === 'PART';
                          return (
                          <div
                            key={`${sIdx}-${realIndex}`}
                            className={`p-2 p-md-2 rounded border mb-2 mb-md-2 draggable-item custom-field-item ${isPart ? 'bg-part part-card' : 'bg-white child-row'} ${dragState.sectionIndex !== null && dragState.targetSectionIndex === sIdx && dragState.overIndex === realIndex ? 'border-primary' : ''} ${dragState.sectionIndex !== null && dragState.targetSectionIndex === sIdx && dragState.overIndex === realIndex && dragState.position === 'above' ? 'drop-target-above' : ''} ${dragState.sectionIndex !== null && dragState.targetSectionIndex === sIdx && dragState.overIndex === realIndex && dragState.position === 'below' ? 'drop-target-below' : ''} ${dragState.sectionIndex === sIdx && dragState.fromIndex === realIndex ? 'dragging' : ''}`}
                            draggable
                            style={{ display: 'block', visibility: 'visible', opacity: 1, cursor: 'grab' }}
                            onDragStart={(e) => {
                              setDragState({ sectionIndex: sIdx, fromIndex: realIndex, overIndex: realIndex, position: 'above', targetSectionIndex: sIdx });
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const mid = rect.top + rect.height / 2;
                              const position = e.clientY < mid ? 'above' : 'below';
                              let targetIndex = realIndex;
                              if (position === 'below') targetIndex = realIndex + 1;
                              
                              // Handle both same section and cross-section drag
                              if (dragState.sectionIndex !== null) {
                                const isSameSection = dragState.sectionIndex === sIdx;
                                const shouldUpdate = isSameSection 
                                  ? (dragState.overIndex !== targetIndex || dragState.position !== position)
                                  : (dragState.targetSectionIndex !== sIdx || dragState.overIndex !== targetIndex || dragState.position !== position);
                                
                                if (shouldUpdate) {
                                  setDragState((prev) => ({ 
                                    ...prev, 
                                    overIndex: targetIndex, 
                                    position,
                                    targetSectionIndex: sIdx
                                  }));
                                }
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragState.sectionIndex === null || dragState.fromIndex === null) return;
                              
                              if (dragState.sectionIndex === sIdx) {
                                // Same section - reorder within section
                                const toIndex = Math.max(0, Math.min(dragState.overIndex, sections[sIdx]?.fields?.length || 0));
                                reorderWithinSection(sIdx, dragState.fromIndex, toIndex);
                              } else {
                                // Different section - move field between sections
                                const toIndex = Math.max(0, Math.min(dragState.overIndex, sections[sIdx]?.fields?.length || 0));
                                moveFieldBetweenSections(dragState.sectionIndex, dragState.fromIndex, sIdx, toIndex);
                              }
                              setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null });
                            }}
                            onDragEnd={() => setDragState({ sectionIndex: null, fromIndex: null, overIndex: null, position: 'above', targetSectionIndex: null })}
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
                                      // Get the actual index from the map using object reference, fallback to indexOf if not found
                                      const realIdx = fieldToIndexMap.get(child) ?? section.fields.indexOf(child);
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
                              // Get the actual index from the map using object reference, fallback to indexOf if not found
                              const realIndex = fieldToIndexMap.get(field) ?? section.fields.indexOf(field);
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
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" variant="light" style={{ width: '14px', height: '14px' }} />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span className="d-none d-sm-inline">Submit Template</span>
                <span className="d-inline d-sm-none">Submit</span>
              </>
            )}
          </Button>
      </div>

      {/* Add/Edit Section Modal */}
      <Modal show={showSectionModal} onHide={handleCloseModals} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingSectionIndex !== null ? 'Edit Section' : 'Add New Section'}</Modal.Title>
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
              {newSection.editBy === 'TRAINER' && (
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
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {editingSectionIndex !== null && (
            <Button 
              variant="outline-danger" 
              onClick={handleRemoveSectionFromModal}
              className="me-auto"
            >
              Remove Section
            </Button>
          )}
          <Button variant="outline-secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSection}>
            {editingSectionIndex !== null ? 'Update Section' : 'Save Section'}
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
                    {availableFieldTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
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
                    {availableFieldTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
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
