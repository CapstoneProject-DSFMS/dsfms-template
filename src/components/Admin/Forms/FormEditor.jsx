import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import FormEditorLayout from './FormEditorLayout';
import OnlyOfficeEditor from './OnlyOfficeEditor';

const FormEditor = ({ 
  initialContent = '', 
  fileName = 'Untitled Document',
  onSave, 
  onPreview,
  onExport,
  readOnly = false,
  mergeFields = [],
  showMergeFields = true,
  showImportInfo = false,
  importType = '',
  className = ""
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (value) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };

  const handleInsertField = (fieldName) => {
    // Insert field into content with proper spacing
    const mergeField = `{{${fieldName}}}`;
    const newContent = content ? content + ' ' + mergeField : mergeField;
    setContent(newContent);
    setHasUnsavedChanges(true);
    toast.success(`Inserted {{${fieldName}}} field`);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(content);
      setHasUnsavedChanges(false);
      toast.success('Form saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save form');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(content);
    } else {
      // Default preview behavior
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(`
        <html>
          <head>
            <title>Preview: ${fileName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .merge-field { 
                background: #e3f2fd; 
                color: #007bff; 
                padding: 2px 6px; 
                border-radius: 3px; 
                font-weight: bold; 
              }
            </style>
          </head>
          <body>
            <h2>Preview: ${fileName}</h2>
            <div>${content.replace(/\{\{([^}]+)\}\}/g, '<span class="merge-field">{{$1}}</span>')}</div>
          </body>
        </html>
      `);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(content, fileName);
    } else {
      // Default export behavior
      toast.info('Export functionality will be implemented soon!');
    }
  };

  return (
    <div className={`form-editor ${className}`}>
      <FormEditorLayout
        fileName={fileName}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onPreview={handlePreview}
        onExport={handleExport}
        content={content}
        onContentChange={handleContentChange}
        onInsertField={handleInsertField}
        readOnly={readOnly}
        mergeFields={mergeFields}
        showMergeFields={showMergeFields}
        showImportInfo={showImportInfo}
        importType={importType}
      />
    </div>
  );
};

export default FormEditor;
