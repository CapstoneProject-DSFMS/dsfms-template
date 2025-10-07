import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';

const BulkImportSubjectsModal = ({ show, onClose, onImport, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Required columns for subject import
  const requiredColumns = [
    'subject_code',
    'subject_name',
    'credits'
  ];

  // All possible columns
  const allColumns = [
    'subject_code',
    'subject_name',
    'credits',
    'description',
    'prerequisites'
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
            subject_code: row[headers.indexOf('subject_code')]?.toString().trim() || '',
            subject_name: row[headers.indexOf('subject_name')]?.toString().trim() || '',
            credits: row[headers.indexOf('credits')]?.toString().trim() || '',
            description: row[headers.indexOf('description')]?.toString().trim() || '',
            prerequisites: row[headers.indexOf('prerequisites')]?.toString().trim() || '',
            hasError: false,
            errors: []
          };

          // Validate subject data
          if (!subject.subject_code) {
            subject.hasError = true;
            subject.errors.push('Subject code is required');
          }

          if (!subject.subject_name) {
            subject.hasError = true;
            subject.errors.push('Subject name is required');
          }

          if (!subject.credits) {
            subject.hasError = true;
            subject.errors.push('Credits is required');
          } else if (isNaN(subject.credits) || parseInt(subject.credits) <= 0) {
            subject.hasError = true;
            subject.errors.push('Credits must be a positive number');
          }

          return subject;
        }).filter(subject => subject.subject_code || subject.subject_name); // Remove completely empty rows

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
                  <strong>Required columns:</strong> Subject Code, Subject Name, Credits
                </small>
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
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Credits</th>
                      <th>Description</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((subject, index) => (
                      <tr key={subject.id} className={subject.hasError ? 'table-danger' : 'table-success'}>
                        <td>
                          {getStatusIcon(subject.hasError ? 'invalid' : 'valid')}
                        </td>
                        <td>{subject.subject_code}</td>
                        <td>{subject.subject_name}</td>
                        <td>{subject.credits}</td>
                        <td>{subject.description}</td>
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
