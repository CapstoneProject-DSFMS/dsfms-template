import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Card } from 'react-bootstrap';
import { Pen, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingSkeleton } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import SortableHeader from './SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

// Add custom CSS to remove table borders
const signatureTableStyles = `
  .signature-required-table-no-borders .table,
  .signature-required-table-no-borders .table td,
  .signature-required-table-no-borders .table th,
  .signature-required-table-no-borders .table tbody tr,
  .signature-required-table-no-borders .table thead tr {
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }
  .signature-required-table-no-borders .table tbody tr {
    border-bottom: 1px solid #f0f0f0 !important;
  }
  .signature-required-table-no-borders .table tbody tr:last-child {
    border-bottom: none !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = signatureTableStyles;
  document.head.appendChild(styleSheet);
}

const TraineeSignatureRequiredList = ({ traineeId }) => {
  const navigate = useNavigate();
  const [signatureRequired, setSignatureRequired] = useState([]);
  const [loading, setLoading] = useState(true);

  const { sortedData: sortedSignatureRequired, sortConfig: signatureSortConfig, handleSort: handleSignatureSort } = useTableSort(signatureRequired);

  useEffect(() => {
    loadSignatureRequired();
  }, [traineeId]);

  const loadSignatureRequired = async () => {
    try {
      setLoading(true);
      
      // Mock data for signature required
      const mockSignatureRequired = [
        {
          id: '1',
          name: 'Safety Training Acknowledgment',
          course: 'Safety Procedures Training',
          subject: 'Basic Safety Protocols',
          dueDate: '2024-01-25T23:59:59.000Z',
          status: 'PENDING'
        },
        {
          id: '2',
          name: 'Equipment Usage Agreement',
          course: 'Equipment Handling Course',
          subject: 'Heavy Machinery Operation',
          dueDate: '2024-01-30T23:59:59.000Z',
          status: 'PENDING'
        },
        {
          id: '3',
          name: 'Confidentiality Agreement',
          course: 'Company Policies Training',
          subject: 'Data Protection Guidelines',
          dueDate: '2024-02-05T23:59:59.000Z',
          status: 'COMPLETED'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setSignatureRequired(mockSignatureRequired);
    } catch (error) {
      console.error('Error loading signature required:', error);
      toast.error('Failed to load signature requirements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', text: 'Pending' },
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

  const handleSignaturePad = (documentId) => {
    if (traineeId) {
      navigate(`/trainee/${traineeId}/signature-pad/${documentId}`);
    } else {
      toast.error('Unable to open signature pad: Trainee ID not found');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <LoadingSkeleton count={5} />
      </div>
    );
  }

  if (signatureRequired.length === 0) {
    return (
      <div className="text-center py-4">
        <Pen size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No signature requirements</p>
      </div>
    );
  }

  return (
    <div className="scrollable-table-container admin-table signature-required-table-no-borders">
      <Table hover className="mb-0 table-hover" borderless>
        <thead className="table-light">
          <tr>
            <th className="text-start">
              <SortableHeader 
                title="Document" 
                sortKey="name" 
                sortConfig={signatureSortConfig} 
                onSort={handleSignatureSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Course" 
                sortKey="course" 
                sortConfig={signatureSortConfig} 
                onSort={handleSignatureSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Subject" 
                sortKey="subject" 
                sortConfig={signatureSortConfig} 
                onSort={handleSignatureSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Due Date" 
                sortKey="dueDate" 
                sortConfig={signatureSortConfig} 
                onSort={handleSignatureSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Status" 
                sortKey="status" 
                sortConfig={signatureSortConfig} 
                onSort={handleSignatureSort} 
              />
            </th>
            <th className="text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedSignatureRequired.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="fw-semibold">{item.name}</div>
              </td>
              <td>
                <div className="fw-semibold">{item.course}</div>
              </td>
              <td>
                <div className="fw-semibold">{item.subject}</div>
              </td>
              <td>
                {new Date(item.dueDate).toLocaleDateString()}
              </td>
              <td>{getStatusBadge(item.status)}</td>
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
                      label: 'Sign Document',
                      icon: <Pen />,
                      onClick: () => handleSignaturePad(item.id)
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

export default TraineeSignatureRequiredList;
