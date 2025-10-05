import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { 
  FileTextFill, 
  Plus, 
  Pencil, 
  Trash, 
  People,
  Clock,
  PersonCheckFill,
  Calendar
} from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import { useAuth } from '../../hooks/useAuth';

const SubjectDetailsView = ({ subjectId }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded subject data
  const hardcodedSubjects = {
    1: {
      id: 1,
      name: "Safety Procedures",
      code: "SAF001",
      description: "Comprehensive training on aircraft safety procedures, emergency protocols, and passenger safety measures.",
      duration: "2 weeks",
      status: "ACTIVE",
      totalTrainers: 2,
      courseId: 1,
      courseName: "Cabin Crew Training"
    },
    2: {
      id: 2,
      name: "Emergency Response",
      code: "EMR001",
      description: "Training on emergency response procedures, evacuation protocols, and crisis management.",
      duration: "3 weeks",
      status: "ACTIVE",
      totalTrainers: 3,
      courseId: 1,
      courseName: "Cabin Crew Training"
    },
    3: {
      id: 3,
      name: "First Aid",
      code: "FAD001",
      description: "Basic first aid training for cabin crew members including CPR and medical emergency response.",
      duration: "1 week",
      status: "ACTIVE",
      totalTrainers: 1,
      courseId: 1,
      courseName: "Cabin Crew Training"
    },
    4: {
      id: 4,
      name: "Customer Service",
      code: "CSV001",
      description: "Customer service excellence training for cabin crew including communication skills and conflict resolution.",
      duration: "2 weeks",
      status: "ACTIVE",
      totalTrainers: 2,
      courseId: 1,
      courseName: "Cabin Crew Training"
    },
    5: {
      id: 5,
      name: "Simulator Training",
      code: "SIM001",
      description: "Advanced simulator training for flight crew including various flight scenarios and emergency procedures.",
      duration: "4 weeks",
      status: "ACTIVE",
      totalTrainers: 4,
      courseId: 2,
      courseName: "Flight Crew Training"
    },
    6: {
      id: 6,
      name: "Type Rating",
      code: "TR001",
      description: "Aircraft type rating certification training for specific aircraft models.",
      duration: "6 weeks",
      status: "ACTIVE",
      totalTrainers: 5,
      courseId: 2,
      courseName: "Flight Crew Training"
    },
    7: {
      id: 7,
      name: "Recurrent Training",
      code: "RT001",
      description: "Recurrent training to maintain and update flight crew certifications and skills.",
      duration: "2 weeks",
      status: "ACTIVE",
      totalTrainers: 3,
      courseId: 2,
      courseName: "Flight Crew Training"
    }
  };

  // Hardcoded trainers data
  const hardcodedTrainers = {
    1: [
      { id: 1, name: "John Smith", email: "john.smith@instructor.com", specialization: "Safety Procedures", status: "ACTIVE" },
      { id: 2, name: "Sarah Johnson", email: "sarah.johnson@instructor.com", specialization: "Emergency Response", status: "ACTIVE" }
    ],
    2: [
      { id: 3, name: "Mike Davis", email: "mike.davis@instructor.com", specialization: "Emergency Response", status: "ACTIVE" },
      { id: 4, name: "Lisa Wilson", email: "lisa.wilson@instructor.com", specialization: "Crisis Management", status: "ACTIVE" },
      { id: 5, name: "David Brown", email: "david.brown@instructor.com", specialization: "Evacuation Procedures", status: "ACTIVE" }
    ],
    3: [
      { id: 6, name: "Emily Taylor", email: "emily.taylor@instructor.com", specialization: "First Aid", status: "ACTIVE" }
    ],
    4: [
      { id: 7, name: "Robert Anderson", email: "robert.anderson@instructor.com", specialization: "Customer Service", status: "ACTIVE" },
      { id: 8, name: "Jennifer Martinez", email: "jennifer.martinez@instructor.com", specialization: "Communication Skills", status: "ACTIVE" }
    ],
    5: [
      { id: 9, name: "Captain James Wilson", email: "james.wilson@instructor.com", specialization: "Simulator Training", status: "ACTIVE" },
      { id: 10, name: "Captain Maria Garcia", email: "maria.garcia@instructor.com", specialization: "Flight Procedures", status: "ACTIVE" },
      { id: 11, name: "Captain Tom Lee", email: "tom.lee@instructor.com", specialization: "Emergency Scenarios", status: "ACTIVE" },
      { id: 12, name: "Captain Anna Chen", email: "anna.chen@instructor.com", specialization: "Navigation", status: "ACTIVE" }
    ],
    6: [
      { id: 13, name: "Captain Peter Johnson", email: "peter.johnson@instructor.com", specialization: "Boeing 737", status: "ACTIVE" },
      { id: 14, name: "Captain Susan Davis", email: "susan.davis@instructor.com", specialization: "Airbus A320", status: "ACTIVE" },
      { id: 15, name: "Captain Mark Thompson", email: "mark.thompson@instructor.com", specialization: "Boeing 777", status: "ACTIVE" },
      { id: 16, name: "Captain Lisa Rodriguez", email: "lisa.rodriguez@instructor.com", specialization: "Airbus A350", status: "ACTIVE" },
      { id: 17, name: "Captain Kevin Kim", email: "kevin.kim@instructor.com", specialization: "Boeing 787", status: "ACTIVE" }
    ],
    7: [
      { id: 18, name: "Captain Alex Turner", email: "alex.turner@instructor.com", specialization: "Recurrent Training", status: "ACTIVE" },
      { id: 19, name: "Captain Rachel Green", email: "rachel.green@instructor.com", specialization: "Certification Updates", status: "ACTIVE" },
      { id: 20, name: "Captain Daniel White", email: "daniel.white@instructor.com", specialization: "Skill Assessment", status: "ACTIVE" }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const loadSubjectData = () => {
      setLoading(true);
      setTimeout(() => {
        const subjectData = hardcodedSubjects[subjectId];
        const trainersData = hardcodedTrainers[subjectId] || [];
        
        setSubject(subjectData);
        setTrainers(trainersData);
        setLoading(false);
      }, 500);
    };

    if (subjectId) {
      loadSubjectData();
    }
  }, [subjectId]);

  const handleCreateSubject = () => {
    console.log('Create Subject clicked');
    // TODO: Implement create subject functionality
  };

  const handleEditSubject = () => {
    console.log('Edit Subject clicked');
    // TODO: Implement edit subject functionality
  };

  const handleDeleteSubject = () => {
    console.log('Delete Subject clicked');
    // TODO: Implement delete subject functionality
  };

  const handleCreateTrainer = () => {
    console.log('Create Trainer clicked');
    // TODO: Implement create trainer functionality
  };

  const handleEditTrainer = (trainerId) => {
    console.log('Edit Trainer clicked:', trainerId);
    // TODO: Implement edit trainer functionality
  };

  const handleDeleteTrainer = (trainerId) => {
    console.log('Delete Trainer clicked:', trainerId);
    // TODO: Implement delete trainer functionality
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
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.CREATE}>
                    <Button variant="outline-primary" size="sm" onClick={handleCreateSubject}>
                      <Plus size={16} className="me-1" />
                      Create Subject
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.UPDATE}>
                    <Button variant="outline-secondary" size="sm" onClick={handleEditSubject}>
                      <Pencil size={16} className="me-1" />
                      Edit Subject
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.DELETE}>
                    <Button variant="outline-danger" size="sm" onClick={handleDeleteSubject}>
                      <Trash size={16} className="me-1" />
                      Delete Subject
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
            <Card.Header className="bg-white border-bottom">
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
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Trainer Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.map((trainer) => (
                      <tr key={trainer.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <PersonCheckFill size={16} className="me-2 text-primary" />
                            <div className="fw-semibold">{trainer.name}</div>
                          </div>
                        </td>
                        <td>{trainer.email}</td>
                        <td>
                          <Badge bg="info">{trainer.specialization}</Badge>
                        </td>
                        <td>
                          <Badge bg="success">{trainer.status}</Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.UPDATE}>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => handleEditTrainer(trainer.id)}
                              >
                                <Pencil size={14} />
                              </Button>
                            </PermissionWrapper>
                            <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.REMOVE_INSTRUCTOR}>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteTrainer(trainer.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </PermissionWrapper>
                          </div>
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
    </Container>
  );
};

export default SubjectDetailsView;
