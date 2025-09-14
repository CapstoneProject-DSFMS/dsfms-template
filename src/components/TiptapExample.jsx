import React, { useState } from 'react'
import RichTextEditor from './RichTextEditor'

const TiptapExample = () => {
  const [content, setContent] = useState('')
  const [exportedText, setExportedText] = useState('')

  const handleContentChange = (newContent) => {
    setContent(newContent)
  }

  const handleExport = () => {
    // This would typically be handled by the RichTextEditor component
    // For demonstration, we'll simulate the export
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    
    // Replace variable chips with Docxtemplater syntax
    const variableElements = tempDiv.querySelectorAll('[data-type="variable"]')
    variableElements.forEach(element => {
      const name = element.getAttribute('data-name')
      if (name) {
        element.outerHTML = `{${name}}`
      }
    })
    
    const exported = tempDiv.textContent || tempDiv.innerText || ''
    setExportedText(exported)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', color: '#1f2937' }}>
        Rich Text Editor with Variables
      </h1>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#374151' }}>
          Instructions:
        </h2>
        <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
          <li>Type your text in the editor below</li>
          <li>Click "Insert Variable" to add a variable placeholder</li>
          <li>You can also paste text containing variables like <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>{'{first_name}'}</code></li>
          <li>Click "Export" to get the text with Docxtemplater syntax</li>
        </ul>
      </div>

      <RichTextEditor
        content={content}
        onChange={handleContentChange}
        placeholder="Start typing your document here..."
        className="mb-4"
      />

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
          Current HTML Content:
        </h3>
        <pre style={{
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '200px',
        }}>
          {content || '<p>No content yet...</p>'}
        </pre>
      </div>

      {exportedText && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
            Exported Text (Docxtemplater Syntax):
          </h3>
          <pre style={{
            backgroundColor: '#f0f9ff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            fontSize: '14px',
            overflow: 'auto',
            maxHeight: '200px',
            color: '#1e40af',
          }}>
            {exportedText}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>💡 Tips:</h4>
        <ul style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
          <li>Variables appear as blue chips: <span style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '2px 6px', borderRadius: '8px', fontSize: '12px' }}>[name]</span></li>
          <li>When exported, they become: <code style={{ backgroundColor: '#fbbf24', padding: '1px 3px', borderRadius: '2px' }}>{'{name}'}</code></li>
          <li>You can paste text with <code>{'{variable_name}'}</code> syntax and it will automatically convert to variable chips</li>
        </ul>
      </div>
    </div>
  )
}

export default TiptapExample
