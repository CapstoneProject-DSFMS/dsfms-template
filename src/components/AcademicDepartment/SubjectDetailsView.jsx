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
  ArrowLeft,
  ChevronDown
} from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import TrainerActions from './TrainerActions';
import TraineeActions from './TraineeActions';
import DisableSubjectModal from './DisableSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import EditTrainerModal from './EditTrainerModal';
import AddTrainerModal from './AddTrainerModal';

const SubjectDetailsView = ({ subjectId, courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [subject, setSubject] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);
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
  
  // Collapse states for tables
  const [isTrainersCollapsed, setIsTrainersCollapsed] = useState(false);
  const [isTraineesCollapsed, setIsTraineesCollapsed] = useState(false);
  
  const { sortedData } = useTableSort(trainers);
  const { sortedData: sortedTrainees } = useTableSort(trainees);

  useEffect(() => {
    // Hardcoded subject data - matching SubjectTable IDs
    const hardcodedSubjects = {
      's1': {
        id: 's1',
        course_id: 'c1',
        name: "Safety Basics",
        description: "Comprehensive training on basic safety procedures, emergency protocols, and safety equipment usage.",
        code: "SB01",
        method: "THEORY",
        duration: 14, // days
        type: "MANDATORY",
        room_name: "Training Room A",
        remark_note: "Basic safety procedures training",
        time_slot: "09:00-17:00",
        pass_score: 70.0,
        start_date: "2024-01-15T09:00:00Z",
        end_date: "2024-01-29T17:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        // Additional display fields
        status: "ACTIVE",
        totalTrainers: 2,
        courseId: 1,
        courseName: "Cabin Crew Training"
      },
      's2': {
        id: 's2',
        course_id: 'c1',
        name: "Evacuation Drills",
        description: "Training on evacuation procedures, emergency exits, and passenger safety during evacuations.",
        code: "ED02",
        method: "PRACTICAL",
        duration: 7, // days
        type: "MANDATORY",
        room_name: "Training Room B",
        remark_note: "Evacuation procedures training",
        time_slot: "09:00-17:00",
        pass_score: 75.0,
        start_date: "2024-02-01T09:00:00Z",
        end_date: "2024-02-08T17:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        // Additional display fields
        status: "ACTIVE",
        totalTrainers: 3,
        courseId: 1,
        courseName: "Cabin Crew Training"
      },
      's3': {
        id: 's3',
        course_id: 'c1',
        name: "CPR & First Aid",
        description: "Basic first aid training including CPR, medical emergency response, and life-saving techniques.",
        code: "FA03",
        method: "PRACTICAL",
        duration: 7, // days
        type: "MANDATORY",
        room_name: "Medical Training Room",
        remark_note: "CPR and first aid certification",
        time_slot: "09:00-17:00",
        pass_score: 80.0,
        start_date: "2024-03-01T09:00:00Z",
        end_date: "2024-03-08T17:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        // Additional display fields
        status: "INACTIVE",
        totalTrainers: 1,
        courseId: 1,
        courseName: "Cabin Crew Training"
      },
      's4': {
        id: 's4',
        course_id: 'c1',
        name: "Fire Safety",
        description: "Fire safety training covering fire prevention, detection, and emergency response procedures.",
        code: "FS04",
        method: "PRACTICAL",
        duration: 7, // days
        type: "MANDATORY",
        room_name: "Fire Training Room",
        remark_note: "Fire safety and prevention training",
        time_slot: "09:00-17:00",
        pass_score: 75.0,
        start_date: "2024-04-01T09:00:00Z",
        end_date: "2024-04-08T17:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        // Additional display fields
        status: "ACTIVE",
        totalTrainers: 2,
        courseId: 1,
        courseName: "Cabin Crew Training"
      },
      's5': {
        id: 's5',
        course_id: 'c1',
        name: "Emergency Procedures",
        description: "Comprehensive emergency procedures training for various crisis situations and protocols.",
        code: "EP05",
        method: "MIXED",
        duration: 14, // days
        type: "MANDATORY",
        room_name: "Emergency Training Center",
        remark_note: "Comprehensive emergency response training",
        time_slot: "09:00-17:00",
        pass_score: 85.0,
        start_date: "2024-05-01T09:00:00Z",
        end_date: "2024-05-15T17:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        // Additional display fields
        status: "ACTIVE",
        totalTrainers: 4,
        courseId: 1,
        courseName: "Cabin Crew Training"
      }
    };

    // Hardcoded trainers data - matching Subject_Instructor table schema
    const hardcodedTrainers = {
      's1': [
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440001", 
          subject_id: "s1",
          role_in_subject: "LEAD_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "John Smith", 
          email: "john.smith@instructor.com", 
          specialization: "Safety Basics",
          status: "ACTIVE"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440002", 
          subject_id: "s1",
          role_in_subject: "ASSISTANT_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Sarah Johnson", 
          email: "sarah.johnson@instructor.com", 
          specialization: "Safety Procedures",
          status: "ACTIVE"
        }
      ],
      's2': [
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440003", 
          subject_id: "s2",
          role_in_subject: "LEAD_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Mike Davis", 
          email: "mike.davis@instructor.com", 
          specialization: "Evacuation Procedures",
          status: "ACTIVE"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440004", 
          subject_id: "s2",
          role_in_subject: "ASSISTANT_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Lisa Wilson", 
          email: "lisa.wilson@instructor.com", 
          specialization: "Emergency Exits",
          status: "ACTIVE"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440005", 
          subject_id: "s2",
          role_in_subject: "SUPPORT_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "David Brown", 
          email: "david.brown@instructor.com", 
          specialization: "Passenger Safety",
          status: "ACTIVE"
        }
      ],
      's3': [
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440006", 
          subject_id: "s3",
          role_in_subject: "LEAD_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Emily Taylor", 
          email: "emily.taylor@instructor.com", 
          specialization: "CPR & First Aid",
          status: "ACTIVE"
        }
      ],
      's4': [
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440007", 
          subject_id: "s4",
          role_in_subject: "LEAD_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Robert Anderson", 
          email: "robert.anderson@instructor.com", 
          specialization: "Fire Prevention",
          status: "ACTIVE"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440008", 
          subject_id: "s4",
          role_in_subject: "ASSISTANT_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Jennifer Martinez", 
          email: "jennifer.martinez@instructor.com", 
          specialization: "Fire Detection",
          status: "ACTIVE"
        }
      ],
      's5': [
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440009", 
          subject_id: "s5",
          role_in_subject: "LEAD_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Captain James Wilson", 
          email: "james.wilson@instructor.com", 
          specialization: "Emergency Response",
          status: "ACTIVE"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440010", 
          subject_id: "s5",
          role_in_subject: "LEAD_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Captain Maria Garcia", 
          email: "maria.garcia@instructor.com", 
          specialization: "Crisis Management"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440011", 
          subject_id: "s5",
          role_in_subject: "ASSISTANT_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Captain Tom Lee", 
          email: "tom.lee@instructor.com", 
          specialization: "Emergency Protocols"
        },
        { 
          trainer_user_id: "550e8400-e29b-41d4-a716-446655440012", 
          subject_id: "s5",
          role_in_subject: "SUPPORT_INSTRUCTOR",
          // Additional display fields (not in DB schema)
          name: "Captain Anna Chen", 
          email: "anna.chen@instructor.com", 
          specialization: "Safety Procedures"
        }
      ]
    };

    // Hardcoded trainees data - matching subject IDs
    const hardcodedTrainees = {
      's1': [
        { id: 1, name: "Alice Johnson", email: "alice.johnson@company.com", eid: "EMP001", department: "Cabin Crew", status: "ENROLLED" },
        { id: 2, name: "Bob Smith", email: "bob.smith@company.com", eid: "EMP002", department: "Cabin Crew", status: "ENROLLED" },
        { id: 3, name: "Carol Davis", email: "carol.davis@company.com", eid: "EMP003", department: "Ground Staff", status: "ENROLLED" }
      ],
      's2': [
        { id: 4, name: "David Wilson", email: "david.wilson@company.com", eid: "EMP004", department: "Cabin Crew", status: "ENROLLED" },
        { id: 5, name: "Emma Brown", email: "emma.brown@company.com", eid: "EMP005", department: "Cabin Crew", status: "ENROLLED" },
        { id: 6, name: "Frank Miller", email: "frank.miller@company.com", eid: "EMP006", department: "Ground Staff", status: "ENROLLED" },
        { id: 7, name: "Grace Lee", email: "grace.lee@company.com", eid: "EMP007", department: "Cabin Crew", status: "ENROLLED" }
      ],
      's3': [
        { id: 8, name: "Henry Taylor", email: "henry.taylor@company.com", eid: "EMP008", department: "Cabin Crew", status: "ENROLLED" },
        { id: 9, name: "Ivy Chen", email: "ivy.chen@company.com", eid: "EMP009", department: "Ground Staff", status: "ENROLLED" }
      ],
      's4': [
        { id: 10, name: "Jack Anderson", email: "jack.anderson@company.com", eid: "EMP010", department: "Cabin Crew", status: "ENROLLED" },
        { id: 11, name: "Kate Martinez", email: "kate.martinez@company.com", eid: "EMP011", department: "Cabin Crew", status: "ENROLLED" },
        { id: 12, name: "Liam Garcia", email: "liam.garcia@company.com", eid: "EMP012", department: "Ground Staff", status: "ENROLLED" }
      ],
      's5': [
        { id: 13, name: "Maya Patel", email: "maya.patel@company.com", eid: "EMP013", department: "Cabin Crew", status: "ENROLLED" },
        { id: 14, name: "Noah Kim", email: "noah.kim@company.com", eid: "EMP014", department: "Cabin Crew", status: "ENROLLED" },
        { id: 15, name: "Olivia White", email: "olivia.white@company.com", eid: "EMP015", department: "Ground Staff", status: "ENROLLED" },
        { id: 16, name: "Paul Rodriguez", email: "paul.rodriguez@company.com", eid: "EMP016", department: "Cabin Crew", status: "ENROLLED" },
        { id: 17, name: "Quinn Thompson", email: "quinn.thompson@company.com", eid: "EMP017", department: "Ground Staff", status: "ENROLLED" }
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
        const traineesData = hardcodedTrainees[subjectId] || [];
        
        console.log('🔍 Found subject data:', subjectData);
        console.log('🔍 Found trainers data:', trainersData);
        console.log('🔍 Found trainees data:', traineesData);
        
        setSubject(subjectData);
        setTrainers(trainersData);
        setTrainees(traineesData);
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
      const referrer = document.referrer;
      const courseIdMatch = referrer.match(/\/course-detail\/([^/?]+)/);
      
      if (courseIdMatch) {
        const courseId = courseIdMatch[1];
        navigate(`/academic/course-detail/${courseId}`);
      } else if (subject?.courseId) {
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
    setShowAddTrainer(true);
  };

  const handleAddTrainer = async (trainerData) => {
    console.log('Adding trainer:', trainerData);
    setIsAddingTrainer(true);
    try {
      // TODO: Implement add trainer API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock trainer data for display (in real app, this would come from API)
      const mockTrainerData = {
        '550e8400-e29b-41d4-a716-446655440100': { name: 'John Smith', email: 'john.smith@instructor.com', specialization: 'Safety Basics' },
        '550e8400-e29b-41d4-a716-446655440101': { name: 'Sarah Johnson', email: 'sarah.johnson@instructor.com', specialization: 'Safety Procedures' },
        '550e8400-e29b-41d4-a716-446655440102': { name: 'Mike Davis', email: 'mike.davis@instructor.com', specialization: 'Evacuation Procedures' },
        '550e8400-e29b-41d4-a716-446655440103': { name: 'Lisa Wilson', email: 'lisa.wilson@instructor.com', specialization: 'Emergency Exits' },
        '550e8400-e29b-41d4-a716-446655440104': { name: 'David Brown', email: 'david.brown@instructor.com', specialization: 'Passenger Safety' },
        '550e8400-e29b-41d4-a716-446655440105': { name: 'Emily Taylor', email: 'emily.taylor@instructor.com', specialization: 'CPR & First Aid' },
        '550e8400-e29b-41d4-a716-446655440106': { name: 'Robert Anderson', email: 'robert.anderson@instructor.com', specialization: 'Fire Prevention' },
        '550e8400-e29b-41d4-a716-446655440107': { name: 'Jennifer Martinez', email: 'jennifer.martinez@instructor.com', specialization: 'Fire Detection' },
        '550e8400-e29b-41d4-a716-446655440108': { name: 'Captain James Wilson', email: 'james.wilson@instructor.com', specialization: 'Emergency Response' },
        '550e8400-e29b-41d4-a716-446655440109': { name: 'Captain Maria Garcia', email: 'maria.garcia@instructor.com', specialization: 'Crisis Management' }
      };

      // Add new trainer to local state
      const trainerInfo = mockTrainerData[trainerData.trainer_user_id] || {};
      const newTrainer = {
        trainer_user_id: trainerData.trainer_user_id,
        subject_id: subjectId, // Current subject ID
        role_in_subject: trainerData.role_in_subject,
        // Additional display fields
        ...trainerInfo
      };
      
      setTrainers(prev => [...prev, newTrainer]);
      
      toast.success('Trainer added successfully!');
    } catch (error) {
      console.error('Error adding trainer:', error);
      toast.error('Failed to add trainer. Please try again.');
    } finally {
      setIsAddingTrainer(false);
    }
  };

  const handleEditTrainer = (trainerUserId) => {
    console.log('Edit Trainer clicked:', trainerUserId);
    const trainer = trainers.find(t => t.trainer_user_id === trainerUserId);
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
        trainer.trainer_user_id === selectedTrainer.trainer_user_id 
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

  const handleDeleteTrainer = (trainerUserId) => {
    console.log('Delete Trainer clicked:', trainerUserId);
    // Show confirmation dialog or implement delete functionality
    if (window.confirm('Are you sure you want to remove this trainer from the subject?')) {
      // TODO: Implement API call to remove trainer
      console.log('Removing trainer:', trainerUserId);
      // For now, just show a success message
      toast.success('Trainer removed successfully!');
    }
  };

  const handleEditTrainee = (traineeId) => {
    console.log('Edit Trainee clicked:', traineeId);
    // TODO: Implement edit trainee functionality
    toast.info('Edit trainee functionality coming soon...');
  };

  const handleDeleteTrainee = (traineeId) => {
    console.log('Delete Trainee clicked:', traineeId);
    // Show confirmation dialog or implement delete functionality
    if (window.confirm('Are you sure you want to remove this trainee from the subject?')) {
      // TODO: Implement API call to remove trainee
      console.log('Removing trainee:', traineeId);
      // For now, just show a success message
      toast.success('Trainee removed successfully!');
    }
  };

  const handleBack = () => {
    // Priority: courseId prop > location state > referrer > subject data
    console.log('🔍 Course ID from prop:', courseId);
    
    if (courseId) {
      console.log('🔍 Navigating to course ID from prop:', courseId);
      navigate(`/academic/course-detail/${courseId}`);
      return;
    }
    
    const courseIdFromState = location.state?.courseId;
    console.log('🔍 Course ID from state:', courseIdFromState);
    
    if (courseIdFromState) {
      console.log('🔍 Navigating to course ID from state:', courseIdFromState);
      navigate(`/academic/course-detail/${courseIdFromState}`);
      return;
    }
    
    // Try to get courseId from URL referrer
    const referrer = document.referrer;
    console.log('🔍 Document referrer:', referrer);
    
    const courseIdMatch = referrer.match(/\/course-detail\/([^/?]+)/);
    console.log('🔍 Course ID match:', courseIdMatch);
    
    if (courseIdMatch) {
      const courseIdFromReferrer = courseIdMatch[1];
      console.log('🔍 Navigating to course ID from referrer:', courseIdFromReferrer);
      navigate(`/academic/course-detail/${courseIdFromReferrer}`);
    } else if (subject?.courseId) {
      console.log('🔍 Using subject courseId:', subject.courseId);
      navigate(`/academic/course-detail/${subject.courseId}`);
    } else {
      console.log('🔍 Using browser history back');
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
    <Container className="py-4 subject-details">
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
                      <div className="fw-semibold">{subject.duration} days</div>
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
              
              {/* Additional Subject Details */}
              <Row className="mt-3">
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div>
                      <small className="text-muted">Method</small>
                      <div className="fw-semibold">{subject.method}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div>
                      <small className="text-muted">Type</small>
                      <div className="fw-semibold">{subject.type}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div>
                      <small className="text-muted">Pass Score</small>
                      <div className="fw-semibold">{subject.pass_score}%</div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div>
                      <small className="text-muted">Room</small>
                      <div className="fw-semibold">{subject.room_name}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div>
                      <small className="text-muted">Time Slot</small>
                      <div className="fw-semibold">{subject.time_slot}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div>
                      <small className="text-muted">Start Date</small>
                      <div className="fw-semibold">{new Date(subject.start_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {subject.remark_note && (
                <Row className="mt-3">
                  <Col>
                    <div>
                      <small className="text-muted">Remark Note</small>
                      <div className="fw-semibold">{subject.remark_note}</div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trainers Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <Card.Header 
              className="bg-white border-bottom py-4 pb-3 collapsible-header"
              onClick={() => setIsTrainersCollapsed(!isTrainersCollapsed)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <PersonCheckFill className="me-2" />
                  Trainers ({trainers.length})
                </h5>
                <div className="d-flex align-items-center gap-2">
                <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.ADD_INSTRUCTOR}>
                    <Button variant="primary" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTrainer();
                    }}>
                    <Plus size={16} className="me-1" />
                    Add Trainer
                  </Button>
                </PermissionWrapper>
                  <ChevronDown 
                    size={20} 
                    className={`text-muted chevron-icon ${isTrainersCollapsed ? 'rotated' : ''}`}
                  />
                </div>
              </div>
            </Card.Header>
            <Card.Body className={`p-0 collapsible-content ${isTrainersCollapsed ? 'collapsed' : 'expanded'}`}>
              {trainers.length > 0 ? (
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3 py-3">Trainer Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Specialization</th>
                      <th className="px-3 py-3">Role in Subject</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((trainer) => (
                      <tr key={trainer.trainer_user_id}>
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
                          <Badge 
                            bg={
                              trainer.role_in_subject === 'LEAD_INSTRUCTOR' ? 'primary' :
                              trainer.role_in_subject === 'ASSISTANT_INSTRUCTOR' ? 'warning' :
                              trainer.role_in_subject === 'SUPPORT_INSTRUCTOR' ? 'secondary' : 'info'
                            }
                          >
                            {trainer.role_in_subject === 'LEAD_INSTRUCTOR' ? 'Lead Instructor' :
                             trainer.role_in_subject === 'ASSISTANT_INSTRUCTOR' ? 'Assistant Instructor' :
                             trainer.role_in_subject === 'SUPPORT_INSTRUCTOR' ? 'Support Instructor' : trainer.role_in_subject}
                          </Badge>
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

      {/* Trainees Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header 
              className="bg-white border-bottom py-4 pb-3 collapsible-header"
              onClick={() => setIsTraineesCollapsed(!isTraineesCollapsed)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <People className="me-2" />
                  Trainees ({trainees.length})
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.ADD_TRAINEE}>
                    <Button variant="primary" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement add trainee functionality
                      toast.info('Add trainee functionality coming soon...');
                    }}>
                      <Plus size={16} className="me-1" />
                      Add Trainee
                    </Button>
                  </PermissionWrapper>
                  <ChevronDown 
                    size={20} 
                    className={`text-muted chevron-icon ${isTraineesCollapsed ? 'rotated' : ''}`}
                  />
                </div>
              </div>
            </Card.Header>
            <Card.Body className={`p-0 collapsible-content ${isTraineesCollapsed ? 'collapsed' : 'expanded'}`}>
              {trainees.length > 0 ? (
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3 py-3">Trainee Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">EID</th>
                      <th className="px-3 py-3">Department</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTrainees.map((trainee) => (
                      <tr key={trainee.id}>
                        <td className="px-3 py-3">
                          <div className="d-flex align-items-center">
                            <People size={16} className="me-2 text-primary" />
                            <div className="fw-semibold">{trainee.name}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3">{trainee.email}</td>
                        <td className="px-3 py-3">
                          <Badge bg="secondary">{trainee.eid}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge bg="info">{trainee.department}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge bg="success">{trainee.status}</Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <TraineeActions 
                            trainee={trainee}
                            onEdit={handleEditTrainee}
                            onDelete={handleDeleteTrainee}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <People size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No trainees found</h5>
                  <p className="text-muted">This subject doesn't have any trainees enrolled yet.</p>
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.ADD_TRAINEE}>
                    <Button variant="primary" onClick={() => {
                      // TODO: Implement add trainee functionality
                      toast.info('Add trainee functionality coming soon...');
                    }}>
                      <Plus size={16} className="me-1" />
                      Add First Trainee
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
      
      <AddTrainerModal
        show={showAddTrainer}
        onClose={() => setShowAddTrainer(false)}
        onSave={handleAddTrainer}
        loading={isAddingTrainer}
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
