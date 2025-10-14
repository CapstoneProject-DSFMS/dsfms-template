import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert, Form, Badge } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Download, Search } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import { traineeAPI } from '../../api/trainee';

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

      } catch (error) {
        setErrors(['Failed to parse Excel file. Please check the file format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLookupTrainees = async () => {
    const validIdentifiers = previewData.filter(item => !item.hasError);
    
    if (validIdentifiers.length === 0) {
      setErrors(['No valid identifiers to lookup']);
      return;
    }

    setIsLookingUp(true);
    setErrors([]);

    try {
      // Prepare identifiers for API call - try different formats
      const identifiers = validIdentifiers.map(item => ({
        eid: item.eid,
        email: item.email
      }));

      console.log('Sending lookup request with identifiers:', identifiers);

      // Call lookup API
      const response = await traineeAPI.lookupTrainees(identifiers);
      console.log('Lookup response:', response);
      console.log('Found users:', response.foundUsers);
      console.log('Not found:', response.notFoundIdentifiers);
      
      // Debug: Check structure of found users
      if (response.foundUsers && response.foundUsers.length > 0) {
        console.log('🔍 First found user structure:', response.foundUsers[0]);
        console.log('🔍 All found user IDs:', response.foundUsers.map(u => ({ id: u.id, eid: u.eid, email: u.email })));
      }
      
      // Filter found users to only include exact matches with uploaded identifiers
      const exactMatches = (response.foundUsers || []).filter(trainee => {
        return identifiers.some(id => 
          id.eid === trainee.eid && id.email === trainee.email
        );
      });
      
      // Find identifiers that were not found
      const notFoundIdentifiers = identifiers.filter(id => 
        !exactMatches.some(trainee => 
          trainee.eid === id.eid && trainee.email === id.email
        )
      );
      
      // Validate that exact matches have proper UUIDs
      const validatedMatches = exactMatches.map(trainee => {
        console.log('🔍 Validating trainee:', {
          id: trainee.id,
          eid: trainee.eid,
          email: trainee.email,
          firstName: trainee.firstName,
          lastName: trainee.lastName
        });
        
        if (!trainee.id || typeof trainee.id !== 'string' || trainee.id.length < 10) {
          throw new Error(`Trainee ${trainee.eid} has invalid UUID: ${trainee.id}`);
        }
        
        if (!trainee.firstName || !trainee.lastName) {
          throw new Error(`Trainee ${trainee.eid} has missing name fields`);
        }
        
        return trainee;
      });
      
      const validatedResponse = {
        foundUsers: validatedMatches,
        notFoundIdentifiers: notFoundIdentifiers,
        uploadedIdentifiers: identifiers
      };
      
      console.log('Exact matches found:', validatedMatches);
      console.log('Not found identifiers:', notFoundIdentifiers);
      
      setLookupResults(validatedResponse);
      
      // Initialize selected trainees with exact matches only
      setSelectedTrainees(validatedMatches);
      console.log('Set selected trainees (exact matches only):', validatedMatches);
      
    } catch (error) {
      console.error('Lookup error:', error);
      console.error('Error response:', error.response?.data);
      setErrors([error.response?.data?.message || error.message || 'Failed to lookup trainees. Please try again.']);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSelectTrainee = (trainee, isSelected) => {
    if (isSelected) {
      setSelectedTrainees(prev => [...prev, trainee]);
    } else {
      setSelectedTrainees(prev => prev.filter(t => t.id !== trainee.id));
    }
  };

  const handleSelectAllTrainees = (isSelected) => {
    if (isSelected) {
      setSelectedTrainees(lookupResults?.foundUsers || []);
    } else {
      setSelectedTrainees([]);
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
      ['TE000002', 'jane.smith@example.com'], // Sample data row 2
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

        {/* Uploaded Identifiers - Always show when available */}
        {previewData.length > 0 && (
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                Uploaded Identifiers ({previewData.length} entries)
                <span className="ms-2">
                  <CheckCircle className="text-success me-1" size={16} />
                  {previewData.filter(t => !t.hasError).length} valid
                  <XCircle className="text-danger ms-2 me-1" size={16} />
                  {previewData.filter(t => t.hasError).length} invalid
                </span>
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="bg-light sticky-top">
                    <tr>
                      <th>Status</th>
                      <th>EID</th>
                      <th>Email</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <tr key={item.id} className={item.hasError ? 'table-danger' : 'table-success'}>
                        <td>
                          {getStatusIcon(item.hasError ? 'invalid' : 'valid')}
                        </td>
                        <td>{item.eid}</td>
                        <td>{item.email}</td>
                        <td>
                          {item.errors.length > 0 && (
                            <small className="text-danger">
                              {item.errors.join(', ')}
                            </small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-light">
              <Button
                variant="primary"
                onClick={handleLookupTrainees}
                disabled={isLookingUp || previewData.filter(t => !t.hasError).length === 0}
                className="d-flex align-items-center"
              >
                {isLookingUp ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="me-2" size={16} />
                    Lookup Existing Trainees ({previewData.filter(t => !t.hasError).length} valid)
                  </>
                )}
              </Button>
            </Card.Footer>
          </Card>
        )}

        {/* Lookup Results - Only show matched trainees from Excel */}
        {lookupResults && (
          <Card>
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                Matched Trainees from Excel
                <span className="ms-2">
                  <CheckCircle className="text-success me-1" size={16} />
                  {lookupResults.foundUsers?.length || 0} matched
                  <XCircle className="text-danger ms-2 me-1" size={16} />
                  {lookupResults.notFoundIdentifiers?.length || 0} not found
                </span>
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              {lookupResults.foundUsers?.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table hover className="mb-0">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectedTrainees.length === (lookupResults.foundUsers?.length || 0) && (lookupResults.foundUsers?.length || 0) > 0}
                            onChange={(e) => handleSelectAllTrainees(e.target.checked)}
                          />
                        </th>
                        <th>EID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Matched From Excel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lookupResults.foundUsers?.map((trainee) => {
                        // Find the original identifier from Excel that matched this trainee
                        const matchedIdentifier = lookupResults.uploadedIdentifiers?.find(
                          id => id.eid === trainee.eid && id.email === trainee.email
                        );
                        
                        // Only show if there's an exact match
                        if (!matchedIdentifier) {
                          return null;
                        }
                        
                        return (
                          <tr key={trainee.id} className={selectedTrainees.some(t => t.id === trainee.id) ? 'table-success' : ''}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedTrainees.some(t => t.id === trainee.id)}
                                onChange={(e) => handleSelectTrainee(trainee, e.target.checked)}
                              />
                            </td>
                            <td>{trainee.eid}</td>
                            <td>{trainee.firstName} {trainee.lastName}</td>
                            <td>{trainee.email}</td>
                            <td>{trainee.phoneNumber}</td>
                            <td>
                              <Badge bg={trainee.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                {trainee.status}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="success">
                                ✓ Exact Match
                              </Badge>
                            </td>
                          </tr>
                        );
                      }).filter(Boolean)}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <XCircle size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No matching trainees found</h6>
                  <p className="text-muted mb-0">
                    None of the uploaded identifiers match existing trainees with TRAINEE role in the system.
                  </p>
                </div>
              )}
            </Card.Body>
            {lookupResults.notFoundIdentifiers?.length > 0 && (
              <Card.Footer className="bg-warning bg-opacity-10">
                <Alert variant="warning" className="mb-0">
                  <strong>Identifiers Not Found in System ({lookupResults.notFoundIdentifiers.length}):</strong>
                  <p className="mb-2 mt-2">These identifiers from your Excel file do not exist in the system:</p>
                  <ul className="mb-0">
                    {lookupResults.notFoundIdentifiers.map((identifier, index) => (
                      <li key={index}>
                        <strong>{identifier.eid}</strong> - {identifier.email}
                      </li>
                    ))}
                  </ul>
                </Alert>
              </Card.Footer>
            )}
          </Card>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        {lookupResults && lookupResults.foundUsers?.length > 0 && selectedTrainees.length > 0 && (
          <Button
            variant="primary"
            onClick={handleImportSelected}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import Selected ({selectedTrainees.length} matched trainees)
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportTraineesModal;
