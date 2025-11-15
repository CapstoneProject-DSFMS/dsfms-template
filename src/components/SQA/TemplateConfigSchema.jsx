import React from 'react';
import { Alert, Badge } from 'react-bootstrap';

const TemplateConfigSchema = ({ sections = [] }) => {
  if (sections.length === 0) {
    return (
      <Alert variant="info" className="mb-0">
        <div>
          <strong>No template config found</strong>
          <p className="mb-0 text-muted">This template has no sections or fields yet.</p>
        </div>
      </Alert>
    );
  }

  // Build a flat list: sections with their fields nested
  const items = [];
  
  sections.forEach((section, sectionIndex) => {
    // Add section
    items.push({
      type: 'section',
      id: section.id || `section-${sectionIndex}`,
      name: section.label || section.name,
      fieldCount: section.fields?.length || 0,
      data: section
    });
    
    // Add fields in this section (nested)
    if (section.fields && section.fields.length > 0) {
      section.fields.forEach((field, fieldIndex) => {
        items.push({
          type: 'field',
          id: field.id || field.fieldName || `field-${sectionIndex}-${fieldIndex}`,
          name: field.label || field.fieldName,
          parentSectionId: section.id || `section-${sectionIndex}`,
          data: field
        });
      });
    }
  });

  return (
    <div>
      <div className="list-group" style={{ border: 'none' }}>
        {items.map((item) => {
          const isSection = item.type === 'section';
          const isField = item.type === 'field';
          
          return (
            <div
              key={item.id}
              className="list-group-item"
              style={{
                border: 'none',
                borderBottom: '1px solid #e9ecef',
                padding: '12px 16px',
                backgroundColor: 'white',
                paddingLeft: isField ? '40px' : '16px'
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
                  <span 
                    style={{ 
                      fontSize: '14px',
                      color: '#333',
                      fontWeight: isSection ? 500 : 400,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {item.name}
                  </span>
                  {isSection && item.fieldCount > 0 && (
                    <Badge 
                      bg="info" 
                      className="ms-2"
                      style={{ 
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: '#0dcaf0',
                        color: '#000'
                      }}
                    >
                      {item.fieldCount}
                    </Badge>
                  )}
                </div>
                <Badge
                  bg={isSection ? 'warning' : 'secondary'}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: isSection ? '#ffc107' : 'var(--bs-secondary)',
                    color: isSection ? '#000' : '#fff',
                    fontWeight: 500,
                    marginLeft: '12px'
                  }}
                >
                  {isSection ? 'SECTION' : (item.data?.fieldType || item.data?.type || 'FIELD')}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateConfigSchema;

