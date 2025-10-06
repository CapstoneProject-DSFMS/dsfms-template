import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Upload, Search, Plus } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSelectionPanel from './SubjectSelectionPanel';
import TraineeSelectionPanel from './TraineeSelectionPanel';
import EnrolledTraineesTable from './EnrolledTraineesTable';
import BulkImportTraineesModal from './BulkImportTraineesModal';

const EnrollTraineesPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  // Mock course data
  const course = {
    id: courseId,
    name: 'Safety Procedures',
    code: 'SAF001',
    description: 'Basic safety procedures training course'
  };

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [enrolledTrainees, setEnrolledTrainees] = useState([
    { id: 't1', eid: 'EMP001', name: 'John Doe', subjects: ['s1', 's2'] },
    { id: 't2', eid: 'EMP002', name: 'Jane Smith', subjects: ['s1', 's3'] },
    { id: 't3', eid: 'EMP003', name: 'Bob Johnson', subjects: ['s2', 's3'] }
  ]);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);

  const handleBack = () => {
    navigate(`/academic/course-detail/${courseId}`);
  };

  const handleBulkImport = () => {
    setShowBulkImport(true);
  };

  const handleBulkImportTrainees = async (trainees) => {
    setBulkImportLoading(true);
    try {
      // TODO: Implement actual API call to import trainees
      console.log('Importing trainees:', trainees);
      
      // For now, just add to selected trainees
      const newTrainees = trainees.map((trainee, index) => ({
        id: `imported_${Date.now()}_${index}`,
        eid: trainee.eid,
        name: trainee.full_name,
        subjects: []
      }));
      
      setSelectedTrainees(prev => [...prev, ...newTrainees]);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Failed to import trainees:', error);
      throw error;
    } finally {
      setBulkImportLoading(false);
    }
  };

  const handleEnroll = () => {
    console.log('Enrolling trainees:', selectedTrainees, 'to subjects:', selectedSubjects);
    
    // TODO: Implement actual API call to enroll trainees
    // For now, simulate enrollment by updating state
    
    // Add selected trainees to enrolled list with selected subjects
    const newEnrolledTrainees = selectedTrainees.map(trainee => ({
      ...trainee,
      subjects: selectedSubjects // Assign selected subjects to each trainee
    }));
    
    // Update enrolled trainees state
    setEnrolledTrainees(prev => [...prev, ...newEnrolledTrainees]);
    
    // Clear selected trainees and subjects
    setSelectedTrainees([]);
    setSelectedSubjects([]);
    
    console.log('Enrollment completed! Added', newEnrolledTrainees.length, 'trainees');
  };

  return (
    <Container fluid className="py-1 enroll-page" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="d-flex flex-column h-100">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 mb-2">
          <div className="d-flex align-items-center mb-2">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleBack}
              className="me-3"
            >
              <ArrowLeft size={16} className="me-1" />
              Back
            </Button>
            <div>
              <h5 className="mb-0 text-primary">
                Enroll Trainees - <strong>{course.name}</strong> ({course.code})
              </h5>
              <small className="text-muted">Manage trainee enrollment for this course</small>
            </div>
          </div>

          {/* Course Info */}
          <Card className="mb-2">
            <Card.Body className="py-2">
              <Row>
                <Col md={8}>
                  <p className="mb-0 text-muted">{course.description}</p>
                </Col>
                <Col md={4} className="text-end d-flex justify-content-end align-items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={handleEnroll}
                    disabled={selectedSubjects.length === 0 || selectedTrainees.length === 0}
                  >
                    <Plus size={14} className="me-1" /> Enroll
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={handleBulkImport}>
                    <Upload size={14} className="me-1" /> Bulk Import Trainees
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Main Content - Compact Height */}
        <div className="flex-grow-1" style={{ minHeight: 0 }}>
          <Row className="g-2">
            {/* Panel 1: Subject Selection */}
            <Col lg={4}>
              <SubjectSelectionPanel 
                courseId={courseId}
                selectedSubjects={selectedSubjects}
                onSelectionChange={setSelectedSubjects}
              />
            </Col>

            {/* Panel 2: Trainee Selection */}
            <Col lg={4}>
              <TraineeSelectionPanel 
                selectedTrainees={selectedTrainees}
                onSelectionChange={setSelectedTrainees}
              />
            </Col>

            {/* Panel 3: Enrolled Trainees */}
            <Col lg={4}>
              <EnrolledTraineesTable 
                courseId={courseId}
                enrolledTrainees={enrolledTrainees}
                onUpdate={setEnrolledTrainees}
                loading={false}
              />
            </Col>
          </Row>
        </div>

        {/* Enroll Button - Fixed */}
        <div className="flex-shrink-0 text-center mt-1 pb-1">
          <Button 
            variant="success" 
            size="sm"
            onClick={handleEnroll}
            disabled={selectedSubjects.length === 0 || selectedTrainees.length === 0}
          >
            <Plus size={16} className="me-2" />
            Enroll {selectedTrainees.length} Trainee(s) to {selectedSubjects.length} Subject(s)
          </Button>
        </div>
      </div>

      {/* Bulk Import Modal */}
      <BulkImportTraineesModal
        show={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImportTrainees}
        loading={bulkImportLoading}
      />
    </Container>
  );
};

export default EnrollTraineesPage;
