import React from 'react';
import { Button, Alert } from 'react-bootstrap';
import { DEFAULT_MERGE_FIELDS } from '../../../constants/mergeFields';

const MergeFieldsPanel = ({ 
  mergeFields = [], 
  onInsertField, 
  readOnly = false,
  className = "",
  showCategories = false,
  selectedCategory = null
}) => {
  const fields = mergeFields.length > 0 ? mergeFields : DEFAULT_MERGE_FIELDS;

  return (
    <div className={`p-3 bg-light ${className}`}>
      <h6 className="mb-3 text-muted">Merge Fields</h6>
      <div className="d-grid gap-2">
        {fields.map((field) => (
          <Button
            key={field.name}
            variant="outline-secondary"
            size="sm"
            className="text-start d-flex align-items-center"
            onClick={() => onInsertField(field.name)}
            disabled={readOnly}
          >
            <div>
              <div className="fw-bold">{field.label}</div>
              <small className="text-muted">{field.name}</small>
            </div>
          </Button>
        ))}
      </div>
      
      <Alert variant="info" className="mt-3 mb-0" style={{ fontSize: '0.8rem' }}>
        <strong>Tip:</strong> Click any field to insert it into your document. 
        Merge fields will be replaced with actual data when the form is used.
      </Alert>
    </div>
  );
};

export default MergeFieldsPanel;
