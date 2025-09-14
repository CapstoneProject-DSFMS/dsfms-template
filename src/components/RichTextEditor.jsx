import React, { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Variable from '../extensions/Variable'

const RichTextEditor = ({ 
  content = '', 
  onChange = () => {}, 
  placeholder = 'Start typing...',
  className = ''
}) => {
  const [showVariableModal, setShowVariableModal] = useState(false)
  const [variableName, setVariableName] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Variable,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 200px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;',
      },
    },
  })

  const insertVariable = useCallback(() => {
    if (variableName.trim()) {
      editor?.commands.setVariable({ name: variableName.trim() })
      setVariableName('')
      setShowVariableModal(false)
    }
  }, [editor, variableName])

  const handleVariableKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      insertVariable()
    }
  }

  const exportToDocxtemplater = useCallback(() => {
    if (!editor) return ''
    
    const html = editor.getHTML()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    // Replace variable chips with Docxtemplater syntax
    const variableElements = tempDiv.querySelectorAll('[data-type="variable"]')
    variableElements.forEach(element => {
      const name = element.getAttribute('data-name')
      if (name) {
        element.outerHTML = `{${name}}`
      }
    })
    
    // Convert HTML to plain text with preserved variables
    return tempDiv.textContent || tempDiv.innerText || ''
  }, [editor])

  const handleExport = () => {
    const exportedText = exportToDocxtemplater()
    console.log('Exported text:', exportedText)
    // You can modify this to handle the export as needed
    alert(`Exported text:\n\n${exportedText}`)
  }

  if (!editor) {
    return null
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="toolbar" style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderBottom: 'none',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        backgroundColor: '#f9fafb',
        flexWrap: 'wrap',
      }}>
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bold') ? 'var(--bs-primary)' : 'white',
            color: editor.isActive('bold') ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Bold
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('italic') ? 'var(--bs-primary)' : 'white',
            color: editor.isActive('italic') ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Italic
        </button>

        {/* Insert Variable */}
        <button
          onClick={() => setShowVariableModal(true)}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#10b981',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Insert Variable
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Export
        </button>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        style={{
          minHeight: '200px',
        }}
      />

      {/* Variable Modal */}
      {showVariableModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '300px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              Insert Variable
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
              Enter the variable name (e.g., first_name, last_name, email):
            </p>
            <input
              type="text"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              onKeyPress={handleVariableKeyPress}
              placeholder="Enter variable name"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowVariableModal(false)
                  setVariableName('')
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={insertVariable}
                disabled={!variableName.trim()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: variableName.trim() ? '#10b981' : '#d1d5db',
                  color: 'white',
                  cursor: variableName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
