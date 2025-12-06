import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Table, Row, Col, Card, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Pencil, Trash, Download } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import { userAPI } from '../../../api/user.js';
import { roleAPI } from '../../../api/role.js';

const BulkImportModal = ({ show, onClose, onImport, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Required columns for user import
  const requiredColumns = [
    'first_name',
    'last_name', 
    'email',
    'role'
  ];

  // All possible columns
  const allColumns = [
    'first_name',
    'middle_name',
    'last_name',
    'address',
    'email',
    'phone_number',
    'avatar_url',
    'gender',
    'role',
    'certification_number',
    'specialization',
    'years_of_experience',
    'bio',
    'date_of_birth',
    'enrollment_date',
    'training_batch',
    'passport_no',
    'nation'
  ];


  // Fetch roles when modal opens
  useEffect(() => {
    if (show) {
      fetchRoles();
    }
  }, [show]);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      // Use public API (no permission required)
      const rolesArray = await roleAPI.getPublicRoles();
      
      console.log('📦 Roles fetched from public API:', {
        rolesCount: rolesArray.length,
        roles: rolesArray.map(r => ({ id: r.id, name: r.name }))
      });
      
      setRoles(rolesArray);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setErrors(['Failed to load roles. Please refresh the page.']);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  // Normalize text to ensure proper Vietnamese character display
  const normalizeText = (text) => {
    if (!text) return '';
    
    // Ensure proper UTF-8 encoding
    try {
      // Decode any potential encoding issues
      const decoded = decodeURIComponent(escape(text));
      return decoded.trim();
    } catch (error) {
      // If decoding fails, return original text
      return text.toString().trim();
    }
  };

  // Format date to ISO string
  const formatDateToISO = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Handle different date formats
      let date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      } else {
        // Try to parse the date string
        const dateStr = dateString.toString().trim();
        
        // Skip empty or invalid strings
        if (!dateStr || dateStr === '' || dateStr === 'null' || dateStr === 'undefined') {
          return '';
        }
        
        // Handle common date formats
        if (dateStr.includes('/')) {
          // Format: MM/DD/YYYY or DD/MM/YYYY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Assume MM/DD/YYYY format
            date = new Date(parts[2], parts[0] - 1, parts[1]);
          }
        } else if (dateStr.includes('-')) {
          // Format: YYYY-MM-DD or DD-MM-YYYY
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              // YYYY-MM-DD format
              date = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              // DD-MM-YYYY format
              date = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          }
        } else {
          // Try direct parsing
          date = new Date(dateStr);
        }
      }
      
      // Check if date is valid and not too far in the past/future
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Check for reasonable date range (1900-2100)
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) {
        return '';
      }
      
      // Return ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
      return date.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return '';
    }
  };

  // Smart gender mapping function - simplified
  const normalizeGender = (genderValue) => {
    if (!genderValue) return 'MALE'; // Default value
    
    const normalized = genderValue.toString().toUpperCase().trim();
    
    // Direct matches
    if (normalized === 'MALE' || normalized === 'FEMALE') {
      return normalized;
    }
    
    // Simple gender mapping
    const genderMapping = {
      'M': 'MALE',
      'F': 'FEMALE'
    };
    
    return genderMapping[normalized] || 'MALE'; // Default to MALE if not recognized
  };

  // Validate gender input and return error message if invalid
  const validateGender = (genderValue) => {
    if (!genderValue) return null; // Empty is allowed (will use default)
    
    const normalized = genderValue.toString().toUpperCase().trim();
    
    // Valid values - simplified
    const validValues = ['MALE', 'FEMALE', 'M', 'F'];
    
    if (validValues.includes(normalized)) {
      return null; // Valid
    }
    
    return `Invalid gender value. Accepted values: MALE, FEMALE, M, F`;
  };

  // Helper function to normalize role name for comparison
  // Converts spaces to underscores and uppercases
  const normalizeRoleName = (name) => {
    if (!name) return '';
    return name.toString().toUpperCase().trim().replace(/\s+/g, '_');
  };

  // Smart role mapping function
  const findRoleId = (roleName) => {
    if (!roleName || !roles.length) {
      console.warn('⚠️ findRoleId: No roleName or roles not loaded', { roleName, rolesCount: roles.length });
      return null;
    }
    
    const normalizedInput = normalizeRoleName(roleName);
    
    console.log('🔍 Finding role:', { 
      input: roleName, 
      normalized: normalizedInput,
      availableRoles: roles.map(r => ({ 
        name: r.name, 
        normalized: normalizeRoleName(r.name),
        id: r.id
      }))
    });
    
    // Direct match first - normalize both input and role names
    // This should match "DEPARTMENT_HEAD" with "DEPARTMENT HEAD" after normalization
    const directMatch = roles.find(role => {
      const normalizedRoleName = normalizeRoleName(role.name);
      const isMatch = normalizedRoleName === normalizedInput;
      if (isMatch) {
        console.log('✅ Direct match:', {
          input: roleName,
          inputNormalized: normalizedInput,
          dbRole: role.name,
          dbRoleNormalized: normalizedRoleName,
          match: isMatch
        });
      }
      return isMatch;
    });
    
    if (directMatch) {
      console.log('✅ Direct match found:', directMatch.name, directMatch.id);
      return directMatch.id;
    }
    
    // If direct match fails, try partial match (for variations like ADMIN -> ADMINISTRATOR)
    // But first, let's check if the issue is with normalization
    console.log('⚠️ Direct match failed, checking normalization...');
    roles.forEach(role => {
      const normalizedRoleName = normalizeRoleName(role.name);
      if (normalizedRoleName === normalizedInput) {
        console.log('🔍 Found potential match:', {
          input: roleName,
          inputNormalized: normalizedInput,
          dbRole: role.name,
          dbRoleNormalized: normalizedRoleName,
          match: normalizedRoleName === normalizedInput
        });
      }
    });
    
    // Partial match for common variations (only for special cases like ADMIN -> ADMINISTRATOR)
    const partialMatches = {
      'ADMIN': 'ADMINISTRATOR',
      'ADMINISTRATOR': 'ADMINISTRATOR',
      'TRAINER': 'TRAINER',
      'TRAINEE': 'TRAINEE'
      // Removed DEPARTMENT_HEAD, SQA_AUDITOR, ACADEMIC_DEPARTMENT mappings
      // because they should be handled by direct match after normalization
    };
    
    const mappedName = partialMatches[normalizedInput];
    if (mappedName) {
      const mappedRole = roles.find(role => {
        const normalizedRoleName = normalizeRoleName(role.name);
        return normalizedRoleName === mappedName;
      });
      if (mappedRole) {
        console.log('✅ Partial match found:', mappedRole.name, mappedRole.id);
        return mappedRole.id;
      }
    }
    
    // Fuzzy match - normalize both sides for comparison (fallback)
    const fuzzyMatch = roles.find(role => {
      const normalizedRoleName = normalizeRoleName(role.name);
      const isFuzzyMatch = normalizedRoleName.includes(normalizedInput) ||
                           normalizedInput.includes(normalizedRoleName);
      if (isFuzzyMatch) {
        console.log('🔍 Fuzzy match candidate:', {
          input: roleName,
          inputNormalized: normalizedInput,
          dbRole: role.name,
          dbRoleNormalized: normalizedRoleName
        });
      }
      return isFuzzyMatch;
    });
    
    if (fuzzyMatch) {
      console.log('✅ Fuzzy match found:', fuzzyMatch.name, fuzzyMatch.id);
      return fuzzyMatch.id;
    }
    
    console.warn('❌ No role match found for:', {
      input: roleName,
      normalized: normalizedInput,
      availableRoles: roles.map(r => ({
        name: r.name,
        normalized: normalizeRoleName(r.name)
      }))
    });
    return null;
  };

  // Get actual role name from system
  const getActualRoleName = (roleName) => {
    if (!roleName || !roles.length) return null;
    
    const normalizedInput = normalizeRoleName(roleName);
    
    // Direct match first - normalize both input and role names
    const directMatch = roles.find(role => {
      const normalizedRoleName = normalizeRoleName(role.name);
      return normalizedRoleName === normalizedInput;
    });
    if (directMatch) return directMatch.name;
    
    // Partial match for common variations
    const partialMatches = {
      'ADMIN': 'ADMINISTRATOR',
      'ADMINISTRATOR': 'ADMINISTRATOR',
      'TRAINER': 'TRAINER',
      'TRAINEE': 'TRAINEE',
      'DEPT_HEAD': 'DEPARTMENT_HEAD',
      'DEPARTMENT_HEAD': 'DEPARTMENT_HEAD',
      'DEPARTMENT HEAD': 'DEPARTMENT_HEAD',
      'SQA_AUDITOR': 'SQA_AUDITOR',
      'SQA AUDITOR': 'SQA_AUDITOR',
      'ACADEMIC_DEPARTMENT': 'ACADEMIC_DEPARTMENT',
      'ACADEMIC_DEPT': 'ACADEMIC_DEPARTMENT',
      'ACADEMIC DEPT': 'ACADEMIC_DEPARTMENT',
      'ACADEMIC DEPARTMENT': 'ACADEMIC_DEPARTMENT'
    };
    
    const mappedName = partialMatches[normalizedInput];
    if (mappedName) {
      // Find role by comparing normalized names
      const mappedRole = roles.find(role => {
        const normalizedRoleName = normalizeRoleName(role.name);
        return normalizedRoleName === mappedName;
      });
      if (mappedRole) return mappedRole.name;
    }
    
    // Fuzzy match - normalize both sides for comparison
    const fuzzyMatch = roles.find(role => {
      const normalizedRoleName = normalizeRoleName(role.name);
      return normalizedRoleName.includes(normalizedInput) ||
             normalizedInput.includes(normalizedRoleName);
    });
    if (fuzzyMatch) return fuzzyMatch.name;
    
    return null;
  };

  const downloadTemplate = () => {
    // Create sample data for template
    const templateData = [
      allColumns, // Header row
      [
        'Trần', // first_name
        'Thị', // middle_name
        'Hoa', // last_name
        '456 Lê Văn Sỹ, Quận 3, TP.HCM', // address
        'tran.thi.hoa.trainer@example.com', // email
        '+84 912 345 678', // phone_number
        '', // avatar_url (optional)
        'FEMALE', // gender (M/F or MALE/FEMALE)
        'TRAINER', // role (must match system role name)
        'CERT555', // certification_number
        'Cabin Safety', // specialization
        '7', // years_of_experience
        'Huấn luyện viên Cabin Safety với 7 năm kinh nghiệm quốc tế', // bio
        '1988-06-21', // date_of_birth
        '', // enrollment_date (trainee only)
        '', // training_batch (trainee only)
        'B987654321', // passport_no
        'Vietnam' // nation
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Set UTF-8 encoding for proper Vietnamese character support
    XLSX.writeFile(wb, 'User_Upload_Template.xlsx', { 
      bookType: 'xlsx',
      type: 'binary'
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setErrors(['Please upload an Excel file (.xlsx or .xls)']);
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setErrors(['File size must be less than 100MB']);
      return;
    }

    setUploadedFile(file);
    setErrors([]);
    setValidationErrors([]);
    setPreviewData([]);

    // CRITICAL: Check if roles are loaded before processing file
    // If roles are still loading, wait for them
    if (rolesLoading) {
      setValidationErrors(['Roles are still loading. Please wait a moment and try again.']);
      return;
    }
    
    if (roles.length === 0) {
      setValidationErrors(['Roles are not loaded yet. Please refresh the page and try again.']);
      return;
    }

    console.log('📋 Processing file with roles loaded:', {
      rolesCount: roles.length,
      roles: roles.map(r => r.name)
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellText: false,
          cellDates: true,
          raw: false
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        });

        // Filter out completely empty rows (rows where all cells are empty/null/undefined)
        const nonEmptyRows = jsonData.filter(row => {
          if (!row || row.length === 0) return false;
          // Check if row has at least one non-empty cell
          return row.some(cell => cell !== null && cell !== undefined && cell !== '' && String(cell).trim() !== '');
        });

        console.log('📊 File parsing results:', {
          totalRowsParsed: jsonData.length,
          nonEmptyRowsFound: nonEmptyRows.length,
          firstRow: jsonData[0],
          sampleRows: jsonData.slice(0, 3)
        });

        if (nonEmptyRows.length < 2) {
          setErrors(['File must contain at least a header row and one data row. Please check if your file has empty rows or formatting issues.']);
          console.error('❌ File validation failed:', {
            totalRows: jsonData.length,
            nonEmptyRows: nonEmptyRows.length,
            firstFewRows: jsonData.slice(0, 3),
            allRows: jsonData
          });
          return;
        }

        const headers = nonEmptyRows[0].map(h => h ? h.toString().trim().toLowerCase().replace(/\s+/g, '_') : '');
        const dataRows = nonEmptyRows.slice(1).filter(row => {
          // Filter out data rows that are completely empty
          return row.some(cell => cell !== null && cell !== undefined && cell !== '' && String(cell).trim() !== '');
        });

        // Check again after filtering data rows
        if (dataRows.length === 0) {
          setErrors(['File must contain at least one data row with content. Please check if your data rows are empty or have formatting issues.']);
          console.error('No valid data rows found after filtering:', {
            totalRows: jsonData.length,
            nonEmptyRows: nonEmptyRows.length,
            dataRowsAfterFilter: dataRows.length
          });
          return;
        }

        // Map Excel headers to our field names
        const headerMapping = {
          'first_name': 'first_name',
          'firstname': 'first_name',
          'first name': 'first_name',
          'middle_name': 'middle_name',
          'middlename': 'middle_name',
          'middle name': 'middle_name',
          'last_name': 'last_name',
          'lastname': 'last_name',
          'last name': 'last_name',
          'full_name': 'full_name',
          'fullname': 'full_name',
          'full name': 'full_name',
          'name': 'full_name',
          'address': 'address',
          'email': 'email',
          'phone_number': 'phone_number',
          'phonenumber': 'phone_number',
          'phone number': 'phone_number',
          'phone': 'phone_number',
          'role': 'role',
          'certification_number': 'certification_number',
          'certificationnumber': 'certification_number',
          'certification number': 'certification_number',
          'certification': 'certification_number',
          'specialization': 'specialization',
          'years_of_experience': 'years_of_experience',
          'yearsofexperience': 'years_of_experience',
          'years of experience': 'years_of_experience',
          'experience': 'years_of_experience',
          'date_of_birth': 'date_of_birth',
          'dateofbirth': 'date_of_birth',
          'date of birth': 'date_of_birth',
          'dob': 'date_of_birth',
          'training_batch': 'training_batch',
          'trainingbatch': 'training_batch',
          'training batch': 'training_batch',
          'batch': 'training_batch',
          'passport_no': 'passport_no',
          'passportno': 'passport_no',
          'passport no': 'passport_no',
          'passport': 'passport_no',
          'nation': 'nation',
          'nationality': 'nation',
          'country': 'nation',
          'gender': 'gender',
          'sex': 'gender'
        };

        // Map headers to our field names
        const mappedHeaders = headers.map(header => headerMapping[header] || header);
        
        // Filter to only include our defined columns
        const validHeaders = mappedHeaders.filter(header => allColumns.includes(header));
        
        // Check for required columns
        const missingColumns = requiredColumns.filter(col => !validHeaders.includes(col));
        if (missingColumns.length > 0) {
          setValidationErrors([`Your file is missing these essential data to create a user: ${missingColumns.join(', ')}`]);
          return;
        }

        // Process data rows
        // IMPORTANT: Check if roles are loaded before processing
        if (roles.length === 0) {
          console.warn('⚠️ Roles not loaded yet, validation may fail');
          // Don't block file processing, but warn user
          setValidationErrors(['⚠️ Roles are still loading. Role validation may fail. Please wait and try again if you see role errors.']);
        }

        const processedData = dataRows.map((row, index) => {
          const userData = {};
          let hasError = false;
          const rowErrors = [];

          // Process all headers and map to our field names
          headers.forEach((originalHeader, colIndex) => {
            const mappedHeader = headerMapping[originalHeader] || originalHeader;
            
            // Only process if it's one of our defined columns
            if (allColumns.includes(mappedHeader)) {
              let value = '';
              
              // Handle different data types from Excel
              if (row[colIndex] !== null && row[colIndex] !== undefined) {
                if (typeof row[colIndex] === 'string') {
                  value = normalizeText(row[colIndex]);
                } else if (typeof row[colIndex] === 'number') {
                  value = row[colIndex].toString();
                } else {
                  value = normalizeText(row[colIndex].toString());
                }
              }
              
              // Normalize gender value
              if (mappedHeader === 'gender') {
                value = normalizeGender(value);
              }
              
              userData[mappedHeader] = value;
            }
          });

          // Validate the processed data
          validHeaders.forEach((header) => {
            const value = userData[header] || '';

            // Validate required fields
            if (requiredColumns.includes(header) && !value) {
              hasError = true;
              rowErrors.push('Required field missing');
            }

            // Validate email format
            if (header === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
              hasError = true;
              rowErrors.push('Invalid email');
            }

            // Validate role
            if (header === 'role' && value) {
              // Only validate if roles are loaded
              if (roles.length > 0) {
                const roleId = findRoleId(value);
                if (!roleId) {
                  hasError = true;
                  // Show normalized comparison for debugging
                  const normalizedInput = normalizeRoleName(value);
                  const availableNormalized = roles.map(r => ({
                    original: r.name,
                    normalized: normalizeRoleName(r.name)
                  }));
                  console.error('❌ Role validation failed:', {
                    input: value,
                    normalizedInput: normalizedInput,
                    availableRoles: roles.map(r => r.name),
                    availableNormalized: availableNormalized
                  });
                  rowErrors.push(`Invalid role: "${value}". Available roles: ${roles.map(r => r.name).join(', ')}`);
                } else {
                  console.log('✅ Role validated successfully:', value, '→', roleId);
                }
              } else {
                // Roles not loaded yet, show warning but don't mark as error
                console.warn('⚠️ Roles not loaded, cannot validate role:', value);
              }
            }

            // Validate phone number length
            if (header === 'phone_number' && value && value.length > 15) {
              hasError = true;
              rowErrors.push('Phone number too long (max 15 characters)');
            }

            // Validate years of experience
            if (header === 'years_of_experience' && value && isNaN(value)) {
              hasError = true;
              rowErrors.push('Invalid experience value');
            }

            // Validate gender
            if (header === 'gender' && value) {
              const genderError = validateGender(value);
              if (genderError) {
                hasError = true;
                rowErrors.push(genderError);
              }
            }
          });

          // Validate role-specific required fields
          const actualRoleName = getActualRoleName(userData.role);
          if (actualRoleName === 'TRAINER') {
            // Trainer requires specialization and years of experience
            // Department is NOT allowed for Trainer role
            if (!userData.specialization || userData.specialization.trim() === '') {
              hasError = true;
              rowErrors.push('Trainer requires specialization');
            }
            if (!userData.years_of_experience || userData.years_of_experience.trim() === '') {
              hasError = true;
              rowErrors.push('Trainer requires years of experience');
            }
          } else if (actualRoleName === 'TRAINEE') {
            // Trainee requires date of birth, training batch, passport number, and nation
            if (!userData.date_of_birth || userData.date_of_birth.trim() === '') {
              hasError = true;
              rowErrors.push('Trainee requires date of birth');
            } else {
              // Validate date format
              const formattedDate = formatDateToISO(userData.date_of_birth);
              if (!formattedDate) {
                hasError = true;
                rowErrors.push(`Invalid date format for date of birth: "${userData.date_of_birth}". Use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY`);
              }
            }
            if (!userData.training_batch || userData.training_batch.trim() === '') {
              hasError = true;
              rowErrors.push('Trainee requires training batch');
            }
            if (!userData.passport_no || userData.passport_no.trim() === '') {
              hasError = true;
              rowErrors.push('Trainee requires passport number');
            }
            if (!userData.nation || userData.nation.trim() === '') {
              hasError = true;
              rowErrors.push('Trainee requires nation');
            }
            
            // Validate enrollment_date if provided
            if (userData.enrollment_date && userData.enrollment_date.trim() !== '') {
              const formattedEnrollmentDate = formatDateToISO(userData.enrollment_date);
              if (!formattedEnrollmentDate) {
                hasError = true;
                rowErrors.push(`Invalid date format for enrollment date: "${userData.enrollment_date}". Use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY`);
              }
            }
          }

          return {
            id: index + 1,
            ...userData,
            hasError,
            errors: rowErrors,
            status: hasError ? 'error' : 'valid'
          };
        });

        setPreviewData(processedData);
      } catch {
        setErrors(['Error reading file. Please make sure it\'s a valid Excel file.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportAll = async () => {
    const validUsers = previewData.filter(user => !user.hasError);
    
    if (validUsers.length === 0) {
      setErrors(['No valid users to import']);
      return;
    }

    if (!roles.length) {
      setErrors(['Roles not loaded. Please wait and try again.']);
      return;
    }

    // Transform data to match backend format
    const usersToImport = validUsers.map(user => {
      // Truncate phone number to 15 characters
      const phoneNumber = user.phone_number ? user.phone_number.substring(0, 15) : '';
      
      // Find role ID and actual role name using smart mapping
      const roleId = findRoleId(user.role);
      const actualRoleName = getActualRoleName(user.role);
      
      if (!roleId || !actualRoleName) {
        throw new Error(`Role "${user.role}" not found in system`);
      }
      
      const userData = {
        firstName: user.first_name || '',
        middleName: user.middle_name || '',
        lastName: user.last_name || '',
        address: user.address || '',
        email: user.email || '',
        phoneNumber: phoneNumber,
        avatarUrl: user.avatar_url || '',
        gender: normalizeGender(user.gender),
        role: {
          id: roleId,
          name: actualRoleName
        }
      };

      // TRAINER: Explicitly do NOT add departmentId field

      // Add role-specific profiles based on actual role name
      if (actualRoleName === 'TRAINER') {
        userData.trainerProfile = {
          specialization: user.specialization || '',
          yearsOfExp: user.years_of_experience ? parseInt(user.years_of_experience) : 0,
          certificationNumber: user.certification_number || '',
          bio: user.bio || ''
        };
      } else if (actualRoleName === 'TRAINEE') {
        const traineeProfile = {
          trainingBatch: user.training_batch || '',
          passportNo: user.passport_no || '',
          nation: user.nation || ''
        };

        // Only add date fields if they are valid
        const dob = formatDateToISO(user.date_of_birth);
        if (dob) {
          traineeProfile.dob = dob;
        }

        const enrollmentDate = formatDateToISO(user.enrollment_date);
        if (enrollmentDate) {
          traineeProfile.enrollmentDate = enrollmentDate;
        } else {
          // Default to today if no enrollment date provided
          traineeProfile.enrollmentDate = new Date().toISOString();
        }

        userData.traineeProfile = traineeProfile;
      }

      return userData;
    });

    try {
      await onImport(usersToImport);
      handleClose();
    } catch (error) {
      setErrors([error.message || 'Failed to import users. Please try again.']);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setErrors([]);
    setValidationErrors([]);
    setDragActive(false);
    onClose();
  };

  const removeUser = (id) => {
    setPreviewData(prev => prev.filter(user => user.id !== id));
  };

  const getStatusIcon = (status) => {
    if (status === 'valid') {
      return <CheckCircle className="text-success" size={16} />;
    } else {
      return <XCircle className="text-danger" size={16} />;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Bulk Import Users
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        
        {/* Loading indicator for roles */}
        {rolesLoading && (
          <div className="text-center mb-3">
            <div 
              className="spinner-border text-primary" 
              role="status"
              style={{ 
                width: '1.5rem', 
                height: '1.5rem',
                borderWidth: '0.2em'
              }}
            >
              <span className="visually-hidden">Loading roles...</span>
            </div>
            <span className="ms-2 text-muted">Loading roles...</span>
          </div>
        )}
        
        {/* File Upload Section */}
        <Card className="mb-4">
          <Card.Body>
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dragActive ? '#f8f9fa' : '#fff',
                transition: 'all 0.3s ease'
              }}
            >
              <FileEarmarkExcel size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Select or Drop your file here</h5>
              <p className="text-muted mb-0">File size up to 100MBs</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>

            <div className="mt-3 d-flex justify-content-between align-items-center">
              <div>
                {uploadedFile && (
                  <p className="text-success mb-1">
                    <strong>Uploaded file:</strong> {uploadedFile.name}
                  </p>
                )}
                <p className="text-muted mb-0">Up to 100 records per upload.</p>
                <small className="text-info d-block mt-1">
                  <strong>Gender format:</strong> M/F or MALE/FEMALE
                </small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={downloadTemplate}
                className="d-flex align-items-center"
              >
                <Download className="me-1" size={14} />
                Download Template
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="alert alert-danger mb-3">
            <ul className="mb-0">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="warning" className="mb-3">
            <ul className="mb-0">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <Card>
            <Card.Header>
              <h6 className="mb-0">Preview Data ({previewData.length} records)</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div 
                className="bulk-import-preview"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  overflowX: 'auto'
                }}
              >
                <Table striped hover className="mb-0" style={{ minWidth: '1600px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '50px' }}>NO.</th>
                      <th style={{ minWidth: '120px' }}>FIRST NAME</th>
                      <th style={{ minWidth: '120px' }}>MIDDLE NAME</th>
                      <th style={{ minWidth: '120px' }}>LAST NAME</th>
                      <th style={{ minWidth: '200px' }}>EMAIL</th>
                      <th style={{ minWidth: '120px' }}>ROLE</th>
                      <th style={{ minWidth: '150px' }}>PHONE NUMBER</th>
                      <th style={{ minWidth: '100px' }}>GENDER</th>
                      <th style={{ minWidth: '150px' }}>CERTIFICATION</th>
                      <th style={{ minWidth: '150px' }}>SPECIALIZATION</th>
                      <th style={{ minWidth: '100px' }}>EXPERIENCE</th>
                      <th style={{ minWidth: '120px' }}>DATE OF BIRTH</th>
                      <th style={{ minWidth: '120px' }}>TRAINING BATCH</th>
                      <th style={{ minWidth: '120px' }}>PASSPORT NO</th>
                      <th style={{ minWidth: '100px' }}>NATION</th>
                      <th style={{ minWidth: '80px' }}>STATUS</th>
                      <th style={{ minWidth: '200px' }}>ERROR ENCOUNTERED</th>
                      <th style={{ minWidth: '80px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((user) => (
                      <tr key={user.id} className={user.hasError ? 'table-danger' : ''}>
                        <td>{user.id}</td>
                        <td>{user.first_name || user.full_name || '-'}</td>
                        <td>{user.middle_name || '-'}</td>
                        <td>{user.last_name || '-'}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.role || '-'}</td>
                        <td>{user.phone_number || '-'}</td>
                        <td>
                          {user.gender ? (
                            <span title={`Original: ${user.gender}`}>
                              {normalizeGender(user.gender)}
                            </span>
                          ) : '-'}
                        </td>
                        <td>{user.certification_number || '-'}</td>
                        <td>{user.specialization || '-'}</td>
                        <td>{user.years_of_experience || '-'}</td>
                        <td>{user.date_of_birth || '-'}</td>
                        <td>{user.training_batch || '-'}</td>
                        <td>{user.passport_no || '-'}</td>
                        <td>{user.nation || '-'}</td>
                        <td className="text-center">
                          {getStatusIcon(user.status)}
                        </td>
                        <td>
                          {user.errors.length > 0 && (
                            <small className="text-danger">
                              {user.errors.length > 1 ? `${user.errors[0]} (+${user.errors.length - 1} more)` : user.errors[0]}
                            </small>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeUser(user.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        {previewData.length > 0 && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="import-tooltip">
                Only {previewData.filter(u => !u.hasError).length}/{previewData.length} users will be imported into DSFMS
              </Tooltip>
            }
          >
            <Button
              variant="primary"
              onClick={handleImportAll}
              disabled={loading || previewData.filter(u => !u.hasError).length === 0}
            >
              {loading ? (
                <>
                  <span 
                    className="spinner-border me-2" 
                    role="status" 
                    aria-hidden="true"
                    style={{ 
                      width: '1rem', 
                      height: '1rem',
                      borderWidth: '0.15em'
                    }}
                  ></span>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="me-2" size={16} />
                  Import All ({previewData.filter(u => !u.hasError).length} users)
                </>
              )}
            </Button>
          </OverlayTrigger>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportModal;
