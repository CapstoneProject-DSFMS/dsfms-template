import React from 'react';
import { Table, Form } from 'react-bootstrap';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const TrainerTable = ({ 
  trainers, 
  loading, 
  selectedTrainers, 
  onTrainerSelect,
  onSelectAll,
  searchTerm 
}) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(trainers);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={5} />;
  }

  if (trainers.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No trainers found</h5>
          <p>Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold ${className}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
        onClick={() => handleSort(columnKey)}
      >
        <div className="d-flex align-items-center">
          <span className="me-1" style={{ color: 'white' }}>{children}</span>
          <SortIcon 
            direction={direction}
            color="white"
            style={{ fontSize: '0.75rem' }}
          />
        </div>
      </th>
    );
  };

  const isAllSelected = trainers.length > 0 && selectedTrainers.length === trainers.length;
  const isIndeterminate = selectedTrainers.length > 0 && selectedTrainers.length < trainers.length;

  return (
    <div className="scrollable-table-container">
      <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <th 
              className="fw-semibold text-center"
              style={{ 
                width: '50px',
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)'
              }}
            >
              <Form.Check
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="d-flex justify-content-center"
              />
            </th>
            <SortableHeader columnKey="eid" className="show-mobile">
              EID
            </SortableHeader>
            <SortableHeader columnKey="fullName" className="show-mobile">
              Full Name
            </SortableHeader>
            <SortableHeader columnKey="email" className="show-mobile">
              Email
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((trainer, index) => (
            <TrainerRow
              key={trainer.id}
              trainer={trainer}
              index={index}
              isSelected={selectedTrainers.includes(trainer.id)}
              onSelect={() => onTrainerSelect(trainer.id)}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const TrainerRow = ({ trainer, index, isSelected, onSelect }) => {

  return (
    <tr 
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
      style={{
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
      }}
    >
      <td className="border-neutral-200 align-middle text-center">
        <Form.Check
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="d-flex justify-content-center"
        />
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <span className="fw-semibold text-primary-custom">
          {trainer.eid}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <div className="fw-medium text-dark">
          {trainer.fullName}
        </div>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <span className="text-dark">
          {trainer.email}
        </span>
      </td>
    </tr>
  );
};

export default TrainerTable;
