import React from 'react';
import { ChevronUp, ChevronDown } from 'react-bootstrap-icons';
import SortIcon from '../Common/SortIcon';

const SortableHeader = ({ title, sortKey, sortConfig, onSort }) => {
  const handleSort = () => {
    onSort(sortKey);
  };

  const getSortIcon = () => {
    if (sortConfig.key === sortKey) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp size={12} className="ms-1" />
      ) : (
        <ChevronDown size={12} className="ms-1" />
      );
    }
    return <SortIcon size={12} className="ms-1" />;
  };

  return (
    <div 
      className="d-flex align-items-center cursor-pointer user-select-none" 
      onClick={handleSort}
      style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      <span className="me-1">{title}</span>
      {getSortIcon()}
    </div>
  );
};

export default SortableHeader;
