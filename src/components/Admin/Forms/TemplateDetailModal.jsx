import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { 
  X, 
  FileText, 
  Eye, 
  FileEarmarkPdf,
  Person,
  Building,
  CheckCircle,
  Clock,
  Download,
  FileEarmarkPlus,
  Calendar,
  ListUl,
  ListCheck,
  ClockHistory,
  PencilSquare,
  Ban
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../../constants/routes';
import { userAPI } from '../../../api/user';
import templateAPI from '../../../api/template';

const TemplateDetailModal = ({ show, onHide, template, onCreateVersion }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [reviewedByUser, setReviewedByUser] = useState(null);
  const [loadingReviewedBy, setLoadingReviewedBy] = useState(false);
  const [fullTemplateData, setFullTemplateData] = useState(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [pdfConfigUrl, setPdfConfigUrl] = useState(null);
  const [loadingPDFConfig, setLoadingPDFConfig] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [disabling, setDisabling] = useState(false);

  // console.log('TemplateDetailModal received template:', template);

  // Fetch reviewed by user info if reviewedByUserId exists
  useEffect(() => {
    const fetchReviewedByUser = async () => {
      if (template?.reviewedByUserId && show) {
        try {
          setLoadingReviewedBy(true);
          const userData = await userAPI.getUserById(template.reviewedByUserId);
          const user = userData.data || userData;
          setReviewedByUser(user);
        } catch (error) {
          console.error('Error fetching reviewed by user:', error);
          setReviewedByUser(null);
        } finally {
          setLoadingReviewedBy(false);
        }
      } else {
        setReviewedByUser(null);
      }
    };

    fetchReviewedByUser();
  }, [template?.reviewedByUserId, show]);

  // Fetch full template data when modal opens and template doesn't have sections/fields
  useEffect(() => {
    const fetchFullTemplateData = async () => {
      // Only fetch if modal is open, template has id, and template doesn't already have sections
      if (template?.id && show && !template.sections) {
        try {
          setLoadingFullData(true);
          const response = await templateAPI.getTemplateById(template.id);
          const templateData = response.data || response;
          setFullTemplateData(templateData);
        } catch (error) {
          console.error('Error fetching full template data:', error);
          setFullTemplateData(null);
        } finally {
          setLoadingFullData(false);
        }
      } else if (template?.sections) {
        // If template already has sections, use it directly
        setFullTemplateData(template);
      } else {
        setFullTemplateData(null);
      }
    };

    fetchFullTemplateData();
  }, [template?.id, show, template?.sections]);

  // Load PDF for Content Preview tab (getTemplatePDF) - Cache it, don't reload on tab change
  useEffect(() => {
    const loadPDF = async () => {
      if (template?.id && show && !pdfUrl) {
        try {
          setLoadingPDF(true);
          // Content Preview uses getTemplatePDF
          const pdfBlob = await templateAPI.getTemplatePDF(template.id);
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfUrl(null);
        } finally {
          setLoadingPDF(false);
        }
      }
    };

    loadPDF();

    // Cleanup only when modal closes
    return () => {
      if (!show) {
        setPdfUrl(prevUrl => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return null;
        });
      }
    };
  }, [template?.id, show, pdfUrl]);

  // Load PDF Config for Template Config Overview tab (getTemplatePdfConfig) - Cache it, don't reload on tab change
  useEffect(() => {
    const loadPDFConfig = async () => {
      if (template?.id && show && !pdfConfigUrl) {
        try {
          setLoadingPDFConfig(true);
          // Template Config Overview uses getTemplatePdfConfig
          const pdfBlob = await templateAPI.getTemplatePdfConfig(template.id);
          const url = URL.createObjectURL(pdfBlob);
          setPdfConfigUrl(url);
        } catch (error) {
          console.error('Error loading PDF config:', error);
          setPdfConfigUrl(null);
        } finally {
          setLoadingPDFConfig(false);
        }
      }
    };

    loadPDFConfig();

    // Cleanup only when modal closes
    return () => {
      if (!show) {
        setPdfConfigUrl(prevUrl => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return null;
        });
      }
    };
  }, [template?.id, show, pdfConfigUrl]);

  if (!template) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', icon: Clock, text: 'PENDING' },
      'PUBLISHED': { variant: 'success', icon: CheckCircle, text: 'PUBLISHED' },
      'DRAFT': { variant: 'secondary', icon: FileText, text: 'DRAFT' },
      'ARCHIVED': { variant: 'dark', icon: FileText, text: 'ARCHIVED' }
    };
    
    const config = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
        <Icon size={12} />
        {config.text}
      </Badge>
    );
  };

  const handleCreateNewVersion = () => {
    if (onCreateVersion) {
      onCreateVersion(template);
    } else {
      // Default behavior: just close modal
      console.log('Create new version for template:', template.id);
      onHide();
    }
  };

  const handleUpdateRejectedTemplate = () => {
    // Navigate to FormEditorPage with update rejected template flag
    const templateToUse = fullTemplateData || template;
    navigate(ROUTES.TEMPLATES_EDITOR, {
      state: {
        isUpdateRejected: true,
        templateId: templateToUse.id,
        templateInfo: templateToUse,
        fileName: templateToUse.name || 'Untitled Document',
        importType: 'Update Rejected Template',
        // Load template content if available
        documentUrl: templateToUse.templateContent?.startsWith('http') ? templateToUse.templateContent : null,
        content: templateToUse.templateContent?.startsWith('http') ? null : templateToUse.templateContent,
        initialSections: templateToUse.sections || []
      }
    });
    onHide(); // Close modal
  };

  const handleDisableTemplate = async () => {
    try {
      setDisabling(true);
      await templateAPI.disableTemplate(template.id);
      toast.success('Template disabled successfully');
      onHide();
    } catch (error) {
      console.error('Error disabling template:', error);
      toast.error(error?.response?.data?.message || 'Failed to disable template');
    } finally {
      setDisabling(false);
    }
  };

  // Check if template is rejected
  const isRejected = template?.status === 'REJECTED' || template?.status === 'DENIED';


  const renderDetails = () => (
    <div className="template-details" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="list-group list-group-flush" style={{ flex: 1 }}>
        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Template Name</strong>
              <span className="text-dark">{template?.name || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Building className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Department</strong>
              <span className="text-dark">{template.department?.name || 'N/A'}</span>
              {template.department?.code && (
                <small className="text-muted d-block">{template.department.code}</small>
              )}
            </div>
          </div>
        </div>

        {template.description && (
          <div className="list-group-item border-0 px-0 py-3">
            <div className="d-flex align-items-start">
              <FileText className="text-primary-custom me-3" size={20} />
              <div className="flex-grow-1">
                <strong className="text-muted small d-block mb-1">Description</strong>
                <span className="text-dark">{template.description}</span>
              </div>
            </div>
          </div>
        )}

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <CheckCircle className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Status</strong>
              <div>{getStatusBadge(template.status)}</div>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Version</strong>
              <span className="text-dark">Version {template.version}</span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <FileText className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Sections</strong>
              <span className="text-dark">
                {template._count?.sections || 0} {template._count?.sections === 1 ? 'section' : 'sections'}
              </span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Person className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Created By</strong>
              <span className="text-dark">
                {template.createdByUser?.firstName || ''} {template.createdByUser?.lastName || ''}
              </span>
              <small className="text-muted d-block">
                <Calendar className="me-1" size={12} />
                {formatDateTime(template.createdAt)}
              </small>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <Clock className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Last Updated</strong>
              <span className="text-dark">
                {formatDateTime(template.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="list-group-item border-0 px-0 py-3">
          <div className="d-flex align-items-center">
            <CheckCircle className="text-primary-custom me-3" size={20} />
            <div className="flex-grow-1">
              <strong className="text-muted small d-block mb-1">Reviewed By</strong>
              {template.reviewedByUserId ? (
                <>
                  {loadingReviewedBy ? (
                    <span className="text-muted">Loading...</span>
                  ) : reviewedByUser ? (
                    <>
                      <span className="text-dark">
                        {reviewedByUser.firstName || ''} {reviewedByUser.lastName || ''}
                      </span>
                      {template.reviewedAt && (
                        <small className="text-muted d-block">
                          <Calendar className="me-1" size={12} />
                          {formatDateTime(template.reviewedAt)}
                        </small>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">User ID: {template.reviewedByUserId}</span>
                  )}
                </>
              ) : (
                <span className="text-muted">Not reviewed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSections = () => {
    const sectionsData = fullTemplateData?.sections || template?.sections || [];
    
    if (loadingFullData) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading sections...</p>
        </div>
      );
    }

    if (sectionsData.length === 0) {
      return (
        <Alert variant="info" className="mb-0">
          <div>
            <strong>No sections found</strong>
            <p className="mb-0 text-muted">This template has no sections yet.</p>
          </div>
        </Alert>
      );
    }

    return (
      <div>
        <div className="mb-3">
          <h6 className="mb-0">Template Sections ({sectionsData.length})</h6>
        </div>
        <div className="list-group">
          {sectionsData.map((section, index) => (
            <div key={section.id || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{section.label || section.name}</h6>
                  <small className="text-muted">
                    Edit by: {section.editBy || 'TRAINER'} • 
                    {section.fields?.length || 0} field(s)
                  </small>
                </div>
                <Badge bg="secondary">{section.displayOrder || index + 1}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFields = () => {
    // Flatten all fields from all sections
    const sectionsData = fullTemplateData?.sections || template?.sections || [];
    const allFields = sectionsData.flatMap(section => section.fields || []);
    
    if (loadingFullData) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading fields...</p>
        </div>
      );
    }

    if (allFields.length === 0) {
      return (
        <Alert variant="info" className="mb-0">
          <div>
            <strong>No fields found</strong>
            <p className="mb-0 text-muted">This template has no fields yet.</p>
          </div>
        </Alert>
      );
    }

    return (
      <div>
        <div className="mb-3">
          <h6 className="mb-0">Template Fields ({allFields.length})</h6>
        </div>
        <div className="list-group">
          {allFields.map((field, index) => (
            <div key={field.id || field.fieldName || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{field.label}</h6>
                  <small className="text-muted">
                    {field.fieldName} ({field.fieldType}) • 
                    {field.roleRequired || 'TRAINER'}
                  </small>
                </div>
                <Badge bg="info">{field.fieldType}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const sectionsData = fullTemplateData?.sections || template?.sections || [];
    
    // Build structure with parent-child relationship for collapse and indentation
    const sectionStructure = sectionsData.map((section, sectionIndex) => {
      if (!section.fields || !Array.isArray(section.fields) || section.fields.length === 0) {
        return {
          type: 'section',
          id: section.id || `section-${sectionIndex}`,
          name: section.label || section.name,
          fieldCount: 0,
          data: section,
          fields: [],
          isSubmittable: Boolean(section.isSubmittable),
          isToggleDependent: Boolean(section.isToggleDependent)
        };
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
          
          // Fallback: try to find PART/CHECKBOX field by name
          // parentTempId format: "{fieldName}-parent"
          const parentName = field.parentTempId.replace('-parent', '');
          const parentByName = mapByName[parentName];
          if (parentByName && (parentByName.fieldType === 'PART' || parentByName.fieldType === 'CHECK_BOX')) {
            return parentByName;
          }
        }
        
        return null;
      };

      // Calculate field level based on parent chain
      const getFieldLevel = (field, visited = new Set()) => {
        // If no parent reference, it's level 1
        if (!field.parentId && !field.parentTempId) {
          return 1;
        }

        // Prevent circular reference
        const fieldId = field.id || field.fieldName || field.tempId;
        if (fieldId && visited.has(fieldId)) {
          return 1; // Fallback to level 1 if circular
        }
        if (fieldId) {
          visited.add(fieldId);
        }

        // Find parent field
        const parent = findParent(field);
        if (!parent) {
          return 1; // Parent not found, treat as level 1
        }

        // Recursively calculate parent level + 1
        return 1 + getFieldLevel(parent, visited);
      };

      // Build hierarchy: organize fields by parent-child relationship
      const topLevelFields = [];
      const childrenMap = {}; // parentKey → [children]
      
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

      // Build ordered fields list with hierarchy
      const orderedFields = [];
      const renderFieldWithChildren = (field) => {
        const fieldId = field.id || field.fieldName;
        const parentKey = field.id || field.tempId || (field.fieldName ? `${field.fieldName}-parent` : null);
        
        // Add current field with level
        orderedFields.push({
          ...field,
          _level: getFieldLevel(field)
        });

        // Add children if any
        if (parentKey && childrenMap[parentKey] && childrenMap[parentKey].length > 0) {
          childrenMap[parentKey].forEach((child) => {
            renderFieldWithChildren(child);
          });
        }
      };

      // Render all top-level fields (they will render their children recursively)
      topLevelFields.forEach((field) => {
        renderFieldWithChildren(field);
      });

      return {
        type: 'section',
        id: section.id || `section-${sectionIndex}`,
        name: section.label || section.name,
        fieldCount: section.fields.length,
        data: section,
        fields: orderedFields.length > 0 ? orderedFields : section.fields, // Use ordered fields if hierarchy was built
        isSubmittable: Boolean(section.isSubmittable),
        isToggleDependent: Boolean(section.isToggleDependent)
      };
    });

    const toggleSection = (sectionId) => {
      setCollapsedSections(prev => ({
        ...prev,
        [sectionId]: !prev[sectionId]
      }));
    };

    return (
      <Row style={{ height: '100%', margin: 0, gap: 0 }}>
        {/* PDF Preview - Left Column */}
        <Col xs={12} lg={6} style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', height: '100%', minHeight: 0 }}>
          <h6 className="mb-2" style={{ color: '#333', fontWeight: 500, flexShrink: 0 }}>Template Preview</h6>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa'
          }}>
            {loadingPDFConfig ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : pdfConfigUrl ? (
              <iframe 
                src={pdfConfigUrl} 
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  width: '100%',
                  minHeight: 0
                }}
                title="Template PDF Preview"
              />
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px'
              }}>
                <Alert variant="warning" className="mb-0">
                  <strong>No PDF Preview</strong>
                  <p className="mb-0 text-muted">PDF preview not available</p>
                </Alert>
              </div>
            )}
          </div>
        </Col>

        {/* Fields List - Right Column */}
        <Col xs={12} lg={6} style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', height: '100%', minHeight: 0 }}>
          <h6 className="mb-2" style={{ color: '#333', fontWeight: 500, flexShrink: 0 }}>Template fields & sections</h6>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {loadingFullData ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : sectionStructure.length === 0 ? (
              <Alert variant="info" className="mb-0">
                <div>
                  <strong>No template config found</strong>
                  <p className="mb-0 text-muted">This template has no sections or fields yet.</p>
                </div>
              </Alert>
            ) : (
              <div className="list-group" style={{ border: '1px solid #dee2e6', borderRadius: '4px', flex: 1, overflowY: 'auto', minHeight: 0, maxHeight: '100%' }}>
                {sectionStructure.map((section) => {
                  const isCollapsed = collapsedSections[section.id];
                  
                  return (
                    <div key={section.id}>
                      {/* Section Header */}
                      <div
                        className="list-group-item"
                        style={{
                          border: 'none',
                          borderBottom: '1px solid #e9ecef',
                          padding: '12px 16px',
                          backgroundColor: '#f8f9fa',
                          cursor: 'pointer',
                          userSelect: 'none',
                          flexShrink: 0,
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0, gap: '8px' }}>
                            {/* Arrow Icon */}
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                transition: 'transform 0.3s ease',
                                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                flexShrink: 0
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 5L11 10L6 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            <span 
                              style={{ 
                                fontSize: '14px',
                                color: '#333',
                                fontWeight: 600,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {section.name}
                            </span>
                            {section.fieldCount > 0 && (
                              <Badge 
                                bg="info" 
                                style={{ 
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: '#0dcaf0',
                                  color: '#000',
                                  flexShrink: 0
                                }}
                              >
                                {section.fieldCount}
                              </Badge>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                            {/* isSubmittable and isToggleDependent badges */}
                            <div className="d-flex align-items-center gap-1" style={{ flexWrap: 'wrap' }}>
                              {section.isSubmittable && (
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
                              {section.isToggleDependent && (
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
                            <Badge
                              bg="warning"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: '#ffc107',
                                color: '#000',
                                fontWeight: 500
                              }}
                            >
                              SECTION
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Fields List */}
                      {!isCollapsed && section.fields.map((field, fieldIndex) => {
                        // Calculate padding based on level
                        const level = field._level || 1;
                        const getPaddingLeft = (level) => {
                          // Level 1 (no parent): 48px
                          // Level 2 (child of PART/CHECKBOX): 80px
                          // Level 3 (child of CHECKBOX): 112px
                          // Level 4+: 144px+
                          return `${48 + ((level - 1) * 32)}px`;
                        };
                        const paddingLeft = getPaddingLeft(level);
                        const isChildField = level > 1;

                        return (
                          <div
                            key={field.id || field.fieldName || `field-${fieldIndex}`}
                            className="list-group-item"
                            style={{
                              border: 'none',
                              borderBottom: '1px solid #e9ecef',
                              padding: '12px 16px',
                              paddingLeft: paddingLeft,
                              backgroundColor: 'white',
                              flexShrink: 0,
                              animation: 'slideDown 0.2s ease',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
                                {/* Visual indicator for hierarchy */}
                                {isChildField && (
                                  <span 
                                    style={{ 
                                      color: '#6c757d',
                                      marginRight: '8px',
                                      fontSize: '12px',
                                      userSelect: 'none',
                                      flexShrink: 0
                                    }}
                                  >
                                    {'└─ '}
                                  </span>
                                )}
                                <span 
                                  style={{ 
                                    fontSize: '14px',
                                    color: '#555',
                                    fontWeight: 400,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                  }}
                                >
                                  {field.label || field.fieldName}
                                </span>
                              </div>
                              <Badge
                                bg="secondary"
                                style={{
                                  fontSize: '11px',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bs-secondary)',
                                  color: '#fff',
                                  fontWeight: 500,
                                  marginLeft: '12px',
                                  flexShrink: 0
                                }}
                              >
                                {field.fieldType || field.type || 'FIELD'}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* CSS for animation */}
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-5px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </Col>
      </Row>
    );
  };

  const renderHistory = () => {
    // History versions are not available in the current API response
    // This would need to be implemented separately if needed
    const historyVersions = [];
    
    if (loadingFullData) {
      return (
        <div className="text-center" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <div>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading version history...</p>
          </div>
        </div>
      );
    }

    if (historyVersions.length === 0) {
      return (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <Alert variant="info" className="mb-0" style={{ maxWidth: '600px', width: '100%' }}>
            <div>
              <strong>No version history found</strong>
              <p className="mb-0 text-muted">This template has no previous versions.</p>
            </div>
          </Alert>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="mb-3">
          <h6 className="mb-0">Version History</h6>
        </div>
        <div className="list-group" style={{ flex: 1, overflowY: 'auto' }}>
          {historyVersions.map((version, index) => (
            <div key={version.id || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Version {version.version}</h6>
                  <small className="text-muted">
                    {formatDateTime(version.createdAt || version.updatedAt)}
                    {version.createdByUser && (
                      <> • {version.createdByUser.firstName} {version.createdByUser.lastName}</>
                    )}
                  </small>
                </div>
                <Badge bg={version.status === 'PUBLISHED' ? 'success' : 'warning'}>
                  {version.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContentPreview = () => {
    if (loadingPDF) {
      return (
        <div className="content-preview" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 0
        }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Loading PDF preview...</p>
          </div>
        </div>
      );
    }

    if (pdfUrl) {
      return (
        <div className="content-preview" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          minHeight: 0
        }}>
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #dee2e6',
              borderRadius: '0.375rem',
              display: 'block',
              flex: 1,
              minHeight: 0
            }}
            title="Template PDF Preview"
          />
        </div>
      );
    }

    return (
      <div className="content-preview" style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 0
      }}>
        <Alert variant="warning" className="mb-0" style={{ maxWidth: '600px', width: '100%' }}>
          <FileEarmarkPdf className="me-2" />
          PDF preview is not available. Please try again or contact support.
        </Alert>
      </div>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered 
      className="template-detail-modal"
      dialogClassName="template-detail-modal-dialog"
      contentClassName="template-detail-modal-content"
    >
      <Modal.Header 
        className="bg-primary-custom text-white border-0 template-detail-header d-flex align-items-center justify-content-between"
        style={{ 
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem',
          padding: '1.25rem 1.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0 template-detail-title flex-grow-1" style={{ minWidth: 0 }}>
          <FileText className="me-2 flex-shrink-0" size={20} />
          <span className="template-detail-title-text text-truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`Template Detail: ${template?.name || 'Template'}`}>
            <span className="d-none d-md-inline">Template Detail: </span>
            {template?.name || 'Template'}
          </span>
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide} 
          className="text-white p-0 flex-shrink-0"
          style={{ 
            border: 'none', 
            background: 'none', 
            opacity: 0.9,
            color: '#ffffff !important',
            marginLeft: '1rem'
          }}
        >
          <X size={24} color="#ffffff" />
        </Button>
      </Modal.Header>
      
      <Modal.Body 
        className="p-0 template-detail-body" 
        style={{ 
          height: '70vh',
          maxHeight: '70vh',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        {/* Tabs */}
        <div className="bg-primary-custom text-white template-detail-tabs-container" style={{ flexShrink: 0 }}>
          <div className="d-flex border-bottom border-white border-opacity-25 template-detail-tabs" style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'details' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('details')}
              style={{
                fontWeight: activeTab === 'details' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <FileText size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">Details</span>
            </button>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'overview' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('overview')}
              style={{
                fontWeight: activeTab === 'overview' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <ListCheck size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">Template Config Overview</span>
              <span className="d-inline d-sm-none">Overview</span>
            </button>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'history' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('history')}
              style={{
                fontWeight: activeTab === 'history' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <ClockHistory size={16} className="me-1 me-md-2" />
              <span className="d-none d-lg-inline">List History Version</span>
              <span className="d-inline d-lg-none d-sm-inline">History</span>
            </button>
            <button
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                activeTab === 'content' ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => setActiveTab('content')}
              style={{
                fontWeight: activeTab === 'content' ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <Eye size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">Content Preview</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div 
          className="p-3 p-md-4 template-detail-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'auto',
            height: '100%'
          }}
        >
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            height: '100%'
          }}>
            {activeTab === 'details' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderDetails()}
              </div>
            )}
            {activeTab === 'overview' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderOverview()}
              </div>
            )}
            {activeTab === 'history' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderHistory()}
              </div>
            )}
            {activeTab === 'content' && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                height: '100%'
              }}>
                {renderContentPreview()}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer 
        className="bg-light border-0 template-detail-footer d-flex flex-wrap gap-2"
        style={{ 
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--bs-neutral-200)',
          justifyContent: 'flex-end'
        }}
      >
        <Button 
          variant="secondary"
          onClick={onHide}
          className="d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'var(--bs-secondary)',
            borderColor: 'var(--bs-secondary)',
            color: '#ffffff',
            fontWeight: 500,
            padding: '0.5rem 1.5rem',
            borderRadius: '0.375rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3a5a6f'
            e.currentTarget.style.borderColor = '#3a5a6f'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bs-secondary)'
            e.currentTarget.style.borderColor = 'var(--bs-secondary)'
            e.currentTarget.style.color = '#ffffff'
          }}
        >
          Close
        </Button>
        {isRejected && (
          <Button
            variant="warning"
            onClick={handleUpdateRejectedTemplate}
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: '#ffc107',
              borderColor: '#ffc107',
              color: '#000',
              fontWeight: 500,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffb300'
              e.currentTarget.style.borderColor = '#ffb300'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffc107'
              e.currentTarget.style.borderColor = '#ffc107'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <PencilSquare className="me-2" size={16} />
            <span className="d-none d-sm-inline">Update Rejected Template</span>
            <span className="d-inline d-sm-none">Update</span>
          </Button>
        )}
        {template?.status !== 'PENDING' && (
          <Button
            variant="danger"
            onClick={handleDisableTemplate}
            disabled={disabling}
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              color: 'white',
              fontWeight: 500,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease',
              opacity: disabling ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!disabling) {
                e.currentTarget.style.backgroundColor = '#c82333'
                e.currentTarget.style.borderColor = '#c82333'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!disabling) {
                e.currentTarget.style.backgroundColor = '#dc3545'
                e.currentTarget.style.borderColor = '#dc3545'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {disabling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                <span className="d-none d-sm-inline">Disabling...</span>
                <span className="d-inline d-sm-none">Disabling...</span>
              </>
            ) : (
              <>
                <Ban className="me-2" size={16} />
                <span className="d-none d-sm-inline">Disable Template</span>
                <span className="d-inline d-sm-none">Disable</span>
              </>
            )}
          </Button>
        )}
        {onCreateVersion && (
          <Button
            variant="primary"
            onClick={handleCreateNewVersion}
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'var(--bs-primary)',
              borderColor: 'var(--bs-primary)',
              color: 'white',
              fontWeight: 500,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#153a4a'
              e.currentTarget.style.borderColor = '#153a4a'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(27, 60, 83, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bs-primary)'
              e.currentTarget.style.borderColor = 'var(--bs-primary)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <FileEarmarkPlus className="me-2" size={16} />
            <span className="d-none d-sm-inline">Create New Version</span>
            <span className="d-inline d-sm-none">New Version</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateDetailModal;

