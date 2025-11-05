import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Upload, Search, Plus } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubjectSelectionPanel from '../../components/AcademicDepartment/SubjectSelectionPanel';
import TraineeSelectionPanel from '../../components/AcademicDepartment/TraineeSelectionPanel';
import EnrolledTraineesTable from '../../components/AcademicDepartment/EnrolledTraineesTable';
import BulkImportTraineesModal from '../../components/AcademicDepartment/BulkImportTraineesModal';
import BatchCodeModal from '../../components/AcademicDepartment/BatchCodeModal';
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
  const [showBatchCodeModal, setShowBatchCodeModal] = useState(false);
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

  const handleEnroll = () => {
    if (selectedSubjects.length === 0 || selectedTrainees.length === 0) {
      toast.warning('Please select both subjects and trainees to enroll');
      return;
    }

    // Show batch code modal instead of directly enrolling
    setShowBatchCodeModal(true);
  };

  const handleBatchCodeConfirm = async (batchCode) => {
    setEnrollLoading(true);
    setShowBatchCodeModal(false);
    
    try {
      // Prepare data for API call - Backend expects batch_code and trainee_user_ids (snake_case)
      console.log('🔍 Selected trainees for enrollment:', selectedTrainees);
      console.log('🔍 Using batch code:', batchCode);
      
      // Validate trainee IDs
      const traineeIds = selectedTrainees.map(trainee => {
        console.log('🔍 Processing trainee:', {
          id: trainee.id,
          eid: trainee.eid,
          name: `${trainee.firstName} ${trainee.lastName}`
        });
        
        if (!trainee.id) {
          throw new Error(`Trainee ${trainee.eid} (${trainee.firstName} ${trainee.lastName}) is missing UUID`);
        }
        
        return trainee.id; // Just the user IDs as array
      });
      
      // Backend expects camelCase format
      const traineeData = {
        batchCode: String(batchCode).trim(), // Ensure it's a string
        traineeUserIds: traineeIds // Array of UUIDs
      };
      
      console.log('🔍 Final trainee data for API (camelCase):', traineeData);
      console.log('🔍 Trainee IDs array:', traineeIds);
      console.log('🔍 Batch code type:', typeof traineeData.batchCode, 'value:', traineeData.batchCode);
      console.log('🔍 Trainee IDs type:', Array.isArray(traineeData.traineeUserIds), 'length:', traineeData.traineeUserIds?.length);

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
      const enrolledCount = selectedTrainees.length;
      const subjectCount = selectedSubjects.length;
      setSelectedTrainees([]);
      setSelectedSubjects([]);
      
      toast.success(`Successfully enrolled ${enrolledCount} trainees to ${subjectCount} subject(s) with batch code: ${batchCode}`);
      
    } catch (error) {
      // Log detailed error for debugging
      console.error('❌ Enrollment Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        errors: error.response?.data?.errors,
        errorsDetailed: error.response?.data?.errors?.map((err, idx) => ({
          index: idx,
          field: err.field,
          message: err.message,
          code: err.code,
          value: err.value,
          fullError: err
        })),
        message: error.response?.data?.message,
        fullErrorResponse: JSON.stringify(error.response?.data, null, 2),
        fullError: error
      });
      
      // Show more specific error message
      let errorMessage = 'Failed to enroll trainees. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Format validation errors more clearly
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = `Validation errors: ${errors.map(e => e.message || e).join(', ')}`;
        } else if (typeof errors === 'object') {
          errorMessage = `Validation errors: ${JSON.stringify(errors, null, 2)}`;
        } else {
          errorMessage = `Validation errors: ${errors}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <Container fluid className="py-4 px-4 enroll-page" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Fixed */}
      <div className="mb-3 flex-shrink-0">
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
            <Card.Body className="py-3 px-3">
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
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" style={{ width: '0.5rem', height: '0.5rem' }}></span>
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

      {/* Main Content - Two Columns */}
      <div className="mb-4 flex-shrink-0 main-content-section" style={{ position: 'relative', zIndex: 1, marginBottom: '3rem' }}>
        <Row className="g-4">
          {/* Panel 1: Subject Selection */}
          <Col lg={6}>
            <div style={{ height: '500px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
              <SubjectSelectionPanel 
                selectedSubjects={selectedSubjects}
                onSelectionChange={setSelectedSubjects}
              />
            </div>
          </Col>

          {/* Panel 2: Trainee Selection */}
          <Col lg={6}>
            <div style={{ height: '500px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
              <TraineeSelectionPanel 
                selectedTrainees={selectedTrainees}
                onSelectionChange={setSelectedTrainees}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Spacer to push Enrolled Trainees to bottom */}
      <div className="flex-spacer" style={{ flex: '1 1 auto', minHeight: '2rem' }}></div>

      {/* Enrolled Trainees Table - Full Width at Bottom - OUTSIDE of Row */}
      <Row className="enrolled-trainees-row">
        <Col xs={12}>
          <div 
            className="enrolled-trainees-container flex-shrink-0" 
            id="enrolled-trainees-section"
            style={{ 
              marginTop: '0', 
              marginBottom: '2rem', 
              clear: 'both',
              width: '100%',
              position: 'relative',
              zIndex: 1000,
              display: 'block'
            }}
          >
            <EnrolledTraineesTable 
              key={tableRefreshKey}
              courseId={courseId}
              loading={false}
            />
          </div>
        </Col>
      </Row>

      {/* Bulk Import Modal */}
      <BulkImportTraineesModal
        show={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImportTrainees}
        loading={bulkImportLoading}
      />

      {/* Batch Code Modal */}
      <BatchCodeModal
        show={showBatchCodeModal}
        onClose={() => setShowBatchCodeModal(false)}
        onConfirm={handleBatchCodeConfirm}
        loading={enrollLoading}
      />
    </Container>
  );
};

export default EnrollTraineesPage;
