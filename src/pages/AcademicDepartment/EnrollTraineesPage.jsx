import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Upload, Search, Plus } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSelectionPanel from '../../components/AcademicDepartment/SubjectSelectionPanel';
import TraineeSelectionPanel from '../../components/AcademicDepartment/TraineeSelectionPanel';
import EnrolledTraineesTable from '../../components/AcademicDepartment/EnrolledTraineesTable';
import BulkImportTraineesModal from '../../components/AcademicDepartment/BulkImportTraineesModal';

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
    <Container fluid className="py-4 px-4 enroll-page">
      <div className="d-flex flex-column">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 mb-3">
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

        {/* Main Content */}
        <div className="mb-4">
          <Row className="g-3">
            {/* Panel 1: Subject Selection */}
            <Col lg={6}>
              <div style={{ height: '500px' }}>
                <SubjectSelectionPanel 
                  selectedSubjects={selectedSubjects}
                  onSelectionChange={setSelectedSubjects}
                />
              </div>
            </Col>

            {/* Panel 2: Trainee Selection */}
            <Col lg={6}>
              <div style={{ height: '500px' }}>
                <TraineeSelectionPanel 
                  selectedTrainees={selectedTrainees}
                  onSelectionChange={setSelectedTrainees}
                />
              </div>
            </Col>
          </Row>
        </div>


        {/* Enrolled Trainees Table - Full Width at Bottom */}
        <div className="mt-4">
          <EnrolledTraineesTable 
            enrolledTrainees={enrolledTrainees}
            onUpdate={setEnrolledTrainees}
            loading={false}
          />
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
