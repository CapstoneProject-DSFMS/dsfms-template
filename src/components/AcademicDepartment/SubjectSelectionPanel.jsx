import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { CheckSquare, Square } from 'react-bootstrap-icons';

const mockSubjects = [
  { id: 's1', name: 'Safety Basics', code: 'SB01' },
  { id: 's2', name: 'Evacuation Drills', code: 'ED02' },
  { id: 's3', name: 'CPR & First Aid', code: 'FA03' },
  { id: 's4', name: 'Fire Safety', code: 'FS04' },
  { id: 's5', name: 'Emergency Procedures', code: 'EP05' }
];

const SubjectSelectionPanel = ({ courseId, selectedSubjects, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = mockSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedSubjects.length === filteredSubjects.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredSubjects.map(s => s.id));
    }
  };

  const handleSelectSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      onSelectionChange(selectedSubjects.filter(id => id !== subjectId));
    } else {
      onSelectionChange([...selectedSubjects, subjectId]);
    }
  };

  const isAllSelected = filteredSubjects.length > 0 && selectedSubjects.length === filteredSubjects.length;
  const isIndeterminate = selectedSubjects.length > 0 && selectedSubjects.length < filteredSubjects.length;

  return (
    <Card className="d-flex flex-column">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Select Subjects</h6>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleSelectAll}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {/* Search */}
        <div className="p-2 border-bottom">
          <Form.Control
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
          />
        </div>

        {/* Subject List */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredSubjects.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <p className="mb-0">No subjects found</p>
            </div>
          ) : (
            filteredSubjects.map(subject => (
              <div 
                key={subject.id}
                className="p-2 border-bottom d-flex align-items-center hover-bg-light"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectSubject(subject.id)}
              >
                <div className="me-3">
                  {selectedSubjects.includes(subject.id) ? (
                    <CheckSquare size={20} className="text-primary" />
                  ) : (
                    <Square size={20} className="text-muted" />
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{subject.name}</div>
                  <small className="text-muted">{subject.code}</small>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="p-2 bg-light border-top">
          <small className="text-muted">
            {selectedSubjects.length} of {filteredSubjects.length} subjects selected
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SubjectSelectionPanel;
