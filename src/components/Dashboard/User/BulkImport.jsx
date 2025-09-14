import React, { useState, useRef } from 'react';
import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';
import { Upload, FileEarmarkSpreadsheet, CheckCircle, XCircle } from 'react-bootstrap-icons';

const BulkImport = ({ onImport, loading = false }) => {
  const [show, setShow] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const acceptedFileTypes = ['.csv', '.xlsx', '.xls'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    setErrorMessage('');
    setUploadStatus('idle');

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      setErrorMessage('Please select a valid file type (.csv, .xlsx, .xls)');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setErrorMessage('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onImport(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Reset after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return <FileEarmarkSpreadsheet size={48} className="text-primary-custom" />;
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle size={24} className="text-success" />;
      case 'error':
        return <XCircle size={24} className="text-danger" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="bulk-import-trigger"
      />

      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header className="bg-primary-custom text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <Upload className="me-2" size={20} />
            Bulk Import Users
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <div className="mb-4">
            <h6 className="text-primary-custom mb-2">Import Instructions</h6>
            <ul className="text-muted small mb-0">
              <li>Upload a CSV, XLSX, or XLS file with user data</li>
              <li>Required columns: Full Name, Email, Role, Department</li>
              <li>Optional columns: Phone, Status</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>

          {errorMessage && (
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded p-5 text-center transition-all ${
              dragActive 
                ? 'border-primary bg-primary-custom bg-opacity-10' 
                : 'border-neutral-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={openFileDialog}
          >
            {selectedFile ? (
              <div>
                {getFileIcon(selectedFile.name)}
                <h6 className="mt-3 text-primary-custom">{selectedFile.name}</h6>
                <p className="text-muted mb-0">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {getStatusIcon()}
              </div>
            ) : (
              <div>
                <Upload size={48} className="text-neutral-500 mb-3" />
                <h6 className="text-primary-custom">
                  {dragActive ? 'Drop file here' : 'Drag & drop file here'}
                </h6>
                <p className="text-muted mb-0">
                  or <span className="text-primary-custom">click to browse</span>
                </p>
                <small className="text-muted">
                  Supports CSV, XLSX, XLS files up to 10MB
                </small>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadStatus === 'uploading' && (
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">Uploading...</small>
                <small className="text-muted">{uploadProgress}%</small>
              </div>
              <ProgressBar 
                now={uploadProgress} 
                variant="primary"
                style={{ height: '8px' }}
              />
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <Alert variant="success" className="mt-3">
              <CheckCircle className="me-2" size={16} />
              Users imported successfully!
            </Alert>
          )}

          {/* Sample File Download */}
          <div className="mt-4 p-3 bg-light-custom rounded">
            <h6 className="text-primary-custom mb-2">Need a template?</h6>
            <p className="text-muted small mb-2">
              Download our sample file to see the correct format.
            </p>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                // Create and download sample CSV
                const csvContent = "Full Name,Email,Phone,Role,Department,Status\nJohn Doe,john.doe@company.com,+1-555-0123,Employee,IT,Active\nJane Smith,jane.smith@company.com,+1-555-0124,Manager,HR,Active";
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'user_import_template.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <FileEarmarkSpreadsheet className="me-2" size={16} />
              Download Template
            </Button>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={uploadStatus === 'uploading'}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
          >
            {uploadStatus === 'uploading' ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import Users
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Trigger button (hidden, triggered by parent) */}
      <button
        style={{ display: 'none' }}
        onClick={() => setShow(true)}
        id="bulk-import-hidden-trigger"
      />
    </>
  );
};

export default BulkImport;
