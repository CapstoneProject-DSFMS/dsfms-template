import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert, Form, Badge } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Download } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import traineeAPI from '../../api/trainee';
import { PermissionWrapper } from '../../components/Common'; // Assuming this path, common for components
import { PERMISSION_IDS } from '../../constants/permissionIds'; // Add this

const BulkImportTraineesModal = ({ show, onClose, onImport, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [lookupResults, setLookupResults] = useState(null);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const fileInputRef = useRef(null);

  // Required columns for trainee import (only eid and email)
  const requiredColumns = [
    'eid',
    'email'
  ];

  // All possible columns (simplified for lookup)
  const allColumns = [
    'eid',
    'email'
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

        // Process data - only extract eid and email for lookup
        const identifiers = dataRows.map((row, index) => {
          const eid = row[headers.indexOf('eid')]?.toString().trim() || '';
          const email = row[headers.indexOf('email')]?.toString().trim() || '';
          
          return {
            id: `temp_${index}`,
            rowNumber: index + 2,
            eid,
            email,
            hasError: false,
            errors: []
          };
        }).filter(item => item.eid || item.email); // Remove completely empty rows

        // Validate identifiers
        const validatedIdentifiers = identifiers.map(item => {
          if (!item.eid) {
            item.hasError = true;
            item.errors.push('EID is required');
          }

          if (!item.email) {
            item.hasError = true;
            item.errors.push('Email is required');
          } else if (!/\S+@\S+\.\S+/.test(item.email)) {
            item.hasError = true;
            item.errors.push('Email format is invalid');
          }

          return item;
        });

        setPreviewData(validatedIdentifiers);
        setValidationErrors([]);
        
        // Auto-lookup trainees after parsing file
        performLookup(validatedIdentifiers);

      } catch (error) {
        setErrors(['Failed to parse Excel file. Please check the file format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Perform lookup for trainees
  const performLookup = async (identifiersToLookup) => {
    const validIdentifiers = identifiersToLookup.filter(item => !item.hasError);
    
    if (validIdentifiers.length === 0) {
      return; // No valid identifiers to lookup
    }

    setIsLookingUp(true);
    setErrors([]);

    try {
      // Prepare identifiers for API call
      const identifiers = validIdentifiers.map(item => ({
        eid: item.eid,
        email: item.email
      }));

      // Call lookup API
      const response = await traineeAPI.lookupTrainees(identifiers);
      console.log('Lookup API response:', response);
      
      // Extract data from response (response structure: { message: "...", data: { foundUsers: [...], notFoundIdentifiers: [...] } })
      // API function returns response.data from axios, so response = { message: "...", data: { foundUsers: [...], notFoundIdentifiers: [...] } }
      const responseData = response.data || response;
      console.log('Response data extracted:', responseData);
      
      const foundUsers = responseData.foundUsers || [];
      const notFoundIdentifiers = responseData.notFoundIdentifiers || [];
      console.log('Found users:', foundUsers);
      console.log('Not found identifiers:', notFoundIdentifiers);
      
      // Create a map of found users
      const foundUsersMap = {};
      foundUsers.forEach(trainee => {
        const key = `${trainee.eid}:${trainee.email}`;
        foundUsersMap[key] = trainee;
        console.log(`Mapped trainee: ${key}`, trainee);
      });
      console.log('Found users map:', foundUsersMap);
      
      // Update preview data with lookup results
      const updatedPreviewData = identifiersToLookup.map(item => {
        const key = `${item.eid}:${item.email}`;
        const foundUser = foundUsersMap[key];
        console.log(`Checking item ${key}:`, { item, foundUser, key });
        
        if (item.hasError) {
          return item; // Keep existing errors
        }
        
        if (foundUser) {
          // Store matched user data in preview
          console.log(`✅ Matched: ${key}`);
          return {
            ...item,
            matchedUser: foundUser,
            isMatched: true,
            errors: []
          };
        } else {
          // Trainee not found in system
          console.log(`❌ Not found: ${key}`);
          return {
            ...item,
            isMatched: false,
            errors: ['Trainee not found in system']
          };
        }
      });
      console.log('Updated preview data:', updatedPreviewData);
      
      setPreviewData(updatedPreviewData);
      
      // Pre-select all matched trainees
      const matchedTrainees = updatedPreviewData
        .filter(item => item.matchedUser)
        .map(item => item.matchedUser);
      setSelectedTrainees(matchedTrainees);
      
      // Set lookup results for summary
      const notFoundCount = updatedPreviewData.filter(item => !item.isMatched && !item.hasError).length;
      setLookupResults({
        foundUsers: matchedTrainees,
        notFoundIdentifiers: updatedPreviewData
          .filter(item => !item.isMatched && !item.hasError)
          .map(item => ({ eid: item.eid, email: item.email })),
        uploadedIdentifiers: identifiers,
        hasErrors: notFoundCount > 0
      });
      
    } catch (error) {
      console.error('Lookup error:', error);
      setErrors([error.response?.data?.message || error.message || 'Failed to lookup trainees. Please try again.']);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedTrainees.length === 0) {
      setErrors(['Please select at least one trainee to import']);
      return;
    }

    try {
      // Call parent onImport callback with selected trainees
      if (onImport) {
        await onImport(selectedTrainees);
      }
      
      handleClose();
    } catch (error) {
      setErrors([error.message || 'Failed to import selected trainees. Please try again.']);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setLookupResults(null);
    setSelectedTrainees([]);
    setErrors([]);
    setValidationErrors([]);
    setDragActive(false);
    setIsLookingUp(false);
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
    // Create simplified template with only eid and email
    const templateData = [
      ['eid', 'email'], // Header row
      ['TE000001', 'john.doe@example.com'], // Sample data row 1
      ['TE000002', 'trollergamehuydk+7@gmail.com'], // Sample data row 2
      ['TE000003', 'bob.johnson@example.com'], // Sample data row 3
      ['TE000004', 'alice.brown@example.com'], // Sample data row 4
      ['TE000005', 'charlie.wilson@example.com'] // Sample data row 5
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // eid column width
      { wch: 30 }  // email column width
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainees Lookup Template');

    // Generate and download file
    const fileName = 'Trainees_Lookup_Template.xlsx';
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
                  <strong>Required columns:</strong> eid, email
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

        {/* Preview Table */}
        {previewData.length > 0 && (
          <Card className="mb-4">
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
                <Table striped hover className="mb-0" style={{ minWidth: '800px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '50px' }}>NO.</th>
                      <th style={{ minWidth: '150px' }}>EID</th>
                      <th style={{ minWidth: '250px' }}>EMAIL</th>
                      <th style={{ minWidth: '80px' }}>STATUS</th>
                      <th style={{ minWidth: '300px' }}>ERROR ENCOUNTERED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item) => {
                      const isMatched = item.isMatched === true && !item.hasError;
                      const hasError = item.hasError || (item.errors && item.errors.length > 0);
                      
                      return (
                        <tr key={item.id} className={hasError ? 'table-danger' : (isMatched ? 'table-success' : '')}>
                        <td>{item.rowNumber || item.id}</td>
                        <td>{item.eid || '-'}</td>
                        <td>{item.email || '-'}</td>
                        <td className="text-center">
                            {getStatusIcon(isMatched ? 'valid' : 'invalid')}
                        </td>
                        <td>
                            {item.errors && item.errors.length > 0 && (
                            <small className="text-danger">
                              {item.errors.length > 1 ? `${item.errors[0]} (+${item.errors.length - 1} more)` : item.errors[0]}
                            </small>
                          )}
                        </td>
                      </tr>
                      );
                    })}
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
        
        {lookupResults && lookupResults.foundUsers?.length > 0 && selectedTrainees.length > 0 && (
          <PermissionWrapper
            permission={PERMISSION_IDS.BULK_ENROLL_TRAINEES}
            fallback={null}
          >
            <Button
              variant="primary"
              onClick={handleImportSelected}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="me-2" size={16} />
                  Import Selected ({selectedTrainees.length} matched trainees)
                </>
              )}
            </Button>
          </PermissionWrapper>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportTraineesModal;
