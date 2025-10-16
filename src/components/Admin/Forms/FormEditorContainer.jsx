import React from 'react';
import FormEditorLayout from './FormEditorLayout';
import useFormEditor from '../../../hooks/useFormEditor';

const FormEditorContainer = ({
  initialContent = '',
  initialFileName = 'Untitled Document',
  onSave,
  onPreview,
  onExport,
  readOnly = false,
  mergeFields = [],
  showMergeFields = true,
  showImportInfo = false,
  importType = '',
  autoSave = false,
  autoSaveInterval = 30000,
  className = "",
  // Layout customization
  mergeFieldsWidth = 3,
  editorWidth = 9,
  editorHeight = '300px',
  // Styling
  headerClassName = "",
  bodyClassName = "",
  mergeFieldsClassName = "",
  editorClassName = ""
}) => {
  const {
    content,
    fileName,
    isSaving,
    hasUnsavedChanges,
    handleContentChange,
    handleSave,
    handlePreview,
    handleExport,
    handleInsertField
  } = useFormEditor({
    initialContent,
    initialFileName,
    onSave,
    onPreview,
    onExport,
    autoSave,
    autoSaveInterval
  });

  return (
    <div className={`form-editor-container ${className}`}>
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
        mergeFieldsWidth={mergeFieldsWidth}
        editorWidth={editorWidth}
        editorHeight={editorHeight}
        headerClassName={headerClassName}
        bodyClassName={bodyClassName}
        mergeFieldsClassName={mergeFieldsClassName}
        editorClassName={editorClassName}
      />
    </div>
  );
};

export default FormEditorContainer;
