import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { CheckSquare, Square } from 'react-bootstrap-icons';
import { subjectAPI } from '../../api';

const SubjectSelectionPanel = ({ selectedSubjects, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subjects from API
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 SubjectSelectionPanel - Loading all subjects from API...');
        
        const response = await subjectAPI.getSubjects();
        console.log('🔍 SubjectSelectionPanel - API Response:', response);
        
        if (response && response.subjects) {
          // Only extract name field from each subject
          const subjectsWithNameOnly = response.subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            code: subject.code // Keep code for display
          }));
          
          setSubjects(subjectsWithNameOnly);
          console.log('✅ SubjectSelectionPanel - Loaded subjects:', subjectsWithNameOnly.length);
          console.log('🔍 SubjectSelectionPanel - Subject names:', subjectsWithNameOnly.map(s => s.name));
        } else {
          setSubjects([]);
          console.log('⚠️ SubjectSelectionPanel - No subjects found');
        }
      } catch (error) {
        console.error('❌ SubjectSelectionPanel - Error loading subjects:', error);
        setError('Failed to load subjects');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []); // Remove courseId dependency since we're getting all subjects

  const filteredSubjects = subjects.filter(subject =>
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

  return (
    <Card className="d-flex flex-column h-100" style={{ border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <Card.Header className="bg-gradient-primary-custom text-white border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 text-white">Select Subjects</h6>
          <Button 
            variant="outline-light" 
            size="sm"
            onClick={handleSelectAll}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0 d-flex flex-column" style={{ height: '500px' }}>
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
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div className="p-3 text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading subjects...</span>
            </div>
          ) : error ? (
            <div className="p-3 text-center text-danger">
              <p className="mb-0">{error}</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <p className="mb-0">No subjects found</p>
            </div>
          ) : (
            filteredSubjects.map(subject => (
              <div 
                key={subject.id}
                className="p-2 border-bottom d-flex align-items-center hover-bg-light"
                style={{ cursor: 'pointer', minWidth: 0 }}
                onClick={() => handleSelectSubject(subject.id)}
              >
                <div className="me-3">
                  {selectedSubjects.includes(subject.id) ? (
                    <CheckSquare size={20} className="text-primary" />
                  ) : (
                    <Square size={20} className="text-muted" />
                  )}
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div className="fw-semibold text-truncate" title={subject.name}>{subject.name}</div>
                  <small className="text-muted text-truncate d-block" title={subject.code}>{subject.code}</small>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="p-2 bg-light border-top flex-shrink-0">
          <small className="text-muted">
            {selectedSubjects.length} of {filteredSubjects.length} subjects selected
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SubjectSelectionPanel;
