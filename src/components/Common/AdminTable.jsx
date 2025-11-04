import React from 'react';
import { Table } from 'react-bootstrap';
import { LoadingSkeleton, SortIcon } from './index';
import useTableSort from '../../hooks/useTableSort';

const AdminTable = ({ 
  data, 
  loading, 
  columns, 
  renderRow, 
  emptyMessage = "No data found",
  emptyDescription = "Try adjusting your search criteria."
}) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(data);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>{emptyMessage}</h5>
          <p>{emptyDescription}</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`text-primary-custom fw-semibold ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{
            transition: 'all 0.3s ease',
            fontWeight: '700', // Always bold for uppercase text
            textTransform: 'uppercase', // Ensure uppercase
            letterSpacing: '0.5px' // Better readability
          }}>
            {children}
          </span>
          <div 
            className="ms-2 d-flex align-items-center"
            style={{ 
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon 
              direction={direction} 
              size={14}
            />
          </div>
        </div>
        {isActive && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, var(--bs-primary), var(--bs-info))',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  return (
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            {columns.map((column, index) => (
              column.sortable ? (
                <SortableHeader 
                  key={index}
                  columnKey={column.key} 
                  className={column.className || ""}
                >
                  {column.title}
                </SortableHeader>
              ) : (
                <th 
                  key={index}
                  className={`text-primary-custom fw-bold ${column.className || ""}`}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  {column.title}
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => renderRow(item, index))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminTable;









