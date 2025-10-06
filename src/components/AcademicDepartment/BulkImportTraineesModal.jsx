import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';

const BulkImportTraineesModal = ({ show, onClose, onImport, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Required columns for trainee import (simplified)
  const requiredColumns = [
    'eid',
    'full_name'
  ];

  // All possible columns
  const allColumns = [
    'eid',
    'full_name'
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
            full_name: row[headers.indexOf('full_name')]?.toString().trim() || '',
            hasError: false,
            errors: []
          };

          // Validate trainee data
          if (!trainee.eid) {
            trainee.hasError = true;
            trainee.errors.push('EID is required');
          }

          if (!trainee.full_name) {
            trainee.hasError = true;
            trainee.errors.push('Full name is required');
          }

          return trainee;
        }).filter(trainee => trainee.eid || trainee.full_name); // Remove completely empty rows

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
      await onImport(traineesToImport);
      handleClose();
    } catch (error) {
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
                  <strong>Required columns:</strong> EID, Full Name
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
                      <th>Full Name</th>
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
                        <td>{trainee.full_name}</td>
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
