import React, { useState, useRef } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { Upload, FileEarmark } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { uploadAPI } from '../../../api';
import apiClient from '../../../api/config';
import { readTemplateMetaFromStorage } from '../../../utils/templateBuilder';

const AddTemplateContentButton = ({ onSuccess, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef(null);

  const handleOpenModal = () => {
    setShowModal(true);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - only DOCX files
      const allowedTypes = ['.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select a valid Word document file (.docx)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const validateFileHasNoFields = async (fileUrl) => {
    try {
      setIsValidating(true);
      console.log('🔍 Validating file has no fields:', fileUrl);
      
      // Call extract-fields API to check if file has fields
      const { data } = await apiClient.post('/templates/extract-fields-from-url', { url: fileUrl });
      
      const fields = data?.fields || data || [];
      const hasFields = Array.isArray(fields) && fields.length > 0;
      
      console.log('🔍 Validation result:', {
        hasFields,
        fieldCount: fields.length
      });
      
      return !hasFields; // Return true if file has NO fields (valid)
    } catch (error) {
      console.error('❌ Error validating file:', error);
      // If API fails, assume invalid (safer)
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Delete old file from S3 before replacing
  const deleteOldFile = async (mediaId) => {
    if (!mediaId) {
      console.log('⚠️ No mediaId provided, skipping delete');
      return;
    }

    try {
      console.log('🗑️ Deleting old file with mediaId:', mediaId);
      console.log('📡 Calling DELETE /media/objects with body:', { key: mediaId });
      
      const response = await apiClient.delete('/media/objects', {
        data: { key: mediaId }
      });
      
      console.log('✅ Old file deleted successfully!', response.data);
      return true;
    } catch (error) {
      console.error('❌ Error deleting old file:', error);
      console.error('❌ Error response:', error.response?.data);
      // Don't throw error - continue with upload even if delete fails
      // This prevents blocking the user if the old file is already deleted or doesn't exist
      return false;
    }
  };

  const handleUploadAndValidate = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    let uploadedDocumentUrl = null;
    let uploadedMediaId = null;

    try {
      // Step 0: Delete old file if replacing
      const meta = readTemplateMetaFromStorage();
      const oldMediaId = meta.templateContentMediaId; // Get old mediaId if exists
      
      if (oldMediaId) {
        console.log('🔄 Replacing existing template content, deleting old file...');
        const deleted = await deleteOldFile(oldMediaId);
        if (deleted) {
          console.log('✅ Old file deleted successfully before upload');
        } else {
          console.log('⚠️ Failed to delete old file, but continuing with upload');
        }
      } else {
        console.log('➕ Adding new template content (no old file to delete)');
      }

      // Step 1: Upload file to S3 (temporary upload for validation)
      console.log('📤 Uploading file to S3 for validation...');
      const docsType = uploadAPI.getDocsType(selectedFile.name);
      const result = await uploadAPI.uploadDocument(selectedFile, docsType);
      
      // Extract URL and mediaId from response
      if (result.data && result.data.length > 0) {
        uploadedDocumentUrl = result.data[0].url;
        uploadedMediaId = result.data[0].id || result.data[0].mediaId || null;
        console.log('✅ File uploaded successfully! URL:', uploadedDocumentUrl);
        if (uploadedMediaId) {
          console.log('✅ MediaId from response:', uploadedMediaId);
        } else {
          console.log('⚠️ No mediaId in response, will try to extract from URL if needed');
        }
      } else {
        throw new Error('Invalid response format from upload API');
      }

      // Step 2: Validate file has no fields (BEFORE saving to localStorage)
      console.log('🔍 Validating file has no fields...');
      const isValid = await validateFileHasNoFields(uploadedDocumentUrl);
      
      if (!isValid) {
        // File contains fields - delete the uploaded file
        console.log('❌ File contains fields, deleting uploaded file...');
        if (uploadedMediaId) {
          const deleted = await deleteOldFile(uploadedMediaId);
          if (deleted) {
            console.log('✅ Invalid file deleted successfully');
          } else {
            console.log('⚠️ Failed to delete invalid file');
          }
        } else {
          console.log('⚠️ No mediaId to delete invalid file');
        }
        
        toast.error('File contains fields. Please upload a file without fields.');
        setIsUploading(false);
        return;
      }

      // Step 3: File is valid - Save to localStorage (including mediaId for future deletion)
      console.log('✅ File validation passed! Saving to localStorage...');
      const updatedMeta = {
        ...meta,
        templateContent: uploadedDocumentUrl,
        templateContentMediaId: uploadedMediaId // Save mediaId for future deletion
      };
      
      localStorage.setItem('templateInfo', JSON.stringify(updatedMeta));
      console.log('✅ templateContent saved:', uploadedDocumentUrl);
      if (uploadedMediaId) {
        console.log('✅ templateContentMediaId saved:', uploadedMediaId);
      }

      toast.success('Template content uploaded and validated successfully!');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(uploadedDocumentUrl);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('❌ Error uploading/validating file:', error);
      
      // If file was uploaded but validation failed, try to delete it
      if (uploadedMediaId) {
        console.log('🗑️ Attempting to clean up uploaded file due to error...');
        try {
          await deleteOldFile(uploadedMediaId);
          console.log('✅ Cleaned up uploaded file');
        } catch (deleteError) {
          console.error('❌ Failed to clean up uploaded file:', deleteError);
        }
      }
      
      toast.error('Failed to upload file: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Check if templateContent already exists
  const meta = readTemplateMetaFromStorage();
  const hasTemplateContent = !!meta.templateContent;

  return (
    <>
      <Button
        variant="outline-light"
        size="sm"
        onClick={handleOpenModal}
        className={`d-flex align-items-center gap-2 ${className}`}
        style={{
          borderWidth: '2px',
          fontWeight: '500',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.borderColor = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = '#fff';
        }}
        title={hasTemplateContent ? 'Original template already uploaded. Click to replace.' : 'Upload original template (file without fields)'}
      >
        <Upload size={16} />
        {hasTemplateContent ? 'Replace Original Template' : 'Original Template'}
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header className="bg-primary-custom text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <FileEarmark className="me-2" size={20} />
            {hasTemplateContent ? 'Replace Original Template' : 'Original Template'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Alert variant="info" className="mb-4">
            <strong>Important:</strong> Please upload a Word document (.docx) that does <strong>not</strong> contain any form fields. 
            The system will automatically validate this before saving.
          </Alert>

          <Form>
            <Form.Group>
              <Form.Label className="text-primary-custom">
                Select File <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="mb-2"
              />
              <Form.Text className="text-muted">
                Supported format: Word document (.docx). Maximum file size: 10MB
              </Form.Text>
            </Form.Group>

            {selectedFile && (
              <Alert variant="info" className="mt-3">
                <div className="d-flex align-items-center">
                  <FileEarmark className="me-2" size={20} />
                  <div>
                    <strong>Selected File:</strong> {selectedFile.name}
                    <br />
                    <small className="text-muted">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                </div>
              </Alert>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={handleCloseModal}
            disabled={isUploading || isValidating}
          >
            Cancel
          </Button>
          <Button
            variant="primary-custom"
            onClick={handleUploadAndValidate}
            disabled={!selectedFile || isUploading || isValidating}
          >
                {isUploading || isValidating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {isValidating ? 'Validating...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="me-2" size={14} />
                {hasTemplateContent ? 'Replace' : 'Upload'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddTemplateContentButton;

