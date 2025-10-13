import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Upload, Search, Plus } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubjectSelectionPanel from '../../components/AcademicDepartment/SubjectSelectionPanel';
import TraineeSelectionPanel from '../../components/AcademicDepartment/TraineeSelectionPanel';
import EnrolledTraineesTable from '../../components/AcademicDepartment/EnrolledTraineesTable';
import BulkImportTraineesModal from '../../components/AcademicDepartment/BulkImportTraineesModal';
import subjectAPI from '../../api/subject';

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
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

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

  const handleEnroll = async () => {
    if (selectedSubjects.length === 0 || selectedTrainees.length === 0) {
      toast.warning('Please select both subjects and trainees to enroll');
      return;
    }

    setEnrollLoading(true);
    
    try {
      console.log('🔍 Starting enrollment process...');
      console.log('Selected subjects (IDs):', selectedSubjects);
      console.log('Selected subjects type:', typeof selectedSubjects, Array.isArray(selectedSubjects));
      console.log('Selected trainees:', selectedTrainees);

      // Prepare data for API call - Backend expects batchCode and traineeUserIds
      const traineeData = {
        batchCode: "TEST0012025", // Fixed batch code
        traineeUserIds: selectedTrainees.map(trainee => {
          console.log('🔍 Processing trainee:', trainee);
          return trainee.id; // Just the user IDs as array
        })
      };

      console.log('🔍 Prepared trainee data:', traineeData);

      // Call API for each selected subject
      const enrollmentPromises = selectedSubjects.map(async (subjectId) => {
        console.log(`🔍 Enrolling trainees to subject ID: ${subjectId}`);
        console.log(`🔍 Subject ID validation:`, {
          subjectId: subjectId,
          subjectIdType: typeof subjectId
        });
        
        if (!subjectId) {
          throw new Error(`Invalid subject ID: ${subjectId}`);
        }
        
        const response = await subjectAPI.assignTrainees(subjectId, traineeData);
        console.log(`✅ Enrollment response for subject ${subjectId}:`, response);
        return { subjectId, response };
      });

      // Wait for all enrollments to complete
      const enrollmentResults = await Promise.all(enrollmentPromises);
      
      console.log('✅ All enrollments completed:', enrollmentResults);

      // Refresh the enrolled trainees table
      setTableRefreshKey(prev => prev + 1);
      
      // Clear selected trainees and subjects
      setSelectedTrainees([]);
      setSelectedSubjects([]);
      
      toast.success(`Successfully enrolled ${selectedTrainees.length} trainees to ${selectedSubjects.length} subject(s)`);
      console.log('🎉 Enrollment completed successfully!');
      
    } catch (error) {
      console.error('❌ Error during enrollment:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error config:', error.config);
      
      // Show more specific error message
      let errorMessage = 'Failed to enroll trainees. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Validation errors: ${JSON.stringify(error.response.data.errors)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setEnrollLoading(false);
    }
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
                    disabled={selectedSubjects.length === 0 || selectedTrainees.length === 0 || enrollLoading}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {enrollLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" style={{ width: '0.75rem', height: '0.75rem' }}></span>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Plus size={12} className="me-1" /> Enroll
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-primary" 
                    onClick={handleBulkImport}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Upload size={12} className="me-1" /> Bulk Import Trainees
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
            key={tableRefreshKey}
            courseId={courseId}
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
