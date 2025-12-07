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
  CalendarEvent
} from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { ROUTES } from '../../constants/routes';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import TrainerActions from './TrainerActions';
import DisableSubjectModal from './DisableSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import EditTrainerModal from './EditTrainerModal';
import AddTrainerModal from './AddTrainerModal';
import AssessmentEventsList from './AssessmentEventsList';
import AssessmentEventDetailModal from './AssessmentEventDetailModal';
import subjectAPI from '../../api/subject';
import '../../styles/scrollable-table.css';

const SubjectDetailsView = ({ subjectId, courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      'PRIMARY_INSTRUCTOR': { text: 'Primary Instructor', variant: 'primary' },
      'EXAMINER': { text: 'Examiner', variant: 'warning' },
      'ASSESSMENT_REVIEWER': { text: 'Assessment Reviewer', variant: 'info' },
      'ASSISTANT_INSTRUCTOR': { text: 'Assistant Instructor', variant: 'secondary' }
    };
    
    const roleInfo = roleMap[role] || { text: role, variant: 'light' };
    return roleInfo;
  };

  // Load trainers from subject data (instructors field)
  const loadSubjectTrainers = useCallback((subjectData) => {
    if (subjectData && subjectData.instructors) {
      // Transform instructor data to match our UI format
      const transformedTrainers = subjectData.instructors.map(trainer => ({
        id: trainer.id,
        eid: trainer.eid,
        name: `${trainer.firstName} ${trainer.lastName}`,
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
    // Prioritize courseId prop, then location.state, then document.referrer, then subject.courseId
    if (courseId) {
      navigate(ROUTES.ACADEMIC_COURSE_DETAIL(courseId));
    } else if (location.state?.courseId) {
      navigate(ROUTES.ACADEMIC_COURSE_DETAIL(location.state.courseId));
    } else if (document.referrer) {
      // Extract course ID from referrer URL if possible
      const referrerMatch = document.referrer.match(/\/course-detail\/([^/]+)/);
      if (referrerMatch) {
        navigate(ROUTES.ACADEMIC_COURSE_DETAIL(referrerMatch[1]));
      } else {
        navigate(-1);
      }
    } else if (subject?.courseId) {
      navigate(ROUTES.ACADEMIC_COURSE_DETAIL(subject.courseId));
    } else {
      navigate(-1);
    }
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
            Back to Course
          </Button>
          <div>
            <h2 className="mb-1">{subject.name}</h2>
            <p className="text-muted mb-0">Subject Code: {subject.code}</p>
          </div>
        </div>
        <div className="d-flex gap-2"> {/* Added div for buttons */}
          <PermissionWrapper
            permission={PERMISSION_IDS.UPDATE_SUBJECT}
            fallback={null}
          >
            <Button variant="primary" onClick={() => setShowEditSubject(true)} className="d-flex align-items-center" size="sm">
              <Pencil size={16} className="me-1" />
              Edit Subject
            </Button>
          </PermissionWrapper>
          <PermissionWrapper
            permission={PERMISSION_IDS.ARCHIVE_SUBJECT}
            fallback={null}
          >
            <Button variant="outline-danger" onClick={() => setShowDisableSubject(true)} className="d-flex align-items-center" size="sm">
              <Trash size={16} className="me-1" />
              Archive Subject
            </Button>
          </PermissionWrapper>
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
                  Trainers
                </Nav.Link>
              </Nav.Item>
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
                  All Related Assessment Events
                </Nav.Link>
              </Nav.Item>
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
                      <p><strong>Name:</strong> {subject.name}</p>
                      <p><strong>Code:</strong> {subject.code}</p>
                      <p><strong>Description:</strong> {subject.description}</p>
                      <p><strong>Method:</strong> {subject.method}</p>
                      <p><strong>Duration:</strong> {subject.duration} days</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Type:</strong> {subject.type}</p>
                      <p><strong>Pass Score:</strong> {subject.passScore}</p>
                      <p><strong>Room:</strong> {subject.roomName}</p>
                      <p><strong>Time Slot:</strong> {subject.timeSlot}</p>
                      <p><strong>Start Date:</strong> {new Date(subject.startDate).toLocaleDateString()}</p>
                      <p><strong>End Date:</strong> {new Date(subject.endDate).toLocaleDateString()}</p>
                    </Col>
                  </Row>
                  {subject.remarkNote && (
                    <Row>
                      <Col xs={12}>
                        <p><strong>Remark Note:</strong> {subject.remarkNote}</p>
                      </Col>
                    </Row>
                  )}
                </div>
              </Tab.Pane>

              {/* Trainers Tab */}
              <Tab.Pane eventKey="trainers">
                <div className="scrollable-table-container admin-table trainer-table-scroll">
                  <Table hover className="mb-0" style={{ fontSize: '0.875rem' }}>
                    <thead className="sticky-header">
                      <tr>
                        <th 
                          className="fw-semibold"
                          style={{
                            backgroundColor: 'var(--bs-primary)',
                            color: 'white',
                            borderColor: 'var(--bs-primary)',
                            borderLeft: 'none',
                            borderRight: 'none'
                          }}
                        >
                          EID
                        </th>
                        <th 
                          className="fw-semibold"
                          style={{
                            backgroundColor: 'var(--bs-primary)',
                            color: 'white',
                            borderColor: 'var(--bs-primary)',
                            borderLeft: 'none',
                            borderRight: 'none'
                          }}
                        >
                          Name
                        </th>
                        <th 
                          className="fw-semibold"
                          style={{
                            backgroundColor: 'var(--bs-primary)',
                            color: 'white',
                            borderColor: 'var(--bs-primary)',
                            borderLeft: 'none',
                            borderRight: 'none'
                          }}
                        >
                          Role
                        </th>
                        <th 
                          className="fw-semibold text-center"
                          style={{
                            backgroundColor: 'var(--bs-primary)',
                            color: 'white',
                            borderColor: 'var(--bs-primary)',
                            borderLeft: 'none',
                            borderRight: 'none'
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((trainer, index) => {
                        const roleInfo = formatRoleDisplay(trainer.role);
                        return (
                          <tr 
                            key={trainer.id}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                            style={{
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                            }}
                          >
                            <td 
                              className="align-middle"
                              style={{ borderLeft: 'none', borderRight: 'none' }}
                            >
                              <Badge bg="secondary" className="text-white">
                                {trainer.eid}
                              </Badge>
                            </td>
                            <td 
                              className="align-middle"
                              style={{ borderLeft: 'none', borderRight: 'none' }}
                            >
                              <span className="fw-medium text-dark">{trainer.name}</span>
                            </td>
                            <td 
                              className="align-middle"
                              style={{ borderLeft: 'none', borderRight: 'none' }}
                            >
                              <Badge bg="success">
                                {roleInfo.text}
                              </Badge>
                            </td>
                            <td 
                              className="align-middle text-center"
                              style={{ borderLeft: 'none', borderRight: 'none' }}
                            >
                              <TrainerActions
                                trainer={trainer}
                                onEdit={() => {
                                  setSelectedTrainer(trainer);
                                  setShowEditTrainer(true);
                                }}
                                onDelete={handleRemoveTrainer}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>

              {/* Assessment Events Tab */}
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
        courseId={courseId}
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