import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import TrainerActions from './TrainerActions';
import DisableSubjectModal from './DisableSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import EditTrainerModal from './EditTrainerModal';
import AddTrainerModal from './AddTrainerModal';
import subjectAPI from '../../api/subject';

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
  const [isAddingTrainer] = useState(false);
  const [isEditingTrainer] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('subject-info');
  
  const { sortedData } = useTableSort(trainers);

  // Load subject data from API
  useEffect(() => {
    const loadSubjectData = async () => {
      if (!subjectId) return;
      
      setLoading(true);
      try {
        console.log('🔍 SubjectDetailsView - Loading subject:', subjectId);
        const response = await subjectAPI.getSubjectById(subjectId);
        console.log('🔍 SubjectDetailsView - API Response:', response);
        
        if (response) {
          setSubject(response);
          // Set mock trainers and trainees for now
          setTrainers([
            {
              id: 't1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '+1 234 567 8900',
              status: 'ACTIVE',
              specialization: 'Safety Training',
              experience: '5 years'
            },
            {
              id: 't2', 
              name: 'Sarah Johnson',
              email: 'sarah.johnson@example.com',
              phone: '+1 234 567 8901',
              status: 'ACTIVE',
              specialization: 'Emergency Procedures',
              experience: '3 years'
            }
          ]);
          console.log('✅ SubjectDetailsView - Loaded subject:', response.name);
        } else {
          console.log('❌ SubjectDetailsView - No subject found');
          setSubject(null);
        }
      } catch (error) {
        console.error('❌ SubjectDetailsView - Error loading subject:', error);
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadSubjectData();
    }
  }, [subjectId]);

  // const handleEditSubject = () => {
  //   console.log('Edit Subject clicked');
  //   setShowEditSubject(true);
  // };

  const handleSaveSubject = async (subjectData) => {
    console.log('Saving subject:', subjectData);
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
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to update subject');
    } finally {
      setIsEditing(false);
    }
  };

  // const handleDeleteSubject = () => {
  //   console.log('Delete Subject clicked');
  //   setShowDisableSubject(true);
  // };

  const handleConfirmDisableSubject = async (subjectId) => {
    console.log('Disabling subject:', subjectId);
    setIsDisabling(true);
    try {
      // TODO: Implement disable subject API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      console.log('Subject disabled successfully!');
      
      // Close modal
      setShowDisableSubject(false);
    } catch (error) {
      console.error('Error disabling subject:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleBack = () => {
    // Prioritize courseId prop, then location.state, then document.referrer, then subject.courseId
    if (courseId) {
      navigate(`/academic/course-detail/${courseId}`);
    } else if (location.state?.courseId) {
      navigate(`/academic/course-detail/${location.state.courseId}`);
    } else if (document.referrer) {
      // Extract course ID from referrer URL if possible
      const referrerMatch = document.referrer.match(/\/course-detail\/([^/]+)/);
      if (referrerMatch) {
        navigate(`/academic/course-detail/${referrerMatch[1]}`);
      } else {
        navigate(-1);
      }
    } else if (subject?.courseId) {
      navigate(`/academic/course-detail/${subject.courseId}`);
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
      </div>

      {/* Tab Interface */}
      <Card className="border-0 shadow-sm">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Card.Header className="border-bottom py-2">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="subject-info" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    color: activeTab === 'subject-info' ? '#0d6efd' : '#6c757d',
                    fontWeight: activeTab === 'subject-info' ? '600' : '400'
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
                    color: activeTab === 'trainers' ? '#0d6efd' : '#6c757d',
                    fontWeight: activeTab === 'trainers' ? '600' : '400'
                  }}
                >
                  <PersonCheckFill className="me-2" size={16} />
                  Trainers ({trainers.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body className="p-4">
            <Tab.Content>
              {/* Subject Information Tab */}
              <Tab.Pane eventKey="subject-info">
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
                    <p><strong>Pass Score:</strong> {subject.passScore}%</p>
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
              </Tab.Pane>

              {/* Trainers Tab */}
              <Tab.Pane eventKey="trainers">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((trainer) => (
                      <tr key={trainer.id}>
                        <td>{trainer.name}</td>
                        <td>{trainer.email}</td>
                        <td>{trainer.phone}</td>
                        <td>
                          <Badge bg={trainer.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {trainer.status}
                          </Badge>
                        </td>
                        <td>{trainer.specialization}</td>
                        <td>{trainer.experience}</td>
                        <td>
                          <TrainerActions
                            trainer={trainer}
                            onEdit={() => {
                              setSelectedTrainer(trainer);
                              setShowEditTrainer(true);
                            }}
                            onDelete={() => console.log('Delete trainer:', trainer.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
        onSave={() => {
          console.log('Add trainer');
          setShowAddTrainer(false);
        }}
        loading={isAddingTrainer}
      />

      <EditTrainerModal
        show={showEditTrainer}
        onClose={() => setShowEditTrainer(false)}
        onSave={() => {
          console.log('Edit trainer');
          setShowEditTrainer(false);
        }}
        trainer={selectedTrainer}
        loading={isEditingTrainer}
      />
    </Container>
  );
};

export default SubjectDetailsView;