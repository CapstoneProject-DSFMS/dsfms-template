import React from 'react'
import TiptapExample from '../components/TiptapExample'

const TiptapDemo = () => {
  return (
    <div>
      <nav style={{ 
        padding: '16px', 
        backgroundColor: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#1f2937' 
        }}>
          Tiptap Rich Text Editor Demo
        </h1>
        <a 
          href="/" 
          className="btn btn-primary"
          style={{
            padding: '8px 16px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ← Back to Login
        </a>
      </nav>
      <TiptapExample />
    </div>
  )
}

export default TiptapDemo
