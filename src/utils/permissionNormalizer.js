/**
 * Permission Name Normalizer
 * 
 * Handles normalization and matching of permission names
 * BE returns permission names like "View All Users"
 * Code might reference them in different formats
 */

/**
 * Normalize permission name for comparison
 * Handles variations in naming, case, spacing, etc.
 * 
 * @param {string} permissionName - Permission name to normalize
 * @returns {string} Normalized permission name
 */
export const normalizePermissionName = (permissionName) => {
  if (!permissionName || typeof permissionName !== 'string') {
    return '';
  }
  
  return permissionName
    .trim()
    .toLowerCase()
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Remove special characters for comparison
    .replace(/[^\w\s]/g, '');
};

/**
 * Check if two permission names match (with normalization)
 * 
 * @param {string} name1 - First permission name
 * @param {string} name2 - Second permission name
 * @returns {boolean} True if names match
 */
export const permissionNamesMatch = (name1, name2) => {
  if (!name1 || !name2) return false;
  return normalizePermissionName(name1) === normalizePermissionName(name2);
};

/**
 * Find permission name variations
 * Handles common variations like:
 * - "View All Users" vs "View Users" vs "List Users"
 * - "Create User" vs "Add User"
 * - "Update User" vs "Edit User"
 * 
 * @param {string} permissionName - Permission name to find variations for
 * @returns {string[]} Array of possible variations
 */
export const getPermissionVariations = (permissionName) => {
  const normalized = normalizePermissionName(permissionName);
  const variations = [permissionName]; // Include original
  
  // Common synonym mappings
  const synonyms = {
    'view': ['view', 'list', 'see', 'show', 'display'],
    'all': ['all', 'list'],
    'create': ['create', 'add', 'new'],
    'update': ['update', 'edit', 'modify', 'change'],
    'delete': ['delete', 'remove', 'archive'],
    'enable': ['enable', 'activate'],
    'disable': ['disable', 'deactivate'],
    'detail': ['detail', 'details', 'info', 'information'],
    'user': ['user', 'users'],
    'role': ['role', 'roles'],
    'course': ['course', 'courses'],
    'subject': ['subject', 'subjects'],
    'department': ['department', 'departments'],
    'assessment': ['assessment', 'assessments'],
    'template': ['template', 'templates'],
    'report': ['report', 'reports'],
    'field': ['field', 'fields']
  };
  
  // Generate variations based on synonyms
  // This is a simplified version - can be expanded
  return variations;
};

/**
 * Match permission name against a list of permissions
 * Handles fuzzy matching and variations
 * 
 * @param {string} permissionName - Permission name to match
 * @param {string[]} permissionList - List of permission names to match against
 * @returns {string|null} Matched permission name or null
 */
export const matchPermissionName = (permissionName, permissionList) => {
  if (!permissionName || !permissionList || permissionList.length === 0) {
    return null;
  }
  
  const normalized = normalizePermissionName(permissionName);
  
  // Exact match
  for (const perm of permissionList) {
    if (permissionNamesMatch(permissionName, perm)) {
      return perm;
    }
  }
  
  // Fuzzy match - check if normalized name contains key parts
  // BUT: Only match if ALL key words are present (strict matching)
  const keyWords = normalized.split(' ').filter(word => word.length > 2);
  
  if (keyWords.length === 0) {
    return null;
  }
  
  for (const perm of permissionList) {
    const normalizedPerm = normalizePermissionName(perm);
    
    // Strict matching: ALL keywords must be present
    const allWordsMatch = keyWords.every(word => normalizedPerm.includes(word));
    
    // Also check: permission should not be too different in length
    // (avoid matching "View All Users" with "View User" if they're too different)
    const lengthDiff = Math.abs(normalizedPerm.length - normalized.length);
    const maxLengthDiff = Math.max(normalized.length * 0.3, 5); // Allow 30% difference or 5 chars
    
    if (allWordsMatch && lengthDiff <= maxLengthDiff) {
      return perm;
    }
  }
  
  return null;
};

/**
 * Extract key words from permission name
 * Useful for searching or matching
 * 
 * @param {string} permissionName - Permission name
 * @returns {string[]} Array of key words
 */
export const extractKeyWords = (permissionName) => {
  if (!permissionName) return [];
  
  const normalized = normalizePermissionName(permissionName);
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return normalized
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));
};

/**
 * Check if permission name contains specific keywords
 * 
 * @param {string} permissionName - Permission name to check
 * @param {string[]} keywords - Keywords to search for
 * @returns {boolean} True if all keywords are found
 */
export const permissionContainsKeywords = (permissionName, keywords) => {
  if (!permissionName || !keywords || keywords.length === 0) {
    return false;
  }
  
  const normalized = normalizePermissionName(permissionName);
  const normalizedKeywords = keywords.map(k => normalizePermissionName(k));
  
  return normalizedKeywords.every(keyword => normalized.includes(keyword));
};

/**
 * Group permissions by action type
 * Actions: view, create, update, delete, enable, disable, etc.
 * 
 * @param {string[]} permissionNames - Array of permission names
 * @returns {Object} Grouped permissions by action
 */
export const groupPermissionsByAction = (permissionNames) => {
  const groups = {
    view: [],
    create: [],
    update: [],
    delete: [],
    enable: [],
    disable: [],
    other: []
  };
  
  const actionPatterns = {
    view: /^(view|list|see|show|display|get)/i,
    create: /^(create|add|new|make)/i,
    update: /^(update|edit|modify|change)/i,
    delete: /^(delete|remove|archive)/i,
    enable: /^(enable|activate)/i,
    disable: /^(disable|deactivate)/i
  };
  
  permissionNames.forEach(perm => {
    let grouped = false;
    for (const [action, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(perm)) {
        groups[action].push(perm);
        grouped = true;
        break;
      }
    }
    if (!grouped) {
      groups.other.push(perm);
    }
  });
  
  return groups;
};

