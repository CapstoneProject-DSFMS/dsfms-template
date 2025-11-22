import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Person, ArrowLeft } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import TraineeListInSubject from '../../components/DepartmentHead/SubjectDetail/TraineeListInSubject';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

const SubjectDetailsPage = () => {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trainees');
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock subject data
        const mockSubject = {
          id: subjectId,
          title: 'Safety Procedures - Module 1',
          code: 'SP-101',
          description: 'Introduction to aviation safety procedures and protocols. This module covers essential safety protocols, emergency procedures, and compliance requirements for aviation operations.',
          duration: 2,
          status: 'active',
          instructor: 'Dr. Smith',
          course: 'Aviation Safety Management',
          courseCode: 'ASM-101',
          startDate: '2024-01-15',
          endDate: '2024-03-15',
          completionDate: '2024-01-20',
          progress: 100,
          totalTrainees: 25,
          completedTrainees: 20,
          inProgressTrainees: 3,
          pendingTrainees: 2,
          averageScore: 87,
          materials: [
            { name: 'Safety Manual v2.1', type: 'PDF', size: '2.3 MB' },
            { name: 'Video Tutorial', type: 'MP4', size: '45 MB' },
            { name: 'Assessment Quiz', type: 'Quiz', size: 'N/A' }
          ],
          assessments: [
            { name: 'Safety Procedures Quiz', type: 'Quiz', maxScore: 100, averageScore: 87 },
            { name: 'Practical Assessment', type: 'Practical', maxScore: 100, averageScore: 89 }
          ]
        };
        
        setSubject(mockSubject);
      } catch (err) {
        setError('Failed to load subject details');
        console.error('Error fetching subject:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  const tabs = [
    {
      id: 'trainees',
      title: 'Trainee List',
      icon: Person,
      component: <TraineeListInSubject subjectId={subjectId} courseId={courseId} />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading subject details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!subject) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Subject Not Found</Alert.Heading>
          <p>The requested subject could not be found.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Back Button */}
      <Row className="mb-3">
        <Col>
          <button 
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => navigate(`${ROUTES.DEPARTMENT_MY_DETAILS}/${courseId}`)}
            style={{ color: 'var(--bs-primary)' }}
          >
            <ArrowLeft size={20} className="me-2" />
            Back to Course Details
          </button>
        </Col>
      </Row>

      {/* Tabs - Trainee List */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white p-0">
              <div className="custom-tabs-container">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      className={`custom-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent size={16} className="me-2" />
                      {tab.title}
                    </button>
                  );
                })}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {activeTabData && activeTabData.component}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubjectDetailsPage;




