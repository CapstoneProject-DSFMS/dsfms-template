import { useState, useMemo } from 'react';

const useTableSort = (data, defaultSortKey = null, defaultSortDirection = 'asc') => {
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey,
    direction: defaultSortDirection
  });

  const sortedData = useMemo(() => {
    if (!data) return [];
    if (!sortConfig.key) return [...data];

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested properties (e.g., user.fullName, role.permissions.length)
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      // Handle array lengths (e.g., permissions.length)
      if (sortConfig.key.includes('length')) {
        const arrayKey = sortConfig.key.replace('.length', '');
        aValue = a[arrayKey]?.length || 0;
        bValue = b[arrayKey]?.length || 0;
      }

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Numbers
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Strings and other types
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      // Reset to no sorting
      setSortConfig({ key: null, direction: 'asc' });
      return;
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️'; // Default sort icon
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getSortClass = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return 'text-muted';
    }
    return sortConfig.direction === 'asc' ? 'text-primary' : 'text-primary';
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
    getSortIcon,
    getSortClass
  };
};

export default useTableSort;
