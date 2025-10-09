import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Download } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';

const BulkImportSubjectsModal = ({ show, onClose, onImport, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Required columns for subject import (based on database schema)
  const requiredColumns = [
    'code',
    'name',
    'course_id'
  ];

  // All possible columns (based on database schema)
  const allColumns = [
    'code',           // varchar (U) - Subject Code
    'name',           // varchar - Subject Name
    'course_id',      // uuid (FK) - Course ID
    'description',    // text - Description
    'method',         // enum - Training Method
    'duration',       // integer - Duration in days
    'type',           // enum - Subject Type
    'room_name',      // varchar - Room Name
    'remark_note',    // varchar - Remark Note
    'time_slot',      // varchar - Time Slot
    'pass_score',     // float - Pass Score
    'start_date',     // datetime - Start Date
    'end_date'        // datetime - End Date
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
        const subjects = dataRows.map((row, index) => {
          const subject = {
            id: `temp_${index}`,
            rowNumber: index + 2,
            code: row[headers.indexOf('code')]?.toString().trim() || '',
            name: row[headers.indexOf('name')]?.toString().trim() || '',
            course_id: row[headers.indexOf('course_id')]?.toString().trim() || '',
            description: row[headers.indexOf('description')]?.toString().trim() || '',
            method: row[headers.indexOf('method')]?.toString().trim() || 'THEORY',
            duration: row[headers.indexOf('duration')]?.toString().trim() || '',
            type: row[headers.indexOf('type')]?.toString().trim() || 'MANDATORY',
            room_name: row[headers.indexOf('room_name')]?.toString().trim() || '',
            remark_note: row[headers.indexOf('remark_note')]?.toString().trim() || '',
            time_slot: row[headers.indexOf('time_slot')]?.toString().trim() || '',
            pass_score: row[headers.indexOf('pass_score')]?.toString().trim() || '',
            start_date: row[headers.indexOf('start_date')]?.toString().trim() || '',
            end_date: row[headers.indexOf('end_date')]?.toString().trim() || '',
            hasError: false,
            errors: []
          };

          // Validate subject data
          if (!subject.code) {
            subject.hasError = true;
            subject.errors.push('Subject code is required');
          }

          if (!subject.name) {
            subject.hasError = true;
            subject.errors.push('Subject name is required');
          }

          if (!subject.course_id) {
            subject.hasError = true;
            subject.errors.push('Course ID is required');
          }

          // Validate duration
          if (subject.duration && (isNaN(subject.duration) || parseInt(subject.duration) <= 0)) {
            subject.hasError = true;
            subject.errors.push('Duration must be a positive number');
          }

          // Validate pass_score
          if (subject.pass_score && (isNaN(subject.pass_score) || parseFloat(subject.pass_score) < 0 || parseFloat(subject.pass_score) > 100)) {
            subject.hasError = true;
            subject.errors.push('Pass score must be between 0 and 100');
          }

          // Validate method enum
          if (subject.method && !['THEORY', 'PRACTICAL', 'MIXED'].includes(subject.method.toUpperCase())) {
            subject.hasError = true;
            subject.errors.push('Method must be THEORY, PRACTICAL, or MIXED');
          }

          // Validate type enum
          if (subject.type && !['MANDATORY', 'OPTIONAL'].includes(subject.type.toUpperCase())) {
            subject.hasError = true;
            subject.errors.push('Type must be MANDATORY or OPTIONAL');
          }

          // Validate dates - handle Excel serial numbers and AM/PM format
          if (subject.start_date) {
            let normalizedStartDate;
            
            // Check if it's an Excel serial number (numeric)
            if (typeof subject.start_date === 'number' || !isNaN(parseFloat(subject.start_date))) {
              // Convert Excel serial number to JavaScript Date
              // Excel serial number: days since 1900-01-01 (with leap year bug)
              const excelSerial = parseFloat(subject.start_date);
              const jsDate = new Date((excelSerial - 25569) * 86400 * 1000); // 25569 = days from 1900-01-01 to 1970-01-01
              normalizedStartDate = jsDate.toISOString().replace('T', ' ').replace('Z', '');
            } else {
              // Handle string format - remove AM/PM and normalize
              normalizedStartDate = subject.start_date
                .replace(/\s+(AM|PM)/gi, '') // Remove AM/PM
                .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
                .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:$6'); // Convert MM/DD/YYYY to YYYY-MM-DD
            }
            
            console.log('🔍 Original start_date:', subject.start_date);
            console.log('🔍 Normalized start_date:', normalizedStartDate);
            
            if (isNaN(Date.parse(normalizedStartDate))) {
              subject.hasError = true;
              subject.errors.push('Start date must be a valid date');
            } else {
              // Update the subject with normalized date
              subject.start_date = normalizedStartDate;
            }
          }

          if (subject.end_date) {
            let normalizedEndDate;
            
            // Check if it's an Excel serial number (numeric)
            if (typeof subject.end_date === 'number' || !isNaN(parseFloat(subject.end_date))) {
              // Convert Excel serial number to JavaScript Date
              const excelSerial = parseFloat(subject.end_date);
              const jsDate = new Date((excelSerial - 25569) * 86400 * 1000);
              normalizedEndDate = jsDate.toISOString().replace('T', ' ').replace('Z', '');
            } else {
              // Handle string format - remove AM/PM and normalize
              normalizedEndDate = subject.end_date
                .replace(/\s+(AM|PM)/gi, '') // Remove AM/PM
                .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
                .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:$6'); // Convert MM/DD/YYYY to YYYY-MM-DD
            }
            
            console.log('🔍 Original end_date:', subject.end_date);
            console.log('🔍 Normalized end_date:', normalizedEndDate);
            
            if (isNaN(Date.parse(normalizedEndDate))) {
              subject.hasError = true;
              subject.errors.push('End date must be a valid date');
            } else {
              // Update the subject with normalized date
              subject.end_date = normalizedEndDate;
            }
          }

          return subject;
        }).filter(subject => subject.code || subject.name); // Remove completely empty rows

        setPreviewData(subjects);
        setValidationErrors([]);

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setErrors(['Failed to parse Excel file. Please check the file format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportAll = async () => {
    const subjectsToImport = previewData.filter(subject => !subject.hasError);
    
    if (subjectsToImport.length === 0) {
      setErrors(['No valid subjects to import']);
      return;
    }

    try {
      await onImport(subjectsToImport);
      handleClose();
    } catch (error) {
      setErrors([error.message || 'Failed to import subjects. Please try again.']);
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
    // Create sample data for template based on database schema
    const templateData = [
      allColumns, // Header row
      [
        'MATH101', // code
        'Mathematics', // name
        'c1', // course_id
        'Basic mathematics course covering algebra and geometry', // description
        'THEORY', // method
        '14', // duration
        'MANDATORY', // type
        'Room A101', // room_name
        'This is a required course for all students', // remark_note
        '09:00-17:00', // time_slot
        '70.0', // pass_score
        '2025-01-15 09:00:00', // start_date
        '2025-01-29 17:00:00' // end_date
      ],
      [
        'PHYS101', // code
        'Physics', // name
        'c1', // course_id
        'Introduction to physics concepts and principles', // description
        'PRACTICAL', // method
        '7', // duration
        'OPTIONAL', // type
        'Lab B201', // room_name
        'Hands-on experiments and demonstrations', // remark_note
        '14:00-18:00', // time_slot
        '75.0', // pass_score
        '2025-02-01 14:00:00', // start_date
        '2025-02-08 18:00:00' // end_date
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
    
    XLSX.writeFile(wb, 'Subject_Upload_Template.xlsx');
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Bulk Import Subjects
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
                  <strong>Required columns:</strong> Code, Name, Course ID
                </small>
                <br />
                <small className="text-muted">
                  <strong>Optional columns:</strong> Description, Method, Duration, Type, Room Name, Remark Note, Time Slot, Pass Score, Start Date, End Date
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={downloadTemplate}
                  className="d-flex align-items-center"
                >
                  <Download className="me-1" size={14} />
                  Download Template
                </Button>
                {uploadedFile && (
                  <div className="d-flex align-items-center">
                    <FileEarmarkExcel className="text-success me-2" size={16} />
                    <span className="text-success fw-semibold">{uploadedFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Preview Data */}
        {previewData.length > 0 && (
          <Card>
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                Preview Data ({previewData.length} subjects)
                <span className="ms-2">
                  <CheckCircle className="text-success me-1" size={16} />
                  {previewData.filter(s => !s.hasError).length} valid
                  <XCircle className="text-danger ms-2 me-1" size={16} />
                  {previewData.filter(s => s.hasError).length} invalid
                </span>
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="bg-light sticky-top">
                    <tr>
                      <th>Status</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Course ID</th>
                      <th>Method</th>
                      <th>Duration</th>
                      <th>Type</th>
                      <th>Pass Score</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((subject, index) => (
                      <tr key={subject.id} className={subject.hasError ? 'table-danger' : 'table-success'}>
                        <td>
                          {getStatusIcon(subject.hasError ? 'invalid' : 'valid')}
                        </td>
                        <td>{subject.code}</td>
                        <td>{subject.name}</td>
                        <td>{subject.course_id}</td>
                        <td>{subject.method}</td>
                        <td>{subject.duration}</td>
                        <td>{subject.type}</td>
                        <td>{subject.pass_score}</td>
                        <td>
                          {subject.errors.length > 0 && (
                            <small className="text-danger">
                              {subject.errors.join(', ')}
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
            disabled={loading || previewData.filter(s => !s.hasError).length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import All ({previewData.filter(s => !s.hasError).length} subjects)
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportSubjectsModal;
