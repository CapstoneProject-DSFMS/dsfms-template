import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Person,
  Book,
  Calendar,
  FileText,
  Star
} from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSkeleton } from '../../components/Common';

const AssessmentResultDetailsPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchResultDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockResult = {
          id: resultId,
          title: "Advanced React Assessment",
          course: "React Development Course",
          trainee: "John Doe",
          score: 85,
          maxScore: 100,
          grade: "B+",
          status: "completed",
          completedDate: "2024-01-15",
          duration: "45 minutes",
          attempts: 1,
          sections: [
            {
              id: 1,
              name: "React Fundamentals",
              score: 20,
              maxScore: 25,
              status: "completed",
              timeSpent: "15 minutes"
            },
            {
              id: 2,
              name: "Component Lifecycle",
              score: 18,
              maxScore: 20,
              status: "completed",
              timeSpent: "12 minutes"
            },
            {
              id: 3,
              name: "State Management",
              score: 22,
              maxScore: 25,
              status: "completed",
              timeSpent: "10 minutes"
            },
            {
              id: 4,
              name: "Advanced Patterns",
              score: 25,
              maxScore: 30,
              status: "completed",
              timeSpent: "8 minutes"
            }
          ],
          approvalStatus: "pending",
          approvalNotes: "Waiting for final review from lead trainer."
        };
        
        setResult(mockResult);
      } catch (err) {
        setError('Failed to fetch assessment details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResultDetails();
  }, [resultId]);

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getGradeColor = (grade) => {
    if (grade.includes('A')) return 'success';
    if (grade.includes('B')) return 'info';
    if (grade.includes('C')) return 'warning';
    return 'danger';
  };

  const getStatusBadge = (status) => {
    const variants = {
      'completed': { bg: 'success', text: 'Completed' },
      'in_progress': { bg: 'warning', text: 'In Progress' },
      'pending': { bg: 'secondary', text: 'Pending' },
      'failed': { bg: 'danger', text: 'Failed' }
    };
    
    const config = variants[status] || variants['pending'];
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getApprovalStatusBadge = (status) => {
    const variants = {
      'approved': { bg: 'success', text: 'Approved' },
      'pending': { bg: 'warning', text: 'Pending Approval' },
      'rejected': { bg: 'danger', text: 'Rejected' }
    };
    
    const config = variants[status] || variants['pending'];
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const handleDownloadReport = () => {
    console.log('Downloading report for result:', resultId);
    // Implement download logic
  };

  const handleViewApprovalNotes = () => {
    navigate(`/trainer/approval-notes/${resultId}`);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <LoadingSkeleton height={400} />
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Alert variant="info">Assessment result not found</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const tabs = [
    {
      id: 'overview',
      title: 'Assessment Overview',
      icon: FileText,
      component: (
        <div className="p-4">
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Assessment Title</h6>
                <h5 className="mb-0">{result.title}</h5>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Course</h6>
                <div className="d-flex align-items-center">
                  <Book size={16} className="me-2 text-muted" />
                  <span>{result.course}</span>
                </div>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Trainee</h6>
                <div className="d-flex align-items-center">
                  <Person size={16} className="me-2 text-muted" />
                  <span>{result.trainee}</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Score</h6>
                <div className="d-flex align-items-center">
                  <span className={`h4 mb-0 text-${getScoreColor(result.score, result.maxScore)}`}>
                    {result.score}/{result.maxScore}
                  </span>
                  <Badge 
                    bg={getGradeColor(result.grade)}
                    className="ms-2 fs-6"
                  >
                    {result.grade}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Status</h6>
                {getStatusBadge(result.status)}
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Completed Date</h6>
                <div className="d-flex align-items-center">
                  <Calendar size={16} className="me-2 text-muted" />
                  <span>{result.completedDate}</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )
    },
    {
      id: 'sections',
      title: 'Section Breakdown',
      icon: Star,
      component: (
        <div className="scrollable-table-container admin-table">
          <Table hover className="mb-0 table-mobile-responsive sticky-header border-neutral-200 align-middle" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th className="border-neutral-200 text-primary-custom fw-semibold">Section</th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">Score</th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">Status</th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {result.sections.map((section) => (
                <tr key={section.id}>
                  <td className="fw-bold">{section.name}</td>
                  <td>
                    <span className={`fw-bold text-${getScoreColor(section.score, section.maxScore)}`}>
                      {section.score}/{section.maxScore}
                    </span>
                  </td>
                  <td>{getStatusBadge(section.status)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Clock size={14} className="me-1 text-muted" />
                      <span>{section.timeSpent}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/trainer/assessment-results')}
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Results
            </Button>
            
            {/* Actions */}
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleDownloadReport}>
                <Download size={16} className="me-2" />
                Download Report
              </Button>
              <Button variant="outline-secondary" onClick={handleViewApprovalNotes}>
                <Eye size={16} className="me-2" />
                View Approval Notes
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs */}
      <Row>
        <Col>
          <Card className="border-0">
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

export default AssessmentResultDetailsPage;