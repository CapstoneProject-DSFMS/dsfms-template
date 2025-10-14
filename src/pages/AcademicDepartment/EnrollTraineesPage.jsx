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
    // Navigate back to course detail page
    navigate(`/academic/course-detail/${courseId}`);
  };

  const handleBulkImport = () => {
    setShowBulkImport(true);
  };

  const handleBulkImportTrainees = async (trainees) => {
    // Prevent duplicate calls
    if (bulkImportLoading) {
      console.log('🔍 Bulk import already in progress, skipping...');
      return;
    }
    
    setBulkImportLoading(true);
    try {
      console.log('🔍 Bulk import trainees received:', trainees);
      
      // Use real trainees from API lookup (they already have proper UUIDs)
      const newTrainees = trainees.map((trainee) => {
        console.log('🔍 Processing bulk import trainee:', {
          id: trainee.id,
          eid: trainee.eid,
          firstName: trainee.firstName,
          lastName: trainee.lastName
        });
        
        return {
          id: trainee.id, // Use real UUID from API
          eid: trainee.eid,
          name: `${trainee.firstName} ${trainee.lastName}`.trim(), // Combined name for display
          firstName: trainee.firstName,
          lastName: trainee.lastName,
          email: trainee.email,
          phoneNumber: trainee.phoneNumber,
          status: trainee.status,
          subjects: []
        };
      });
      
      console.log('🔍 New trainees to add:', newTrainees);
      
      // Check for duplicates and only add new trainees
      setSelectedTrainees(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newUniqueTrainees = newTrainees.filter(trainee => !existingIds.has(trainee.id));
        
        console.log('🔍 Existing trainee IDs:', Array.from(existingIds));
        console.log('🔍 New unique trainees to add:', newUniqueTrainees);
        console.log('🔍 Duplicates filtered out:', newTrainees.length - newUniqueTrainees.length);
        
        // Only show toast if there are actual changes
        if (newUniqueTrainees.length === 0 && newTrainees.length > 0) {
          // Use setTimeout to prevent duplicate toasts
          setTimeout(() => {
            toast.error('All selected trainees are already in the list!', {
              autoClose: 3000,
              position: "top-right",
              toastId: 'duplicate-trainees', // Prevent duplicate toasts
              closeButton: false // Remove close button
            });
          }, 100);
        } else if (newUniqueTrainees.length < newTrainees.length && newUniqueTrainees.length > 0) {
          setTimeout(() => {
            toast.warning(`Added ${newUniqueTrainees.length} new trainees. ${newTrainees.length - newUniqueTrainees.length} were already selected.`, {
              autoClose: 4000,
              position: "top-right",
              toastId: 'partial-duplicates', // Prevent duplicate toasts
              closeButton: false // Remove close button
            });
          }, 100);
        }
        
        return [...prev, ...newUniqueTrainees];
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
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

      // Prepare data for API call - Backend expects batchCode and traineeUserIds
      console.log('🔍 Selected trainees for enrollment:', selectedTrainees);
      
      const traineeData = {
        batchCode: "TEST0012025", // Fixed batch code
        traineeUserIds: selectedTrainees.map(trainee => {
          console.log('🔍 Processing trainee:', {
            id: trainee.id,
            eid: trainee.eid,
            name: `${trainee.firstName} ${trainee.lastName}`
          });
          
          if (!trainee.id) {
            throw new Error(`Trainee ${trainee.eid} (${trainee.firstName} ${trainee.lastName}) is missing UUID`);
          }
          
          return trainee.id; // Just the user IDs as array
        })
      };
      
      console.log('🔍 Final trainee data for API:', traineeData);

      // Check for potential duplicates (this is just a warning, server will handle actual validation)
      console.log('⚠️ Note: Server will validate for duplicate enrollments');

      // Call API for each selected subject
      const enrollmentPromises = selectedSubjects.map(async (subjectId) => {
        
        if (!subjectId) {
          throw new Error(`Invalid subject ID: ${subjectId}`);
        }
        
        const response = await subjectAPI.assignTrainees(subjectId, traineeData);
        return { subjectId, response };
      });

      // Wait for all enrollments to complete
      const enrollmentResults = await Promise.all(enrollmentPromises);
      
      console.log('✅ All enrollments completed successfully:', enrollmentResults);

      // Refresh the enrolled trainees table
      setTableRefreshKey(prev => prev + 1);
      
      // Clear selected trainees and subjects
      setSelectedTrainees([]);
      setSelectedSubjects([]);
      
      toast.success(`Successfully enrolled ${selectedTrainees.length} trainees to ${selectedSubjects.length} subject(s)`);
      
    } catch (error) {
      
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
