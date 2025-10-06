import React from 'react';
import { Card, Table } from 'react-bootstrap';

// Mock aggregation: distinct trainees by subject group
const mockAggregated = [
  { id: 'g1', label: 'All Subjects', distinctTrainees: 42 },
  { id: 'g2', label: 'Active Subjects', distinctTrainees: 36 },
  { id: 'g3', label: 'Inactive Subjects', distinctTrainees: 6 },
];

const TraineeCountTable = ({ course }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0">Distinct Trainee Counts</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="border-0">Group</th>
              <th className="text-end border-0">Distinct Trainees</th>
            </tr>
          </thead>
          <tbody>
            {mockAggregated.map(r => (
              <tr key={r.id}>
                <td className="border-0">{r.label}</td>
                <td className="text-end fw-semibold border-0">
                  <span className="badge bg-primary">{r.distinctTrainees}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default TraineeCountTable;


