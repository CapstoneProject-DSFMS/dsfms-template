import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const useFormEditor = ({
  initialContent = '',
  initialFileName = 'Untitled Document',
  onSave: externalOnSave,
  onPreview: externalOnPreview,
  onExport: externalOnExport,
  autoSave = false,
  autoSaveInterval = 30000 // 30 seconds
}) => {
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState(initialFileName);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Update fileName when initialFileName changes
  useEffect(() => {
    setFileName(initialFileName);
  }, [initialFileName]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const interval = setInterval(() => {
      handleSave();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, hasUnsavedChanges]);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleFileNameChange = useCallback((newFileName) => {
    setFileName(newFileName);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!externalOnSave) return;
    
    setIsSaving(true);
    try {
      await externalOnSave(content, fileName);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success('Form saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save form');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [content, fileName, externalOnSave]);

  const handlePreview = useCallback(() => {
    if (externalOnPreview) {
      externalOnPreview(content, fileName);
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
  }, [content, fileName, externalOnPreview]);

  const handleExport = useCallback(() => {
    if (externalOnExport) {
      externalOnExport(content, fileName);
    } else {
      toast.info('Export functionality will be implemented soon!');
    }
  }, [content, fileName, externalOnExport]);

  const handleInsertField = useCallback((fieldName) => {
    setHasUnsavedChanges(true);
    toast.success(`Inserted {{${fieldName}}} field`);
  }, []);

  const reset = useCallback(() => {
    setContent(initialContent);
    setFileName(initialFileName);
    setHasUnsavedChanges(false);
    setIsSaving(false);
    setLastSaved(null);
  }, [initialContent, initialFileName]);

  return {
    // State
    content,
    fileName,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    
    // Actions
    handleContentChange,
    handleFileNameChange,
    handleSave,
    handlePreview,
    handleExport,
    handleInsertField,
    reset,
    
    // Setters (for external control)
    setContent,
    setFileName,
    setHasUnsavedChanges
  };
};

export default useFormEditor;
