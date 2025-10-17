import React from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import EditorHeader from './EditorHeader';
import MergeFieldsPanel from './MergeFieldsPanel';
import QuillEditor from './QuillEditor';

const FormEditorLayout = ({
  // Header props
  fileName = 'Untitled Document',
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onPreview,
  onExport,
  content = '',
  
  // Editor props
  onContentChange,
  onInsertField,
  readOnly = false,
  placeholder = 'Start typing your form content here...',
  editorHeight = '400px',
  editorModules = null,
  editorFormats = null,
  
  // Merge fields props
  mergeFields = [],
  
  // Layout props
  showMergeFields = true,
  mergeFieldsWidth = 3,
  editorWidth = 9,
  showImportInfo = false,
  importType = '',
  
  // Styling
  className = "",
  headerClassName = "",
  bodyClassName = "",
  mergeFieldsClassName = "",
  editorClassName = ""
}) => {
  // Handle insert field
  const handleInsertField = (fieldName) => {
    // Call parent callback if provided
    if (onInsertField) {
      onInsertField(fieldName);
    }
  };
  return (
    <Card className={`border-neutral-200 shadow-sm form-editor-layout ${className}`}>
      {/* Header */}
      <Card.Header className={`bg-light-custom border-neutral-200 ${headerClassName}`}>
        <EditorHeader
          fileName={fileName}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={onSave}
          onPreview={onPreview}
          onExport={onExport}
          content={content}
        />
      </Card.Header>

      <Card.Body className={`p-0 ${bodyClassName}`}>
        {showImportInfo && importType && (
          <Alert variant="info" className="m-3 mb-0">
            <strong>Import Info:</strong> This form was created from a {importType.toLowerCase()} file. 
            You can now edit the content and add merge fields as needed.
          </Alert>
        )}
        
        <Row className="g-0">
          {/* Merge Fields Panel */}
          {showMergeFields && (
            <Col xs={12} lg={mergeFieldsWidth} className="border-end">
              <MergeFieldsPanel
                mergeFields={mergeFields}
                onInsertField={handleInsertField}
                readOnly={readOnly}
                className={mergeFieldsClassName}
              />
            </Col>
          )}

          {/* Editor */}
          <Col xs={12} lg={editorWidth}>
            <div className="p-3">
              <QuillEditor
                content={content}
                onChange={onContentChange}
                onInsertField={onInsertField}
                readOnly={readOnly}
                placeholder={placeholder}
                height={editorHeight}
                modules={editorModules}
                formats={editorFormats}
                className={editorClassName}
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FormEditorLayout;
