import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Nav, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  FileTextFill, 
  Plus, 
  Pencil, 
  Trash, 
  Clock,
  PersonCheckFill,
  Calendar,
  ArrowLeft,
  CalendarEvent,
  Airplane,
  FileEarmarkText,
  People
} from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../constants/routes';
import { isDepartmentHead } from '../../utils/sidebarUtils';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import TrainerActions from './TrainerActions';
import TrainersInAssessmentTable from './TrainersInAssessmentTable';
import DisableSubjectModal from './DisableSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import EditTrainerModal from './EditTrainerModal';
import AddTrainerModal from './AddTrainerModal';
import AssessmentEventsList from './AssessmentEventsList';
import AssessmentEventDetailModal from './AssessmentEventDetailModal';
import EnrolledTraineesTable from './EnrolledTraineesTable';
import subjectAPI from '../../api/subject';
import '../../styles/scrollable-table.css';

const SubjectDetailsView = ({ subjectId, courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Check if user is Department Head
  const isDeptHead = isDepartmentHead(user);
  
  // Check if user has any trainer action permission (for showing Actions column)
  const hasTrainerActionPermission = hasPermission(PERMISSION_IDS.ASSIGN_TRAINERS) || 
                                      hasPermission(PERMISSION_IDS.REMOVE_TRAINERS);
  
  const [subject, setSubject] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDisableSubject, setShowDisableSubject] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showEditTrainer, setShowEditTrainer] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [isEditingTrainer, setIsEditingTrainer] = useState(false);
  const [showAssessmentEventDetail, setShowAssessmentEventDetail] = useState(false);
  const [selectedAssessmentEvent, setSelectedAssessmentEvent] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('subject-info');
  
  const { sortedData } = useTableSort(trainers);

  // Function to format role display
  const formatRoleDisplay = (role) => {
    const roleMap = {
      'PRIMARY_INSTRUCTOR': { text: 'Primary Instructor', variant: 'success' },
      'EXAMINER': { text: 'Examiner', variant: 'success' },
      'ASSESSMENT_REVIEWER': { text: 'Assessment Reviewer', variant: 'success' },
      'ASSISTANT_INSTRUCTOR': { text: 'Assistant Instructor', variant: 'success' }
    };
    
    const roleInfo = roleMap[role] || { text: role, variant: 'success' };
    return roleInfo;
  };

  // Load trainers from subject data (instructors field)
  const loadSubjectTrainers = useCallback((subjectData) => {
    if (subjectData && subjectData.instructors) {
      // Transform instructor data to match our UI format
      const transformedTrainers = subjectData.instructors.map(trainer => ({
        id: trainer.id,
        eid: trainer.eid,
        name: `${trainer.lastName}${trainer.middleName ? ' ' + trainer.middleName : ''} ${trainer.firstName}`,
        role: trainer.roleInSubject,
        assignedAt: trainer.assignedAt
      }));
      
      setTrainers(transformedTrainers);
    } else {
      setTrainers([]);
    }
  }, []);

  // Load subject data from API
  useEffect(() => {
    const loadSubjectData = async () => {
      if (!subjectId) {
        setSubject(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await subjectAPI.getSubjectById(subjectId);
        
        if (response) {
          setSubject(response);
          // Load trainers from subject data (instructors field)
          loadSubjectTrainers(response);
        } else {
          setSubject(null);
        }
      } catch (error) {
        
        // Show user-friendly error message with validation details
        let errorMessage = error.response?.data?.message || error.message || 'Failed to load subject details';
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
          const firstError = error.response.data.errors[0];
          errorMessage = `${errorMessage}: ${firstError.message || firstError.field}`;
        }
        toast.error(errorMessage);
        
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadSubjectData();
    }
  }, [subjectId, loadSubjectTrainers]);

  // const handleEditSubject = () => {
  //   console.log('Edit Subject clicked');
  //   setShowEditSubject(true);
  // };

  const handleSaveSubject = async (subjectData) => {
    setIsEditing(true);
    try {
      // TODO: Implement save subject API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSubject(prev => ({
        ...prev,
        ...subjectData
      }));
      
      toast.success('Subject updated successfully!');
      setShowEditSubject(false);
    } catch {
      toast.error('Failed to update subject');
    } finally {
      setIsEditing(false);
    }
  };

  // const handleDeleteSubject = () => {
  //   console.log('Delete Subject clicked');
  //   setShowDisableSubject(true);
  // };

  const handleConfirmDisableSubject = async () => {
    setIsDisabling(true);
    try {
      // TODO: Implement disable subject API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      
      // Close modal
      setShowDisableSubject(false);
    } catch {
      // Handle error silently
    } finally {
      setIsDisabling(false);
    }
  };

  const handleAddTrainer = async (trainerData) => {
    setIsAddingTrainer(true);
    try {
      // Call API to add trainer to subject
      await subjectAPI.addTrainerToSubject(subjectId, trainerData);
      
      // Reload subject data to get updated trainers list
      const updatedSubject = await subjectAPI.getSubjectById(subjectId);
      if (updatedSubject) {
        setSubject(updatedSubject);
        loadSubjectTrainers(updatedSubject);
      }
      
      toast.success('Trainer added successfully!');
      setShowAddTrainer(false);
    } catch (error) {
      
      // Display specific error message from API response
      const errorMessage = error?.message || error?.error || 'Failed to add trainer';
      toast.error(errorMessage);
    } finally {
      setIsAddingTrainer(false);
    }
  };

  const handleEditTrainer = async (roleData) => {
    if (!selectedTrainer) return;
    
    setIsEditingTrainer(true);
    try {
      // Call API to update trainer role
      await subjectAPI.updateTrainerRole(subjectId, selectedTrainer.id, roleData);
      
      // Reload subject data to get updated trainers list
      const updatedSubject = await subjectAPI.getSubjectById(subjectId);
      if (updatedSubject) {
        setSubject(updatedSubject);
        loadSubjectTrainers(updatedSubject);
      }
      
      toast.success('Trainer role updated successfully!');
      setShowEditTrainer(false);
    } catch (error) {
      console.error('Error updating trainer role:', error);
      
      // Display specific error message from API response
      const errorMessage = error?.message || error?.error || 'Failed to update trainer role';
      toast.error(errorMessage);
    } finally {
      setIsEditingTrainer(false);
    }
  };

  const handleRemoveTrainer = async (trainerId) => {
    if (!trainerId) return;
    
    try {
      // Call API to remove trainer from subject
      await subjectAPI.removeTrainerFromSubject(subjectId, trainerId);
      
      // Reload subject data to get updated trainers list
      const updatedSubject = await subjectAPI.getSubjectById(subjectId);
      if (updatedSubject) {
        setSubject(updatedSubject);
        loadSubjectTrainers(updatedSubject);
      }
      
      toast.success('Trainer removed successfully!');
    } catch (error) {
      console.error('Error removing trainer:', error);
      
      // Display specific error message from API response
      const errorMessage = error?.message || error?.error || 'Failed to remove trainer';
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    // Simply go back to the previous page in browser history
    navigate(-1);
  };

  // Show loading state
  if (loading) {
    return (
      <Container className="py-4">
        <LoadingSkeleton rows={4} columns={3} />
      </Container>
    );
  }

  // Show not found state
  if (!subject) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Subject not found</h3>
          <p>The requested subject could not be found.</p>
          <Button variant="primary" onClick={handleBack}>
            <ArrowLeft className="me-2" size={16} />
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4 subject-details">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" onClick={handleBack} className="me-3">
            <ArrowLeft className="me-2" size={16} />
            Back
          </Button>
        </div>
        <div className="d-flex gap-2"> {/* Added div for buttons */}
          {subject?.status === 'PLANNED' && (
            <PermissionWrapper
              permission={PERMISSION_IDS.UPDATE_SUBJECT}
              fallback={null}
            >
              <Button variant="primary" onClick={() => setShowEditSubject(true)} className="d-flex align-items-center" size="sm">
                <Pencil size={16} className="me-1" />
                Edit Subject
              </Button>
            </PermissionWrapper>
          )}
        </div>
      </div>

      {/* Tab Interface */}
      <Card className="border-0 shadow-sm">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Card.Header className="border-bottom py-2 bg-primary d-flex justify-content-between align-items-center">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="subject-info" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'subject-info' ? '600' : '400',
                    opacity: activeTab === 'subject-info' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <FileTextFill className="me-2" size={16} />
                  Subject Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="trainers" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'trainers' ? '600' : '400',
                    opacity: activeTab === 'trainers' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <PersonCheckFill className="me-2" size={16} />
                  Trainers In Assessment
                </Nav.Link>
              </Nav.Item>
              {hasPermission(PERMISSION_IDS.ENROLL_SINGLE_TRAINEE) && (
              <Nav.Item>
                <Nav.Link 
                  eventKey="trainees" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'trainees' ? '600' : '400',
                    opacity: activeTab === 'trainees' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <People className="me-2" size={16} />
                  Trainee Roster
                </Nav.Link>
              </Nav.Item>
              )}
              {user && user.role !== 'TRAINEE' && (
              <Nav.Item>
                <Nav.Link 
                  eventKey="assessment-events" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'assessment-events' ? '600' : '400',
                    opacity: activeTab === 'assessment-events' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <CalendarEvent className="me-2" size={16} />
                  Assessment Events
                </Nav.Link>
              </Nav.Item>
              )}
            </Nav>
            {activeTab === 'trainers' && (
              <PermissionWrapper 
                permission={PERMISSION_IDS.ASSIGN_TRAINERS}
                fallback={null}
              >
                <Button 
                  variant="light"
                  size="sm"
                  onClick={() => setShowAddTrainer(true)}
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#dee2e6',
                    color: '#000000',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                >
                  <Plus size={14} className="me-1" />
                  Add Trainer
                </Button>
              </PermissionWrapper>
            )}
          </Card.Header>
          
          <Card.Body className="p-0">
            <Tab.Content>
              {/* Subject Information Tab */}
              <Tab.Pane eventKey="subject-info">
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Name</h6>
                        <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{subject.name}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Code</h6>
                        <Badge bg="secondary" className="px-2 py-1">
                          {subject.code}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Description</h6>
                        <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{subject.description || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Method</h6>
                        <Badge bg="info" className="px-2 py-1">
                          {subject.method || 'N/A'}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Duration</h6>
                        <div className="d-flex align-items-center">
                          <Clock size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{subject.duration} days</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Is Simulator</h6>
                        <div className="d-flex align-items-center">
                          {subject.isSIM || subject.is_sim ? (
                            <div className="d-flex align-items-center" style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#d1ecf1',
                              border: '2px solid #0dcaf0',
                              borderRadius: '8px',
                              color: '#055160',
                              fontWeight: '600',
                              width: 'fit-content'
                            }}>
                              <Airplane size={18} className="me-2" />
                              <span>Yes</span>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center" style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#f8f9fa',
                              border: '2px solid #dee2e6',
                              borderRadius: '8px',
                              color: '#6c757d',
                              fontWeight: '600',
                              width: 'fit-content'
                            }}>
                              <span>No</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Type</h6>
                        <Badge bg="info" className="px-2 py-1">
                          {subject.type || 'N/A'}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Pass Score</h6>
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>{subject.passScore || 'N/A'}</span>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Venue</h6>
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>{subject.roomName || 'N/A'}</span>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Time Slot</h6>
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>{subject.timeSlot || 'N/A'}</span>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Start Date</h6>
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{new Date(subject.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>End Date</h6>
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{new Date(subject.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <div className="mb-3">
                        <h6 className="mb-2 d-flex align-items-center" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>
                          <FileEarmarkText className="me-2" size={18} />
                          Remark Note
                        </h6>
                        <div style={{
                          padding: '1rem',
                          backgroundColor: '#fff3cd',
                          border: '1px solid #ffc107',
                          borderRadius: '8px',
                          minHeight: '60px'
                        }}>
                          <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                            {subject.remarkNote || 'No remark note available'}
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>

              {/* Trainers Tab */}
              <Tab.Pane eventKey="trainers">
                <TrainersInAssessmentTable
                  trainers={sortedData}
                  variant="subject"
                  onEdit={(trainer) => {
                    setSelectedTrainer(trainer);
                    setShowEditTrainer(true);
                  }}
                  onDelete={handleRemoveTrainer}
                  hasActionPermission={hasTrainerActionPermission}
                  editPermission={PERMISSION_IDS.ASSIGN_TRAINERS}
                  formatRole={formatRoleDisplay}
                  emptyMessage="No trainers assigned yet."
                />
              </Tab.Pane>

              {/* Trainee Roster Tab */}
              {hasPermission(PERMISSION_IDS.ENROLL_SINGLE_TRAINEE) && (
              <Tab.Pane eventKey="trainees" style={{ height: '100%' }}>
                <EnrolledTraineesTable 
                  subjectId={subjectId} 
                  courseId={courseId}
                />
              </Tab.Pane>
              )}

              {/* Assessment Events Tab */}
              {user && user.role !== 'TRAINEE' && (
              <Tab.Pane eventKey="assessment-events" style={{ height: '100%' }}>
                <AssessmentEventsList
                  subjectId={subjectId}
                  courseId={courseId}
                  onView={(event) => {
                    setSelectedAssessmentEvent(event);
                    setShowAssessmentEventDetail(true);
                  }}
                />
              </Tab.Pane>
              )}

            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>

      {/* Modals */}
      <DisableSubjectModal
        show={showDisableSubject}
        onClose={() => setShowDisableSubject(false)}
        onConfirm={handleConfirmDisableSubject}
        subject={subject}
        loading={isDisabling}
      />

      <EditSubjectModal
        show={showEditSubject}
        onClose={() => setShowEditSubject(false)}
        onSave={handleSaveSubject}
        subject={subject}
        loading={isEditing}
      />

      <AddTrainerModal
        show={showAddTrainer}
        onClose={() => setShowAddTrainer(false)}
        onSave={handleAddTrainer}
        loading={isAddingTrainer}
        courseId={null}
        subjectId={subjectId}
      />

      <EditTrainerModal
        show={showEditTrainer}
        onClose={() => setShowEditTrainer(false)}
        onSave={handleEditTrainer}
        trainer={selectedTrainer}
        loading={isEditingTrainer}
      />

      <AssessmentEventDetailModal
        show={showAssessmentEventDetail}
        onClose={() => {
          setShowAssessmentEventDetail(false);
          setSelectedAssessmentEvent(null);
        }}
        event={selectedAssessmentEvent}
      />
    </Container>
  );
};

export default SubjectDetailsView;