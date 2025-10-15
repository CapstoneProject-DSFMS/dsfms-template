import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Card } from 'react-bootstrap';
import { CheckCircle, Eye, ThreeDotsVertical } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { LoadingSkeleton } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import SortableHeader from './SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

// Add custom CSS to remove table borders
const sectionTableStyles = `
  .section-completion-table-no-borders .table,
  .section-completion-table-no-borders .table td,
  .section-completion-table-no-borders .table th,
  .section-completion-table-no-borders .table tbody tr,
  .section-completion-table-no-borders .table thead tr {
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }
  .section-completion-table-no-borders .table tbody tr {
    border-bottom: 1px solid #f0f0f0 !important;
  }
  .section-completion-table-no-borders .table tbody tr:last-child {
    border-bottom: none !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = sectionTableStyles;
  document.head.appendChild(styleSheet);
}

const TraineeSectionCompletionList = ({ traineeId }) => {
  const [sectionCompletion, setSectionCompletion] = useState([]);
  const [loading, setLoading] = useState(true);

  const { sortedData: sortedSectionCompletion, sortConfig: sectionSortConfig, handleSort: handleSectionSort } = useTableSort(sectionCompletion);

  useEffect(() => {
    loadSectionCompletion();
  }, [traineeId]);

  const loadSectionCompletion = async () => {
    try {
      setLoading(true);
      
      // Mock data for section completion
      const mockSectionCompletion = [
        {
          id: '1',
          name: 'Introduction to Safety Protocols',
          course: 'Safety Procedures Training',
          subject: 'Basic Safety Protocols',
          section: 'Theory',
          dueDate: '2024-01-25T23:59:59.000Z',
          progress: 75,
          status: 'IN_PROGRESS'
        },
        {
          id: '2',
          name: 'Practical Equipment Handling',
          course: 'Equipment Handling Course',
          subject: 'Heavy Machinery Operation',
          section: 'Practical',
          dueDate: '2024-01-30T23:59:59.000Z',
          progress: 100,
          status: 'COMPLETED'
        },
        {
          id: '3',
          name: 'Data Protection Guidelines',
          course: 'Company Policies Training',
          subject: 'Data Protection Guidelines',
          section: 'Assessment',
          dueDate: '2024-02-05T23:59:59.000Z',
          progress: 0,
          status: 'PENDING'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setSectionCompletion(mockSectionCompletion);
    } catch (error) {
      console.error('Error loading section completion:', error);
      toast.error('Failed to load section completion requirements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', text: 'Pending' },
      'IN_PROGRESS': { variant: 'primary', text: 'In Progress' },
      'COMPLETED': { variant: 'success', text: 'Completed' },
      'OVERDUE': { variant: 'danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    
    return (
      <Badge bg={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const handleCompleteSection = (sectionId) => {
    console.log('Complete section:', sectionId);
    // TODO: Implement section completion functionality
    toast.info('Section completion functionality coming soon');
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <LoadingSkeleton count={5} />
      </div>
    );
  }

  if (sectionCompletion.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No sections requiring completion</p>
      </div>
    );
  }

  return (
    <div className="scrollable-table-container admin-table section-completion-table-no-borders">
      <Table hover className="mb-0 table-hover" borderless>
        <thead className="table-light">
          <tr>
            <th className="text-start">
              <SortableHeader 
                title="Section" 
                sortKey="name" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Course" 
                sortKey="course" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Subject" 
                sortKey="subject" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Type" 
                sortKey="section" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Due Date" 
                sortKey="dueDate" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Progress" 
                sortKey="progress" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Status" 
                sortKey="status" 
                sortConfig={sectionSortConfig} 
                onSort={handleSectionSort} 
              />
            </th>
            <th className="text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedSectionCompletion.map((section) => (
            <tr key={section.id}>
              <td>
                <div className="fw-semibold">{section.name}</div>
              </td>
              <td>
                <div className="fw-semibold">{section.course}</div>
              </td>
              <td>
                <div className="fw-semibold">{section.subject}</div>
              </td>
              <td>
                <Badge bg="primary" className="fw-normal">
                  {section.section}
                </Badge>
              </td>
              <td>
                {new Date(section.dueDate).toLocaleDateString()}
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{section.progress}%</small>
                </div>
              </td>
              <td>{getStatusBadge(section.status)}</td>
              <td>
                <PortalUnifiedDropdown
                  align="end"
                  className="table-dropdown"
                  placement="bottom-end"
                  trigger={{
                    variant: 'link',
                    className: 'btn btn-link p-0 text-primary-custom',
                    style: { border: 'none', background: 'transparent' },
                    children: <ThreeDotsVertical size={16} />
                  }}
                  items={[
                    {
                      label: section.status === 'COMPLETED' ? 'View Section' : 'Complete Section',
                      icon: section.status === 'COMPLETED' ? <Eye /> : <CheckCircle />,
                      onClick: () => handleCompleteSection(section.id)
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeSectionCompletionList;
