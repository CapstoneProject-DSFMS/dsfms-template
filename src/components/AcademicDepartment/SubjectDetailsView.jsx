import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  FileTextFill, 
  Plus, 
  Pencil, 
  Trash, 
  People,
  Clock,
  PersonCheckFill,
  Calendar,
  ArrowLeft
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import TrainerActions from './TrainerActions';
import DisableSubjectModal from './DisableSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import EditTrainerModal from './EditTrainerModal';

const SubjectDetailsView = ({ subjectId }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDisableSubject, setShowDisableSubject] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showEditTrainer, setShowEditTrainer] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTrainer, setIsEditingTrainer] = useState(false);
  
  const { sortedData } = useTableSort(trainers);

  useEffect(() => {
    // Hardcoded subject data - matching SubjectTable IDs
    const hardcodedSubjects = {
      's1': {
        id: 's1',
        name: "Safety Basics",
        code: "SB01",
        description: "Comprehensive training on basic safety procedures, emergency protocols, and safety equipment usage.",
        duration: "2 weeks",
        status: "ACTIVE",
        totalTrainers: 2,
        courseId: 1,
        courseName: "Safety Procedures"
      },
      's2': {
        id: 's2',
        name: "Evacuation Drills",
        code: "ED02",
        description: "Training on evacuation procedures, emergency exits, and passenger safety during evacuations.",
        duration: "1 week",
        status: "ACTIVE",
        totalTrainers: 3,
        courseId: 1,
        courseName: "Safety Procedures"
      },
      's3': {
        id: 's3',
        name: "CPR & First Aid",
        code: "FA03",
        description: "Basic first aid training including CPR, medical emergency response, and life-saving techniques.",
        duration: "1 week",
        status: "INACTIVE",
        totalTrainers: 1,
        courseId: 1,
        courseName: "Safety Procedures"
      },
      's4': {
        id: 's4',
        name: "Fire Safety",
        code: "FS04",
        description: "Fire safety training covering fire prevention, detection, and emergency response procedures.",
        duration: "1 week",
        status: "ACTIVE",
        totalTrainers: 2,
        courseId: 1,
        courseName: "Safety Procedures"
      },
      's5': {
        id: 's5',
        name: "Emergency Procedures",
        code: "EP05",
        description: "Comprehensive emergency procedures training for various crisis situations and protocols.",
        duration: "2 weeks",
        status: "ACTIVE",
        totalTrainers: 4,
        courseId: 1,
        courseName: "Safety Procedures"
      }
    };

    // Hardcoded trainers data - matching subject IDs
    const hardcodedTrainers = {
      's1': [
        { id: 1, name: "John Smith", email: "john.smith@instructor.com", specialization: "Safety Basics", status: "ACTIVE" },
        { id: 2, name: "Sarah Johnson", email: "sarah.johnson@instructor.com", specialization: "Safety Procedures", status: "ACTIVE" }
      ],
      's2': [
        { id: 3, name: "Mike Davis", email: "mike.davis@instructor.com", specialization: "Evacuation Procedures", status: "ACTIVE" },
        { id: 4, name: "Lisa Wilson", email: "lisa.wilson@instructor.com", specialization: "Emergency Exits", status: "ACTIVE" },
        { id: 5, name: "David Brown", email: "david.brown@instructor.com", specialization: "Passenger Safety", status: "ACTIVE" }
      ],
      's3': [
        { id: 6, name: "Emily Taylor", email: "emily.taylor@instructor.com", specialization: "CPR & First Aid", status: "ACTIVE" }
      ],
      's4': [
        { id: 7, name: "Robert Anderson", email: "robert.anderson@instructor.com", specialization: "Fire Prevention", status: "ACTIVE" },
        { id: 8, name: "Jennifer Martinez", email: "jennifer.martinez@instructor.com", specialization: "Fire Detection", status: "ACTIVE" }
      ],
      's5': [
        { id: 9, name: "Captain James Wilson", email: "james.wilson@instructor.com", specialization: "Emergency Response", status: "ACTIVE" },
        { id: 10, name: "Captain Maria Garcia", email: "maria.garcia@instructor.com", specialization: "Crisis Management", status: "ACTIVE" },
        { id: 11, name: "Captain Tom Lee", email: "tom.lee@instructor.com", specialization: "Emergency Protocols", status: "ACTIVE" },
        { id: 12, name: "Captain Anna Chen", email: "anna.chen@instructor.com", specialization: "Safety Procedures", status: "ACTIVE" }
      ]
    };

    // Simulate API call
    const loadSubjectData = () => {
      setLoading(true);
      console.log('🔍 Loading subject data for subjectId:', subjectId);
      console.log('🔍 Available subjects:', Object.keys(hardcodedSubjects));
      
      setTimeout(() => {
        const subjectData = hardcodedSubjects[subjectId];
        const trainersData = hardcodedTrainers[subjectId] || [];
        
        console.log('🔍 Found subject data:', subjectData);
        console.log('🔍 Found trainers data:', trainersData);
        
        setSubject(subjectData);
        setTrainers(trainersData);
        setLoading(false);
      }, 500);
    };

    if (subjectId) {
      loadSubjectData();
    }
  }, [subjectId]);

  const handleEditSubject = () => {
    console.log('Edit Subject clicked');
    setShowEditSubject(true);
  };

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
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSubject = () => {
    setShowDisableSubject(true);
  };

  const handleConfirmDisableSubject = async (subjectId) => {
    console.log('Disabling subject:', subjectId);
    setIsDisabling(true);
    try {
      // TODO: Implement disable subject API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast.success('Subject disabled successfully!');
      
      // Navigate back to course details
      if (subject?.courseId) {
        navigate(`/academic/course-detail/${subject.courseId}`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error disabling subject:', error);
      toast.error('Failed to disable subject. Please try again.');
    } finally {
      setIsDisabling(false);
      setShowDisableSubject(false);
    }
  };

  const handleCreateTrainer = () => {
    console.log('Create Trainer clicked');
    toast.info('Navigating to add trainer page...');
    // Navigate to add trainer page or open modal
    navigate(`/academic/subject/${subjectId}/add-trainer`);
  };

  const handleEditTrainer = (trainerId) => {
    console.log('Edit Trainer clicked:', trainerId);
    const trainer = trainers.find(t => t.id === trainerId);
    if (trainer) {
      setSelectedTrainer(trainer);
      setShowEditTrainer(true);
    }
  };

  const handleSaveTrainer = async (trainerData) => {
    console.log('Saving trainer:', trainerData);
    setIsEditingTrainer(true);
    try {
      // TODO: Implement save trainer API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setTrainers(prev => prev.map(trainer => 
        trainer.id === selectedTrainer.id 
          ? { ...trainer, ...trainerData }
          : trainer
      ));
      
      toast.success('Trainer updated successfully!');
    } catch (error) {
      console.error('Error saving trainer:', error);
      toast.error('Failed to save trainer. Please try again.');
    } finally {
      setIsEditingTrainer(false);
    }
  };

  const handleDeleteTrainer = (trainerId) => {
    console.log('Delete Trainer clicked:', trainerId);
    // Show confirmation dialog or implement delete functionality
    if (window.confirm('Are you sure you want to remove this trainer from the subject?')) {
      // TODO: Implement API call to remove trainer
      console.log('Removing trainer:', trainerId);
      // For now, just show a success message
      toast.success('Trainer removed successfully!');
    }
  };

  const handleBack = () => {
    // Navigate back to course details
    if (subject?.courseId) {
      navigate(`/academic/course-detail/${subject.courseId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!subject) {
    return (
      <Container className="py-4">
        <div className="text-center text-muted">
          <FileTextFill size={48} className="mb-3" />
          <h4>Subject not found</h4>
          <p>The requested subject could not be found.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header với nút Back */}
      <div className="d-flex align-items-center mb-3">
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
          <h4 className="mb-0 text-primary">
            <strong>{subject.name}</strong> — {subject.code}
          </h4>
          <small className="text-muted">Subject Details</small>
        </div>
      </div>

      {/* Subject Header */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-2">
                    <FileTextFill className="me-2 text-primary" />
                    {subject.name}
                  </h2>
                  <p className="text-muted mb-0">Subject Code: {subject.code}</p>
                  <p className="text-muted mb-0">Course: {subject.courseName}</p>
                </div>
                <div className="d-flex gap-2">
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.UPDATE}>
                    <Button variant="outline-secondary" size="sm" onClick={handleEditSubject}>
                      <Pencil size={16} className="me-1" />
                      Edit Subject
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.DELETE}>
                    <Button variant="outline-warning" size="sm" onClick={handleDeleteSubject}>
                      <Trash size={16} className="me-1" />
                      Disable Subject
                    </Button>
                  </PermissionWrapper>
                </div>
              </div>
              
              <p className="text-muted mb-3">{subject.description}</p>
              
              <Row>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Clock className="me-2 text-primary" />
                    <div>
                      <small className="text-muted">Duration</small>
                      <div className="fw-semibold">{subject.duration}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <PersonCheckFill className="me-2 text-primary" />
                    <div>
                      <small className="text-muted">Total Trainers</small>
                      <div className="fw-semibold">{subject.totalTrainers}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Badge bg="success" className="me-2">
                      {subject.status}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trainers Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <PersonCheckFill className="me-2" />
                  Trainers ({trainers.length})
                </h5>
                <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.ADD_INSTRUCTOR}>
                  <Button variant="primary" size="sm" onClick={handleCreateTrainer}>
                    <Plus size={16} className="me-1" />
                    Add Trainer
                  </Button>
                </PermissionWrapper>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {trainers.length > 0 ? (
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3 py-3">Trainer Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Specialization</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((trainer) => (
                      <tr key={trainer.id}>
                        <td className="px-3 py-3">
                          <div className="d-flex align-items-center">
                            <PersonCheckFill size={16} className="me-2 text-primary" />
                            <div className="fw-semibold">{trainer.name}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3">{trainer.email}</td>
                        <td className="px-3 py-3">
                          <Badge bg="info">{trainer.specialization}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge bg="success">{trainer.status}</Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <TrainerActions 
                            trainer={trainer}
                            onEdit={handleEditTrainer}
                            onDelete={handleDeleteTrainer}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <PersonCheckFill size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No trainers found</h5>
                  <p className="text-muted">This subject doesn't have any trainers assigned yet.</p>
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.ADD_INSTRUCTOR}>
                    <Button variant="primary" onClick={handleCreateTrainer}>
                      <Plus size={16} className="me-1" />
                      Add First Trainer
                    </Button>
                  </PermissionWrapper>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <EditSubjectModal
        show={showEditSubject}
        onClose={() => setShowEditSubject(false)}
        onSave={handleSaveSubject}
        subject={subject}
        loading={isEditing}
      />
      
      <EditTrainerModal
        show={showEditTrainer}
        onClose={() => setShowEditTrainer(false)}
        onSave={handleSaveTrainer}
        trainer={selectedTrainer}
        loading={isEditingTrainer}
      />
      
      <DisableSubjectModal
        show={showDisableSubject}
        onClose={() => setShowDisableSubject(false)}
        onDisable={handleConfirmDisableSubject}
        subject={subject}
        loading={isDisabling}
      />
    </Container>
  );
};

export default SubjectDetailsView;
