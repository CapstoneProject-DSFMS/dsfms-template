import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Table, Row, Col, Card, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Pencil, Trash, Download } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import { userAPI } from '../../../api/user.js';

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

  // All possible columns (excluding department)
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
      const response = await userAPI.getRoles();
      setRoles(response.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setErrors(['Failed to load roles. Please refresh the page.']);
    } finally {
      setRolesLoading(false);
    }
  };

  // Smart role mapping function
  const findRoleId = (roleName) => {
    if (!roleName || !roles.length) return null;
    
    const normalizedInput = roleName.toUpperCase().trim();
    
    // Direct match first
    const directMatch = roles.find(role => 
      role.name.toUpperCase() === normalizedInput
    );
    if (directMatch) return directMatch.id;
    
    // Partial match for common variations
    const partialMatches = {
      'ADMIN': 'ADMINISTRATOR',
      'ADMINISTRATOR': 'ADMINISTRATOR',
      'TRAINER': 'TRAINER',
      'TRAINEE': 'TRAINEE',
      'DEPT_HEAD': 'DEPARTMENT_HEAD',
      'DEPARTMENT_HEAD': 'DEPARTMENT_HEAD',
      'DEPT HEAD': 'DEPARTMENT_HEAD',
      'SQA_AUDITOR': 'SQA_AUDITOR',
      'SQA AUDITOR': 'SQA_AUDITOR',
      'ACADEMIC_DEPARTMENT': 'ACADEMIC_DEPARTMENT',
      'ACADEMIC_DEPT': 'ACADEMIC_DEPARTMENT',
      'ACADEMIC DEPT': 'ACADEMIC_DEPARTMENT'
    };
    
    const mappedName = partialMatches[normalizedInput];
    if (mappedName) {
      const mappedRole = roles.find(role => 
        role.name.toUpperCase() === mappedName
      );
      if (mappedRole) return mappedRole.id;
    }
    
    // Fuzzy match - find roles that contain the input
    const fuzzyMatch = roles.find(role => 
      role.name.toUpperCase().includes(normalizedInput) ||
      normalizedInput.includes(role.name.toUpperCase())
    );
    if (fuzzyMatch) return fuzzyMatch.id;
    
    return null;
  };

  const downloadTemplate = () => {
    // Create sample data for template
    const templateData = [
      allColumns, // Header row
      [
        'John', // first_name
        'Michael', // middle_name
        'Doe', // last_name
        '123 Main Street, Ho Chi Minh City', // address
        'john.doe@example.com', // email
        '+84 123 456 789', // phone_number
        'TRAINER', // role
        'CERT001', // certification_number
        'Flight Training', // specialization
        '5', // years_of_experience
        '1990-01-15', // date_of_birth
        'BATCH2023-01', // training_batch
        'P123456789', // passport_no
        'Vietnam' // nation
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    XLSX.writeFile(wb, 'User_Upload_Template.xlsx');
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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setErrors(['File must contain at least a header row and one data row']);
          return;
        }

        const headers = jsonData[0].map(h => h ? h.toString().toLowerCase().replace(/\s+/g, '_') : '');
        const dataRows = jsonData.slice(1);

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
          'country': 'nation'
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
        const processedData = dataRows.map((row, index) => {
          const userData = {};
          let hasError = false;
          const rowErrors = [];

          // Process all headers and map to our field names
          headers.forEach((originalHeader, colIndex) => {
            const mappedHeader = headerMapping[originalHeader] || originalHeader;
            
            // Only process if it's one of our defined columns
            if (allColumns.includes(mappedHeader)) {
              const value = row[colIndex] ? row[colIndex].toString().trim() : '';
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
              const roleId = findRoleId(value);
              if (!roleId) {
                hasError = true;
                rowErrors.push('Invalid role');
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
          });

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
      
      // Find role ID using smart mapping
      const roleId = findRoleId(user.role);
      if (!roleId) {
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
        gender: user.gender || 'MALE',
        role: {
          id: roleId,
          name: user.role || ''
        }
      };

      // Add role-specific profiles based on role
      if (user.role === 'TRAINER') {
        userData.trainerProfile = {
          specialization: user.specialization || '',
          yearsOfExp: user.years_of_experience ? parseInt(user.years_of_experience) : 0,
          certificationNumber: user.certification_number || '',
          bio: user.bio || ''
        };
      } else if (user.role === 'TRAINEE') {
        userData.traineeProfile = {
          dob: user.date_of_birth || '',
          enrollmentDate: user.enrollment_date || new Date().toISOString().split('T')[0],
          trainingBatch: user.training_batch || '',
          passportNo: user.passport_no || '',
          nation: user.nation || ''
        };
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
            <div className="spinner-border spinner-border-sm text-primary" role="status">
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
                        <td>{user.gender || '-'}</td>
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
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
