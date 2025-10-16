import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Save, Eye, Download, FileText } from 'react-bootstrap-icons';

const EditorHeader = ({
  fileName = 'Untitled Document',
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onPreview,
  onExport,
  content = '',
  className = ""
}) => {
  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      <div className="d-flex align-items-center">
        <FileText className="me-2 text-primary-custom" size={20} />
        <h5 className="mb-0 text-primary-custom">
          {fileName}
          {hasUnsavedChanges && <span className="text-warning ms-2">•</span>}
        </h5>
      </div>
      <div className="d-flex gap-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onPreview}
          disabled={!content.trim()}
        >
          <Eye className="me-1" size={14} />
          Preview
        </Button>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onExport}
          disabled={!content.trim()}
        >
          <Download className="me-1" size={14} />
          Export
        </Button>
        <Button
          variant="primary-custom"
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <Save className="me-1" size={14} />
          )}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
