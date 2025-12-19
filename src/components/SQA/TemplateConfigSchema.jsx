import React, { useMemo } from 'react';
import { Alert, Badge } from 'react-bootstrap';

const TemplateConfigSchema = ({ sections = [] }) => {
  // Build hierarchy tree and calculate levels for proper indentation
  const items = useMemo(() => {
    if (sections.length === 0) {
      return [];
    }

    // Log API response structure for debugging
    console.log('TemplateConfigSchema - Sections from API:', sections);
    if (sections[0]?.fields) {
      console.log('First field structure:', sections[0].fields[0]);
    }

    const itemsList = [];
    
    sections.forEach((section, sectionIndex) => {
      // Add section
      itemsList.push({
        type: 'section',
        id: section.id || `section-${sectionIndex}`,
        name: section.label || section.name,
        fieldCount: section.fields?.length || 0,
        data: section,
        isSubmittable: Boolean(section.isSubmittable),
        isToggleDependent: Boolean(section.isToggleDependent),
        level: 0
      });
      
      if (!section.fields || !Array.isArray(section.fields) || section.fields.length === 0) {
        return;
      }

      // Build field maps for lookup
      const mapById = {};
      const mapByTempId = {};
      const mapByName = {};
      
      section.fields.forEach((field) => {
        if (field.id) mapById[field.id] = field;
        if (field.tempId) mapByTempId[field.tempId] = field;
        const fieldName = field.fieldName || field.name;
        if (fieldName) mapByName[fieldName] = field;
      });

      // Find parent field
      const findParent = (field) => {
        // Try parentId (UUID) first
        if (field.parentId) {
          const parent = mapById[field.parentId];
          if (parent) return parent;
        }
        
        // Try parentTempId (string) - for PART/CHECKBOX fields
        if (field.parentTempId) {
          const parent = mapByTempId[field.parentTempId];
          if (parent) return parent;
          
          // Fallback: try to find PART field by name
          // parentTempId format: "{fieldName}-parent"
          const parentName = field.parentTempId.replace('-parent', '');
          const parentByName = mapByName[parentName];
          if (parentByName && (parentByName.fieldType === 'PART' || parentByName.fieldType === 'CHECK_BOX')) {
            return parentByName;
          }
        }
        
        return null;
      };

      // Build hierarchy: organize fields by parent-child relationship
      const topLevelFields = [];
      const childrenMap = {}; // parentId/tempId → [children]
      
      section.fields.forEach((field) => {
        const parent = findParent(field);
        
        if (!parent) {
          // Top-level field (no parent)
          topLevelFields.push(field);
        } else {
          // Child field - group by parent
          const parentKey = parent.id || parent.tempId || (parent.fieldName ? `${parent.fieldName}-parent` : null);
          if (parentKey) {
            if (!childrenMap[parentKey]) {
              childrenMap[parentKey] = [];
            }
            childrenMap[parentKey].push(field);
          } else {
            // Fallback: treat as top-level if can't determine parent key
            topLevelFields.push(field);
          }
        }
      });

      // Render fields in hierarchy order
      const renderFieldWithChildren = (field, level = 1) => {
        const fieldId = field.id || field.fieldName;
        const parentKey = field.id || field.tempId || (field.fieldName ? `${field.fieldName}-parent` : null);
        
        // Add current field
        itemsList.push({
          type: 'field',
          id: fieldId || `field-${sectionIndex}-${Date.now()}`,
          name: field.label || field.fieldName,
          parentSectionId: section.id || `section-${sectionIndex}`,
          data: field,
          level: level
        });

        // Add children if any
        if (parentKey && childrenMap[parentKey] && childrenMap[parentKey].length > 0) {
          childrenMap[parentKey].forEach((child) => {
            renderFieldWithChildren(child, level + 1);
          });
        }
      };

      // Render all top-level fields (they will render their children recursively)
      topLevelFields.forEach((field) => {
        renderFieldWithChildren(field, 1);
      });
    });

    return itemsList;
  }, [sections]);

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

  // Calculate padding based on level
  const getPaddingLeft = (level) => {
    // Section: 16px
    // Level 1 (no parent): 40px
    // Level 2 (child of PART/CHECKBOX): 64px
    // Level 3 (child of CHECKBOX): 88px
    // Level 4+: 112px+
    if (level === 0) return '16px';
    // Base padding 16px + (level - 1) * 32px for better visibility
    return `${16 + ((level - 1) * 32)}px`;
  };

  return (
    <div>
      <div className="list-group" style={{ border: 'none' }}>
        {items.map((item) => {
          const isSection = item.type === 'section';
          const isField = item.type === 'field';
          const level = item.level || 0;
          
          return (
            <div
              key={item.id}
              className="list-group-item"
              style={{
                border: 'none',
                borderBottom: '1px solid #e9ecef',
                padding: '12px 16px',
                backgroundColor: 'white',
                paddingLeft: getPaddingLeft(level)
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
                  {/* Visual indicator for hierarchy */}
                  {isField && level > 1 && (
                    <span 
                      style={{ 
                        color: '#6c757d',
                        marginRight: '8px',
                        fontSize: '12px',
                        userSelect: 'none'
                      }}
                    >
                      {'└─ '}
                    </span>
                  )}
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
                  {isField && (item.data?.fieldName || item.data?.name) && (
                    <span 
                      style={{ 
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'Fira Mono, monospace',
                        marginLeft: '8px',
                        padding: '2px 6px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '3px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {item.data.fieldName || item.data.name}
                    </span>
                  )}
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
                <div className="d-flex align-items-center gap-1" style={{ flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                  {/* isSubmittable and isToggleDependent badges */}
                  {isSection && (
                    <div className="d-flex align-items-center gap-1" style={{ flexWrap: 'wrap' }}>
                      {item.isSubmittable && (
                        <Badge
                          bg="success"
                          style={{
                            fontSize: '10px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Submittable
                        </Badge>
                      )}
                      {item.isToggleDependent && (
                        <Badge
                          bg="info"
                          style={{
                            fontSize: '10px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#17a2b8',
                            color: '#fff',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Toggle Dependent
                        </Badge>
                      )}
                    </div>
                  )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateConfigSchema;


