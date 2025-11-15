// Utility helpers to build template payload for backend

// Map frontend field types to backend-accepted field types
// Backend accepts: TEXT, IMAGE, TOGGLE, PART, SECTION_CONTROL_TOGGLE, SIGNATURE_DRAW, SIGNATURE_IMG, FINAL_SCORE_TEXT, FINAL_SCORE_NUM, VALUE_LIST
function mapFieldTypeToBackend(fieldType) {
  const typeUpper = String(fieldType || '').toUpperCase();
  
  // Special mapping: Frontend uses SIGNATURE_IMAGE, but backend expects SIGNATURE_IMG
  if (typeUpper === 'SIGNATURE_IMAGE') {
    return 'SIGNATURE_IMG';
  }
  
  // Backend-accepted types (return as-is)
  const acceptedTypes = [
    'TEXT',
    'IMAGE',
    'TOGGLE',
    'PART',
    'SECTION_CONTROL_TOGGLE',
    'SIGNATURE_DRAW',
    'SIGNATURE_IMG', // Backend uses SIGNATURE_IMG (not SIGNATURE_IMAGE)
    'FINAL_SCORE_TEXT',
    'FINAL_SCORE_NUM',
    'VALUE_LIST'
  ];
  
  if (acceptedTypes.includes(typeUpper)) {
    return fieldType; // Return original case
  }
  
  // If fieldType is not in acceptedTypes, return as-is (let backend validate)
  // No mapping/fallback - backend will handle validation
  return fieldType;
}

export function readTemplateMetaFromStorage() {
  try {
    const raw = localStorage.getItem('templateInfo');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || null, // Include template ID for update operations
        currentTemplateId: parsed.currentTemplateId || null, // Current draft template ID
        originalTemplateId: parsed.originalTemplateId || null, // Original template ID for create-version API
        name: parsed.name || '',
        description: parsed.description || '',
        departmentId: parsed.departmentId || '',
        templateContent: parsed.templateContent || '',
        templateConfig: parsed.templateConfig || null,
        templateContentMediaId: parsed.templateContentMediaId || null, // MediaId for deletion when replacing
        editorDocumentUrl: parsed.editorDocumentUrl || '' // For "File with fields"
      };
    }
  } catch {
    // ignore parse errors and fall back to individual keys
  }

  // Fallback: check localStorage for currentTemplateId and originalTemplateId
  const currentTemplateId = localStorage.getItem('currentTemplateId');
  const originalTemplateId = localStorage.getItem('originalTemplateId'); // Also check for originalTemplateId

  return {
    id: null,
    currentTemplateId: currentTemplateId || null,
    originalTemplateId: originalTemplateId || null,
    name: localStorage.getItem('templateName') || '',
    description: localStorage.getItem('templateDesc') || '',
    departmentId: localStorage.getItem('departmentId') || '',
    templateContent: localStorage.getItem('templateContent') || '',
    templateConfig: null,
    templateContentMediaId: null,
    editorDocumentUrl: ''
  };
}

export function buildTemplatePayload(meta, sections, existingFields = null) {
  // Build map: tempId → id (UUID) for PART fields from existing draft (when updating)
  // Format: { "apk-parent": "f6249b29-f13f-4095-a807-6de328cf7554", ... }
  const tempIdToUuidMap = {};
  if (existingFields && Array.isArray(existingFields)) {
    console.log(`📋 Existing fields count: ${existingFields.length}`);
    existingFields.forEach(field => {
      if (field.fieldType === 'PART' && field.id && field.fieldName) {
        const tempId = `${field.fieldName}-parent`;
        tempIdToUuidMap[tempId] = field.id;
        console.log(`🔗 Mapped PART field: tempId="${tempId}" → id="${field.id}"`);
      }
    });
    // Debug: Log all child fields with parentId
    const childFields = existingFields.filter(f => f.parentId);
    console.log(`📋 Child fields with parentId:`, childFields.map(f => ({
      fieldName: f.fieldName,
      fieldType: f.fieldType,
      parentId: f.parentId,
      id: f.id
    })));
  }

  const normalizedSections = (sections || []).map((section, sIdx) => {
    const rawFields = section.fields || [];
    // Ensure PART fields have a stable tempId and children reference that tempId
    const partIdMap = {};
    for (const f of rawFields) {
      if (String(f.fieldType || '').toUpperCase() === 'PART') {
        // Normalize: use fieldName or name
        const name = f.fieldName || f.name || '';
        const ensuredTempId = f.tempId || (name ? `${name}-parent` : undefined);
        if (ensuredTempId) partIdMap[name] = ensuredTempId;
      }
    }

    // Normalize children to point to PART tempIds when they referenced fieldName
    const normalized = rawFields.map((f) => {
      const parent = f.parentTempId;
      if (parent && partIdMap[parent]) {
        return { ...f, parentTempId: partIdMap[parent] };
      }
      return f;
    });

    // Compute visual order as rendered in UI: top-level by array order, then PART children right after their PART
    const indexed = normalized.map((f, i) => ({ ...f, __idx: i }));
    const topLevel = indexed
      .filter((f) => !f.parentTempId)
      .sort((a, b) => a.__idx - b.__idx);

    const inVisualOrder = [];
    for (const top of topLevel) {
      inVisualOrder.push(top);
      const pid = (String(top.fieldType || '').toUpperCase() === 'PART')
        ? (top.tempId || partIdMap[top.fieldName || top.name || ''] || ((top.fieldName || top.name) ? `${top.fieldName || top.name}-parent` : undefined))
        : null;
      if (pid) {
        const children = indexed
          .filter((f) => f.parentTempId === pid)
          .sort((a, b) => a.__idx - b.__idx);
        inVisualOrder.push(...children);
      }
    }

    // Fallback: if some items were not included (edge cases), append them by array order
    if (inVisualOrder.length !== indexed.length) {
      const seen = new Set(inVisualOrder.map((f) => f.__idx));
      indexed
        .filter((f) => !seen.has(f.__idx))
        .sort((a, b) => a.__idx - b.__idx)
        .forEach((f) => inVisualOrder.push(f));
    }

    const fields = inVisualOrder.map((f, fIdx) => {
      const isSignature = String(f.fieldType || '').toUpperCase().startsWith('SIGNATURE');
      const fieldTypeUpper = String(f.fieldType || '').toUpperCase();
      
      // Map fieldType to backend-accepted type
      const backendFieldType = mapFieldTypeToBackend(f.fieldType);
      
      // Normalize fieldName: Some fields use 'name' property, others use 'fieldName'
      // Backend requires 'fieldName', so use 'name' as fallback if 'fieldName' is missing
      const fieldName = f.fieldName || f.name || '';
      
      if (!fieldName) {
        console.warn('⚠️ Field missing fieldName/name:', f);
      }
      
      const base = {
        label: f.label,
        fieldName: fieldName, // Ensure fieldName is always present
        fieldType: backendFieldType, // Use mapped field type for backend
        displayOrder: fIdx + 1
      };
      
      // Handle parent-child relationship
      if (existingFields) {
        // UPDATE mode: Keep parentTempId (string) like CREATE, but also add id (UUID) for all fields
        // Backend accepts parentTempId for UPDATE, but needs id to identify existing fields
        
        // First, add parentTempId (keep same format as CREATE)
        base.parentTempId = f.parentTempId ? f.parentTempId : null;
        
        // Then, add id (UUID) for child field if it exists in existingFields
        if (f.parentTempId && tempIdToUuidMap[f.parentTempId]) {
          // Child field: find by fieldName, fieldType (parentId may be null in existingFields)
          // Try to find by fieldName and fieldType (parentId may be null in backend response)
          let existingChildField = existingFields.find(
            ef => ef.fieldName === fieldName && 
                  ef.fieldType === backendFieldType &&
                  ef.id
          );
          
          if (existingChildField && existingChildField.id) {
            base.id = existingChildField.id;
            console.log(`🔗 Added id="${base.id}" for child field "${fieldName}" (parentTempId="${f.parentTempId}") (for update)`);
          } else {
            console.warn(`⚠️ Could not find existing child field: fieldName="${fieldName}", fieldType="${backendFieldType}"`);
          }
        } else {
          // Top-level field (no parent): add id (UUID) if exists
          const existingField = existingFields.find(
            ef => ef.fieldName === fieldName && 
                  ef.fieldType === backendFieldType &&
                  !ef.parentId && // Top-level field (not a child)
                  ef.id
          );
          if (existingField && existingField.id) {
            base.id = existingField.id;
            console.log(`🔗 Added id="${base.id}" for top-level field "${fieldName}" (for update)`);
          }
        }
      } else {
        // CREATE mode: use parentTempId (string) for child fields
        base.parentTempId = f.parentTempId ? f.parentTempId : null;
      }
      
      if (isSignature) {
        base.roleRequired = f.roleRequired || 'TRAINER';
      }
      if (fieldTypeUpper === 'PART') {
        // ensure PART tempId exists and is stable
        const partName = fieldName || '';
        base.tempId = f.tempId || (partName ? `${partName}-parent` : undefined);
        
        // When updating draft: add id (UUID) for PART field so backend can match with child fields' parentId
        if (existingFields) {
          const existingPartField = existingFields.find(
            ef => ef.fieldType === 'PART' && 
                  (ef.fieldName === fieldName || ef.fieldName === f.name) &&
                  ef.id
          );
          if (existingPartField && existingPartField.id) {
            base.id = existingPartField.id;
            console.log(`🔗 Added id="${base.id}" for PART field "${fieldName}" (for update)`);
          }
        }
      }
      // Add options for VALUE_LIST fields (backend expects "options" object with "items" array)
      if (fieldTypeUpper === 'VALUE_LIST') {
        // Debug: Log field to see if option exists
        console.log('🔍 VALUE_LIST field found:', {
          fieldName: fieldName,
          label: f.label,
          hasOption: !!f.option,
          option: f.option,
          optionType: typeof f.option
        });
        
        if (f.option) {
          try {
            // Parse and validate JSON, then extract items array
            const parsed = JSON.parse(f.option);
            if (parsed.items && Array.isArray(parsed.items)) {
              // Backend expects "options" object with "items" array inside
              base.options = { items: parsed.items };
              console.log('✅ VALUE_LIST options parsed successfully:', base.options);
            } else {
              console.warn('⚠️ VALUE_LIST option missing items array:', parsed);
            }
          } catch (e) {
            // If parsing fails, skip options (should not happen if validation worked)
            console.warn('❌ Failed to parse VALUE_LIST option:', e, 'Raw option:', f.option);
          }
        } else {
          console.warn('⚠️ VALUE_LIST field missing option field:', {
            fieldName: fieldName,
            label: f.label,
            field: f
          });
        }
      }
      return base;
    });

    return {
      label: section.label,
      displayOrder: sIdx + 1, // Calculate displayOrder based on array index at submit time
      editBy: section.editBy || 'TRAINER',
      roleInSubject: section.roleInSubject ? section.roleInSubject : null,
      isSubmittable: Boolean(section.isSubmittable),
      isToggleDependent: Boolean(section.isToggleDependent),
      fields
    };
  });

  // Build top-level with explicit key order
  return {
    name: meta.name,
    description: meta.description,
    departmentId: meta.departmentId,
    templateContent: meta.templateContent,
    templateConfig: meta.templateConfig || null,
    sections: normalizedSections
  };
}

// Convert backend sections/fields format → frontend format
// Used when loading drafts to restore editor state
export function convertBackendToFrontendSections(backendSections) {
  if (!Array.isArray(backendSections)) {
    return [];
  }

  return backendSections.map((section) => {
    // Build map: parentId (UUID) → tempId (string) for PART fields
    const partFields = (section.fields || []).filter(f => f.fieldType === 'PART');
    const partIdMap = {}; // Map: { parentId (UUID): tempId (string) }
    
    partFields.forEach(partField => {
      // Backend: partField.id = UUID
      // Frontend: tempId = "{fieldName}-parent"
      const tempId = `${partField.fieldName}-parent`;
      partIdMap[partField.id] = tempId;
    });
    
    // Convert fields
    const fields = (section.fields || []).map((field) => {
      // Map backend fieldType to frontend fieldType
      // Backend uses SIGNATURE_IMG, but frontend uses SIGNATURE_IMAGE
      let frontendFieldType = field.fieldType || 'TEXT';
      if (frontendFieldType === 'SIGNATURE_IMG') {
        frontendFieldType = 'SIGNATURE_IMAGE';
      }
      
      const frontendField = {
        label: field.label || '',
        fieldName: field.fieldName || '',
        fieldType: frontendFieldType, // Map SIGNATURE_IMG → SIGNATURE_IMAGE
        roleRequired: field.roleRequired || null,
        parentTempId: null, // Will be set below
        option: null // Will be set below for VALUE_LIST
      };
      
      // Convert parentId (UUID) → parentTempId (string)
      if (field.parentId) {
        // Find PART field with id = field.parentId
        const parentField = section.fields.find(f => f.id === field.parentId);
        if (parentField && parentField.fieldType === 'PART') {
          // Generate tempId from fieldName
          frontendField.parentTempId = `${parentField.fieldName}-parent`;
        }
      }
      
      // Add tempId for PART fields
      if (field.fieldType === 'PART') {
        frontendField.tempId = `${field.fieldName}-parent`;
      }
      
      // Convert options (object) → option (JSON string) for VALUE_LIST
      if (field.fieldType === 'VALUE_LIST' && field.options) {
        try {
          frontendField.option = JSON.stringify(field.options);
        } catch (e) {
          console.warn('Failed to stringify VALUE_LIST options:', e);
        }
      }
      
      return frontendField;
    });
    
    return {
      name: section.label || section.name || '', // Frontend needs name (use label)
      label: section.label || section.name || '',
      displayOrder: section.displayOrder || 1,
      editBy: section.editBy || 'TRAINER',
      roleInSubject: section.roleInSubject || '',
      isSubmittable: Boolean(section.isSubmittable),
      isToggleDependent: Boolean(section.isToggleDependent),
      fields: fields
    };
  });
}


