import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = ({
  content = '',
  onChange,
  onInsertField,
  readOnly = false,
  placeholder = 'Start typing your form content here...',
  height = '400px',
  modules = null,
  formats = null,
  className = ""
}) => {
  const quillRef = useRef(null);

  // Default modules configuration - minimal toolbar without icons
  const defaultModules = {
    toolbar: false, // Disable toolbar completely
  };

  const defaultFormats = [
    'bold', 'italic', 'underline'
  ];

  // Insert field function
  const insertField = (fieldName) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      // Insert merge field with styling
      quill.insertText(index, `{{${fieldName}}}`, 'user');
      quill.formatText(index, `{{${fieldName}}}`.length, {
        'color': '#007bff',
        'background': '#e3f2fd',
        'bold': true
      });
      
      // Focus back to editor
      quill.focus();
    }
  };

  // Expose insertField method to parent
  useEffect(() => {
    if (onInsertField && quillRef.current) {
      quillRef.current.insertField = insertField;
    }
  }, [onInsertField]);

  if (readOnly) {
    return (
      <div 
        className={`border rounded p-3 bg-light ${className}`}
        style={{ minHeight: height }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={className}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules || defaultModules}
        formats={formats || defaultFormats}
        style={{ height: height }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default QuillEditor;
