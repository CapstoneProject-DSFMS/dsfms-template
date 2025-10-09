import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { People, Envelope, Phone, ChevronDown, ChevronRight } from 'react-bootstrap-icons';

// Mock trainees data - distinct trainees from all subjects in the course
const mockTrainees = [
  { id: 1, name: 'John Smith', eid: 'EMP001', email: 'john.smith@company.com', phone: '+1-555-0101', subjects: ['Safety Basics', 'Evacuation Drills'] },
  { id: 2, name: 'Sarah Johnson', eid: 'EMP002', email: 'sarah.johnson@company.com', phone: '+1-555-0102', subjects: ['Safety Basics', 'Fire Safety'] },
  { id: 3, name: 'Mike Wilson', eid: 'EMP003', email: 'mike.wilson@company.com', phone: '+1-555-0103', subjects: ['Evacuation Drills', 'Emergency Procedures'] },
  { id: 4, name: 'Emily Davis', eid: 'EMP004', email: 'emily.davis@company.com', phone: '+1-555-0104', subjects: ['Safety Basics', 'CPR & First Aid'] },
  { id: 5, name: 'David Brown', eid: 'EMP005', email: 'david.brown@company.com', phone: '+1-555-0105', subjects: ['Fire Safety', 'Emergency Procedures'] },
  { id: 6, name: 'Lisa Anderson', eid: 'EMP006', email: 'lisa.anderson@company.com', phone: '+1-555-0106', subjects: ['Safety Basics', 'Evacuation Drills', 'Fire Safety'] },
  { id: 7, name: 'Robert Taylor', eid: 'EMP007', email: 'robert.taylor@company.com', phone: '+1-555-0107', subjects: ['CPR & First Aid', 'Emergency Procedures'] },
  { id: 8, name: 'Jennifer Martinez', eid: 'EMP008', email: 'jennifer.martinez@company.com', phone: '+1-555-0108', subjects: ['Safety Basics', 'Fire Safety', 'Emergency Procedures'] }
];

const TraineeCountTable = ({ course, isCollapsed, onToggleCollapse }) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Header 
        className="border-bottom py-4 pb-3 collapsible-header"
        onClick={onToggleCollapse}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <People className="me-2" />
            Trainees Roster ({mockTrainees.length})
          </h5>
          <ChevronDown 
            size={20} 
            className={`text-muted chevron-icon ${isCollapsed ? 'rotated' : ''}`}
          />
        </div>
      </Card.Header>
      <Card.Body className={`p-0 collapsible-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="table-container">
          <Table hover className="mb-0">
          <thead className="sticky-top bg-light">
            <tr>
              <th className="border-0" style={{ paddingLeft: '1.5rem' }}>Trainee</th>
              <th className="border-0">EID</th>
              <th className="border-0">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {mockTrainees.map(trainee => (
              <tr key={trainee.id}>
                <td className="border-0" style={{ paddingLeft: '1.5rem' }}>
                  <div>
                    <div className="fw-semibold">{trainee.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      <Envelope size={12} className="me-1" />
                      {trainee.email}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      <Phone size={12} className="me-1" />
                      {trainee.phone}
                    </div>
                  </div>
                </td>
                <td className="border-0">
                  <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: '0.85rem' }}>
                    {trainee.eid}
                  </Badge>
                </td>
                <td className="border-0">
                  <div className="d-flex flex-wrap gap-1">
                    {trainee.subjects.map((subject, index) => (
                      <Badge 
                        key={index}
                        bg="info" 
                        className="px-2 py-1" 
                        style={{ fontSize: '0.8rem' }}
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TraineeCountTable;


