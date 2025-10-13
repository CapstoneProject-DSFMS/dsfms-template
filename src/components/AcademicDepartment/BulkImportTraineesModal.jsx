import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Download } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import { userAPI } from '../../api/user';

const BulkImportTraineesModal = ({ show, onClose, onImport, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Required columns for trainee import (based on UserModal structure)
  const requiredColumns = [
    'eid',
    'first_name',
    'last_name',
    'email',
    'phone_number',
    'role'
  ];

  // All possible columns (based on UserModal structure)
  const allColumns = [
    'eid',
    'first_name',
    'last_name',
    'middle_name',
    'email',
    'phone_number',
    'address',
    'gender',
    'role',
    'certification_number',
    'specialization',
    'years_of_experience',
    'date_of_birth',
    'training_batch',
    'passport_no',
    'nation'
  ];

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
      setErrors(['Please select a valid Excel file (.xlsx or .xls)']);
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      setErrors(['File size must be less than 100MB']);
      return;
    }

    setUploadedFile(file);
    setErrors([]);
    parseExcelFile(file);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setErrors(['Excel file must contain at least a header row and one data row']);
          return;
        }

        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
        const dataRows = jsonData.slice(1);

        // Validate headers
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          setErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
          return;
        }

        // Process data
        const trainees = dataRows.map((row, index) => {
          const trainee = {
            id: `temp_${index}`,
            rowNumber: index + 2,
            eid: row[headers.indexOf('eid')]?.toString().trim() || '',
            firstName: row[headers.indexOf('first_name')]?.toString().trim() || '',
            lastName: row[headers.indexOf('last_name')]?.toString().trim() || '',
            middleName: row[headers.indexOf('middle_name')]?.toString().trim() || '',
            email: row[headers.indexOf('email')]?.toString().trim() || '',
            phoneNumber: row[headers.indexOf('phone_number')]?.toString().trim() || '',
            address: row[headers.indexOf('address')]?.toString().trim() || '',
            gender: row[headers.indexOf('gender')]?.toString().trim() || 'MALE',
            role: row[headers.indexOf('role')]?.toString().trim() || 'TRAINEE',
            certificationNumber: row[headers.indexOf('certification_number')]?.toString().trim() || '',
            specialization: row[headers.indexOf('specialization')]?.toString().trim() || '',
            yearsOfExperience: row[headers.indexOf('years_of_experience')]?.toString().trim() || '',
            dateOfBirth: row[headers.indexOf('date_of_birth')]?.toString().trim() || '',
            trainingBatch: row[headers.indexOf('training_batch')]?.toString().trim() || '',
            passportNo: row[headers.indexOf('passport_no')]?.toString().trim() || '',
            nation: row[headers.indexOf('nation')]?.toString().trim() || '',
            hasError: false,
            errors: []
          };

          // Validate trainee data
          if (!trainee.eid) {
            trainee.hasError = true;
            trainee.errors.push('EID is required');
          }

          if (!trainee.firstName) {
            trainee.hasError = true;
            trainee.errors.push('First name is required');
          }

          if (!trainee.lastName) {
            trainee.hasError = true;
            trainee.errors.push('Last name is required');
          }

          if (!trainee.email) {
            trainee.hasError = true;
            trainee.errors.push('Email is required');
          } else if (!/\S+@\S+\.\S+/.test(trainee.email)) {
            trainee.hasError = true;
            trainee.errors.push('Email format is invalid');
          }

          if (!trainee.phoneNumber) {
            trainee.hasError = true;
            trainee.errors.push('Phone number is required');
          }

          if (!trainee.role) {
            trainee.hasError = true;
            trainee.errors.push('Role is required');
          }

          return trainee;
        }).filter(trainee => trainee.eid || trainee.firstName || trainee.lastName); // Remove completely empty rows

        setPreviewData(trainees);
        setValidationErrors([]);

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setErrors(['Failed to parse Excel file. Please check the file format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportAll = async () => {
    const traineesToImport = previewData.filter(trainee => !trainee.hasError);
    
    if (traineesToImport.length === 0) {
      setErrors(['No valid trainees to import']);
      return;
    }

    try {
      // Transform data to match user API format
      const usersData = traineesToImport.map(trainee => ({
        eid: trainee.eid,
        firstName: trainee.firstName,
        lastName: trainee.lastName,
        middleName: trainee.middleName || '',
        email: trainee.email,
        phoneNumber: trainee.phoneNumber || '',
        address: trainee.address || '',
        gender: trainee.gender || 'MALE',
        role: trainee.role || 'TRAINEE',
        certificationNumber: trainee.certificationNumber || '',
        specialization: trainee.specialization || '',
        yearsOfExperience: trainee.yearsOfExperience || '',
        dateOfBirth: trainee.dateOfBirth || '',
        trainingBatch: trainee.trainingBatch || '',
        passportNo: trainee.passportNo || '',
        nation: trainee.nation || ''
      }));

      console.log('🔍 Bulk importing trainees as users:', usersData);
      
      // Call user API bulk import
      const response = await userAPI.bulkImportUsers(usersData);
      console.log('✅ Bulk import response:', response);
      
      // Call parent onImport callback if provided
      if (onImport) {
        await onImport(traineesToImport);
      }
      
      handleClose();
    } catch (error) {
      console.error('❌ Error bulk importing trainees:', error);
      setErrors([error.message || 'Failed to import trainees. Please try again.']);
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

  const getStatusIcon = (status) => {
    if (status === 'valid') {
      return <CheckCircle className="text-success" size={16} />;
    } else {
      return <XCircle className="text-danger" size={16} />;
    }
  };

  const downloadTemplate = () => {
    // Create sample data for template (based on UserModal structure)
    const templateData = [
      ['eid', 'first_name', 'last_name', 'middle_name', 'email', 'phone_number', 'address', 'gender', 'role', 'certification_number', 'specialization', 'years_of_experience', 'date_of_birth', 'training_batch', 'passport_no', 'nation'], // Header row
      ['TE000001', 'John', 'Doe', 'Michael', 'john.doe@example.com', '0934980926', '221B Baker Street, London', 'MALE', 'TRAINEE', '', '', '', '1990-01-15', 'BATCH2023-01', 'P123456789', 'Vietnam'], // Sample data row 1
      ['TE000002', 'Jane', 'Smith', 'Elizabeth', 'jane.smith@example.com', '0934980927', '221B Baker Street, London', 'FEMALE', 'TRAINEE', '', '', '', '1992-05-20', 'BATCH2023-01', 'P123456790', 'Vietnam'], // Sample data row 2
      ['TE000003', 'Bob', 'Johnson', 'Robert', 'bob.johnson@example.com', '0934980928', '221B Baker Street, London', 'MALE', 'TRAINEE', '', '', '', '1988-12-10', 'BATCH2023-02', 'P123456791', 'Vietnam'], // Sample data row 3
      ['TE000004', 'Alice', 'Brown', 'Marie', 'alice.brown@example.com', '0934980929', '221B Baker Street, London', 'FEMALE', 'TRAINEE', '', '', '', '1995-08-25', 'BATCH2023-02', 'P123456792', 'Vietnam'], // Sample data row 4
      ['TE000005', 'Charlie', 'Wilson', 'David', 'charlie.wilson@example.com', '0934980930', '221B Baker Street, London', 'MALE', 'TRAINEE', '', '', '', '1991-03-18', 'BATCH2023-03', 'P123456793', 'Vietnam'] // Sample data row 5
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // eid column width
      { wch: 15 }, // first_name column width
      { wch: 15 }, // last_name column width
      { wch: 15 }, // middle_name column width
      { wch: 30 }, // email column width
      { wch: 15 }, // phone_number column width
      { wch: 40 }, // address column width
      { wch: 10 }, // gender column width
      { wch: 15 }, // role column width
      { wch: 20 }, // certification_number column width
      { wch: 20 }, // specialization column width
      { wch: 15 }, // years_of_experience column width
      { wch: 15 }, // date_of_birth column width
      { wch: 15 }, // training_batch column width
      { wch: 15 }, // passport_no column width
      { wch: 15 }  // nation column width
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainees Template');

    // Generate and download file
    const fileName = 'Trainees_Import_Template.xlsx';
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Bulk Import Trainees
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        
        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert variant="danger" className="mb-3">
            <ul className="mb-0">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
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
                <small className="text-muted">
                  <strong>Required columns:</strong> eid, first_name, last_name, email, phone_number, role
                </small>
                <div className="mt-1">
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
              </div>
              {uploadedFile && (
                <div className="d-flex align-items-center">
                  <FileEarmarkExcel className="text-success me-2" size={16} />
                  <span className="text-success fw-semibold">{uploadedFile.name}</span>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Preview Data */}
        {previewData.length > 0 && (
          <Card>
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                Preview Data ({previewData.length} trainees)
                <span className="ms-2">
                  <CheckCircle className="text-success me-1" size={16} />
                  {previewData.filter(t => !t.hasError).length} valid
                  <XCircle className="text-danger ms-2 me-1" size={16} />
                  {previewData.filter(t => t.hasError).length} invalid
                </span>
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="bg-light sticky-top">
                    <tr>
                      <th>Status</th>
                      <th>EID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Training Batch</th>
                      <th>Passport No</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((trainee, index) => (
                      <tr key={trainee.id} className={trainee.hasError ? 'table-danger' : 'table-success'}>
                        <td>
                          {getStatusIcon(trainee.hasError ? 'invalid' : 'valid')}
                        </td>
                        <td>{trainee.eid}</td>
                        <td>{trainee.firstName}</td>
                        <td>{trainee.lastName}</td>
                        <td>{trainee.email}</td>
                        <td>{trainee.phoneNumber}</td>
                        <td>{trainee.role}</td>
                        <td>{trainee.trainingBatch}</td>
                        <td>{trainee.passportNo}</td>
                        <td>
                          {trainee.errors.length > 0 && (
                            <small className="text-danger">
                              {trainee.errors.join(', ')}
                            </small>
                          )}
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
          <Button
            variant="primary"
            onClick={handleImportAll}
            disabled={loading || previewData.filter(t => !t.hasError).length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import All ({previewData.filter(t => !t.hasError).length} trainees)
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportTraineesModal;
