import React from 'react'

const VariableComponent = ({ node, updateAttributes, deleteNode }) => {
  const { name } = node.attrs

  return (
    <span
      className="variable-chip"
      style={{
        display: 'inline-block',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500',
        margin: '0 2px',
        border: '1px solid #bbdefb',
        cursor: 'default',
        userSelect: 'none',
      }}
      contentEditable={false}
      data-name={name}
    >
      [{name}]
    </span>
  )
}

export default VariableComponent
