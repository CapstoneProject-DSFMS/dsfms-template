/**
 * Field Validator Utility
 * Validates fields extracted from document against template schema
 */

/**
 * Create a unique key for field comparison
 * Format: "fieldName|parentTempId"
 * Note: fieldType is excluded because extract-fields API may not return accurate fieldType
 */
export function createFieldKey(field) {
  const fieldName = (field.fieldName || '').trim();
  const parentTempId = field.parentTempId || null;
  
  return `${fieldName}|${parentTempId || 'null'}`;
}

/**
 * Flatten fields from payload sections
 * @param {Array} sections - Sections array from buildTemplatePayload
 * @returns {Array} Flat array of fields with fieldName, fieldType, parentTempId
 */
export function flattenPayloadFields(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }
  
  return sections.flatMap(section => {
    const fields = section.fields || [];
    return fields.map(field => {
      // Handle both 'fieldName' and 'name' properties (for backward compatibility)
      // buildTemplatePayload uses: fieldName || name
      const fieldName = (field.fieldName || field.name || '').trim();
      const fieldType = (field.fieldType || '').trim();
      const parentTempId = field.parentTempId || null;
      
      return {
        fieldName,
        fieldType,
        parentTempId
      };
    });
  });
}

/**
 * Normalize extract-fields response
 * Handles different response structures from extract-fields API
 * @param {Object|Array} extractResponse - Response from extract-fields API
 * @returns {Array} Normalized array of fields
 */
export function normalizeExtractFields(extractResponse) {
  let fields = [];
  
  // Handle different response structures
  if (Array.isArray(extractResponse)) {
    fields = extractResponse;
  } else if (extractResponse?.fields && Array.isArray(extractResponse.fields)) {
    fields = extractResponse.fields;
  } else if (extractResponse?.data?.fields && Array.isArray(extractResponse.data.fields)) {
    fields = extractResponse.data.fields;
  } else if (extractResponse?.data && Array.isArray(extractResponse.data)) {
    fields = extractResponse.data;
  }
  
  // Normalize each field
  return fields.map(field => ({
    fieldName: (field.fieldName || '').trim(),
    fieldType: (field.fieldType || '').trim(),
    parentTempId: field.parentTempId || null
  }));
}

/**
 * Validate extracted fields against payload fields (bidirectional)
 * @param {Array} extractFields - Fields from extract-fields API (fields in editor)
 * @param {Array} payloadFields - Fields from buildTemplatePayload (fields in Available Custom Fields)
 * @returns {Object} Validation result with isValid, missingInDocument, missingInSchema, and messages
 */
export function validateFields(extractFields, payloadFields) {
  // Normalize extract fields
  const normalizedExtract = normalizeExtractFields(extractFields);
  
  // Flatten payload fields
  const flattenedPayload = flattenPayloadFields(payloadFields);
  
  // Debug: Log all fields for comparison
  console.log('🔍 [Field Validator] Debug Info:');
  console.log('  📋 Normalized Extract Fields:', normalizedExtract);
  console.log('  📋 Flattened Payload Fields:', flattenedPayload);
  
  // Create Sets for O(1) lookup
  const payloadKeys = new Set(
    flattenedPayload.map(createFieldKey)
  );
  const extractKeys = new Set(
    normalizedExtract.map(createFieldKey)
  );
  
  // Debug: Log all keys
  console.log('  🔑 Payload Keys:', Array.from(payloadKeys));
  console.log('  🔑 Extract Keys:', Array.from(extractKeys));
  
  // Find fields in extract but not in payload (fields added directly in editor but not in Available Custom Fields)
  const missingInSchema = normalizedExtract.filter(extractField => {
    const key = createFieldKey(extractField);
    const found = payloadKeys.has(key);
    if (!found) {
      console.log(`  ❌ Missing in Schema: ${key} (fieldName: ${extractField.fieldName}, fieldType: ${extractField.fieldType}, parentTempId: ${extractField.parentTempId})`);
    }
    return !found;
  });
  
  // Find fields in payload but not in extract (fields in Available Custom Fields but not inserted into editor)
  const missingInDocument = flattenedPayload.filter(payloadField => {
    const key = createFieldKey(payloadField);
    const found = extractKeys.has(key);
    if (!found) {
      console.log(`  ⚠️ Missing in Document: ${key} (fieldName: ${payloadField.fieldName}, fieldType: ${payloadField.fieldType}, parentTempId: ${payloadField.parentTempId})`);
    }
    return !found;
  });
  
  // Remove duplicates by fieldName
  const uniqueMissingInSchema = [...new Set(missingInSchema.map(f => f.fieldName))];
  const uniqueMissingInDocument = [...new Set(missingInDocument.map(f => f.fieldName))];
  
  // Validation fails if:
  // 1. Fields in editor but not in Available Custom Fields (invalid fields)
  // 2. Fields in Available Custom Fields but not in editor (missing required fields)
  const isValid = missingInSchema.length === 0 && missingInDocument.length === 0;
  
  // Build error messages
  let errorMessage = '';
  let warningMessage = '';
  
  // Error: Fields in editor but not in Available Custom Fields
  if (missingInSchema.length > 0) {
    if (uniqueMissingInSchema.length === 1) {
      errorMessage = `Field "${uniqueMissingInSchema[0]}" is not in the Available Custom Fields. Please remove it from the editor or add it through the side panel.`;
    } else {
      errorMessage = `The following fields are not in the Available Custom Fields: ${uniqueMissingInSchema.join(', ')}. Please remove them from the editor or add them through the side panel.`;
    }
  }
  
  // Warning: Fields in Available Custom Fields but not in editor
  if (missingInDocument.length > 0) {
    if (uniqueMissingInDocument.length === 1) {
      warningMessage = `Field "${uniqueMissingInDocument[0]}" is in the Available Custom Fields but not found in the editor. Please insert it into the editor using the "Insert Field" button.`;
    } else {
      warningMessage = `The following fields are in the Available Custom Fields but not found in the editor: ${uniqueMissingInDocument.join(', ')}. Please insert them into the editor using the "Insert Field" button.`;
    }
  }
  
  return {
    isValid,
    missingInSchema: uniqueMissingInSchema, // Fields in editor but not in Available Custom Fields (ERROR)
    missingInDocument: uniqueMissingInDocument, // Fields in Available Custom Fields but not in editor (WARNING)
    errorMessage,
    warningMessage,
    totalExtractFields: normalizedExtract.length,
    totalPayloadFields: flattenedPayload.length
  };
}

