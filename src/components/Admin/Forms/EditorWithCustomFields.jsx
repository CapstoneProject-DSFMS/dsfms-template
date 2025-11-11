import React from 'react';
import CustomFieldsPanel from './CustomFieldsPanel';

const EditorWithCustomFields = ({
  customFields,
  onAddField,
  onRemoveField,
  onInsertField,
  exportEditedDoc,
  exportAndUploadEditedDoc,
  forceSaveAndPoll,
  getDocumentKey,
  addSystemFieldToSectionRef,
  readOnly = false,
  className = ''
}) => {
  return (
    <CustomFieldsPanel
      customFields={customFields}
      onAddField={onAddField}
      onRemoveField={onRemoveField}
      onInsertField={onInsertField}
      exportEditedDoc={exportEditedDoc}
      exportAndUploadEditedDoc={exportAndUploadEditedDoc}
      forceSaveAndPoll={forceSaveAndPoll}
      getDocumentKey={getDocumentKey}
      addSystemFieldToSectionRef={addSystemFieldToSectionRef}
      readOnly={readOnly}
      className={className}
    />
  );
};

export default EditorWithCustomFields;


