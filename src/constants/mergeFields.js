// Default merge fields configuration
export const DEFAULT_MERGE_FIELDS = [
  { name: 'customer_name', label: 'Customer Name', category: 'customer' },
  { name: 'invoice_total', label: 'Invoice Total', category: 'financial' },
  { name: 'invoice_date', label: 'Invoice Date', category: 'date' },
  { name: 'company_name', label: 'Company Name', category: 'company' },
  { name: 'address', label: 'Address', category: 'location' },
  { name: 'phone', label: 'Phone', category: 'contact' },
  { name: 'email', label: 'Email', category: 'contact' },
  { name: 'signature', label: 'Signature', category: 'signature' }
];

// Extended merge fields for different use cases
export const EXTENDED_MERGE_FIELDS = [
  ...DEFAULT_MERGE_FIELDS,
  { name: 'first_name', label: 'First Name', category: 'customer' },
  { name: 'last_name', label: 'Last Name', category: 'customer' },
  { name: 'middle_name', label: 'Middle Name', category: 'customer' },
  { name: 'date_of_birth', label: 'Date of Birth', category: 'date' },
  { name: 'gender', label: 'Gender', category: 'personal' },
  { name: 'nationality', label: 'Nationality', category: 'personal' },
  { name: 'id_number', label: 'ID Number', category: 'identification' },
  { name: 'passport_number', label: 'Passport Number', category: 'identification' },
  { name: 'tax_id', label: 'Tax ID', category: 'financial' },
  { name: 'bank_account', label: 'Bank Account', category: 'financial' },
  { name: 'emergency_contact', label: 'Emergency Contact', category: 'contact' },
  { name: 'emergency_phone', label: 'Emergency Phone', category: 'contact' },
  { name: 'course_name', label: 'Course Name', category: 'academic' },
  { name: 'course_code', label: 'Course Code', category: 'academic' },
  { name: 'instructor_name', label: 'Instructor Name', category: 'academic' },
  { name: 'grade', label: 'Grade', category: 'academic' },
  { name: 'completion_date', label: 'Completion Date', category: 'date' },
  { name: 'certificate_number', label: 'Certificate Number', category: 'academic' }
];

// Merge field categories
export const MERGE_FIELD_CATEGORIES = {
  customer: { label: 'Customer Info', icon: '👤', color: '#007bff' },
  financial: { label: 'Financial', icon: '💰', color: '#28a745' },
  date: { label: 'Dates', icon: '📅', color: '#ffc107' },
  company: { label: 'Company', icon: '🏢', color: '#6f42c1' },
  location: { label: 'Location', icon: '📍', color: '#fd7e14' },
  contact: { label: 'Contact', icon: '📞', color: '#20c997' },
  signature: { label: 'Signature', icon: '✍️', color: '#dc3545' },
  personal: { label: 'Personal', icon: '👤', color: '#6c757d' },
  identification: { label: 'ID', icon: '🆔', color: '#17a2b8' },
  academic: { label: 'Academic', icon: '📚', color: '#e83e8c' }
};

// Helper functions
export const getMergeFieldsByCategory = (category) => {
  return EXTENDED_MERGE_FIELDS.filter(field => field.category === category);
};

export const getMergeFieldByName = (name) => {
  return EXTENDED_MERGE_FIELDS.find(field => field.name === name);
};

export const formatMergeField = (fieldName) => {
  return `{{${fieldName}}}`;
};

export const parseMergeFields = (content) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      field: match[1],
      fullMatch: match[0],
      index: match.index
    });
  }
  
  return matches;
};
