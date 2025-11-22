import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  Person,
  Book,
  Calendar,
  FileText,
  Save,
  PencilSquare
} from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { LoadingSkeleton } from '../../components/Common';

const ResultApprovalNotePage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'pending',
    notes: '',
    approvedBy: '',
    approvedDate: ''
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchResultData = async () => {
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
          approvalStatus: "pending",
          approvalNotes: "",
          trainerNotes: "Student shows solid foundation but should focus more on advanced state management techniques.",
          previousApprovals: [
            {
              id: 1,
              status: "approved",
              notes: "Good performance overall",
              approvedBy: "Dr. Smith",
              approvedDate: "2024-01-10",
              type: "initial"
            }
          ]
        };
        
        setResult(mockResult);
        setApprovalData({
          status: mockResult.approvalStatus,
          notes: mockResult.approvalNotes,
          approvedBy: '',
          approvedDate: ''
        });
      } catch (err) {
        setError('Failed to load assessment result data');
        console.error('Error fetching result data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
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

  const getApprovalStatusBadge = (status) => {
    const variants = {
      'approved': { bg: 'success', text: 'Approved' },
      'pending': { bg: 'warning', text: 'Pending Approval' },
      'rejected': { bg: 'danger', text: 'Rejected' }
    };
    
    const config = variants[status] || variants['pending'];
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const handleApprovalChange = (field, value) => {
    setApprovalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveApproval = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      setResult(prev => ({
        ...prev,
        approvalStatus: approvalData.status,
        approvalNotes: approvalData.notes
      }));
      
      setShowApprovalModal(false);
      // Show success message
      console.log('Approval saved successfully');
    } catch (err) {
      console.error('Error saving approval:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = () => {
    setApprovalData(prev => ({
      ...prev,
      status: 'approved',
      approvedBy: 'Current Trainer',
      approvedDate: new Date().toISOString().split('T')[0]
    }));
    setShowApprovalModal(true);
  };

  const handleReject = () => {
    setApprovalData(prev => ({
      ...prev,
      status: 'rejected',
      approvedBy: 'Current Trainer',
      approvedDate: new Date().toISOString().split('T')[0]
    }));
    setShowApprovalModal(true);
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

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(`/trainer/assessment-details/${resultId}`)} // Keep old route for now (trainer-specific)
              className="me-3"
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Details
            </Button>
            <div>
              <h2 className="mb-1">Result Approval Note</h2>
              <p className="text-muted mb-0">Review and approve assessment results</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Main Content */}
        <Col lg={8}>
          {/* Assessment Summary */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FileText size={20} className="me-2" />
                Assessment Summary
              </h5>
            </Card.Header>
            <Card.Body>
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
                    <h6 className="text-muted mb-1">Current Status</h6>
                    {getApprovalStatusBadge(result.approvalStatus)}
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
            </Card.Body>
          </Card>

          {/* Trainer Notes */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <PencilSquare size={20} className="me-2" />
                Trainer Notes
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{result.trainerNotes}</p>
            </Card.Body>
          </Card>

          {/* Approval History */}
          {result.previousApprovals && result.previousApprovals.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <Clock size={20} className="me-2" />
                  Approval History
                </h5>
              </Card.Header>
              <Card.Body>
                {result.previousApprovals.map((approval) => (
                  <div key={approval.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} Approval</h6>
                        <small className="text-muted">
                          Approved by {approval.approvedBy} on {approval.approvedDate}
                        </small>
                      </div>
                      {getApprovalStatusBadge(approval.status)}
                    </div>
                    {approval.notes && (
                      <p className="mb-0 text-muted">{approval.notes}</p>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Current Approval Status */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Current Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  {getApprovalStatusBadge(result.approvalStatus)}
                </div>
                {result.approvalNotes && (
                  <div>
                    <h6 className="text-muted mb-2">Current Notes</h6>
                    <p className="small text-muted">{result.approvalNotes}</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Approval Actions */}
          <Card>
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Approval Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  onClick={handleApprove}
                  className="d-flex align-items-center justify-content-center"
                >
                  <CheckCircle size={16} className="me-2" />
                  Approve Result
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  className="d-flex align-items-center justify-content-center"
                >
                  <XCircle size={16} className="me-2" />
                  Reject Result
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Approval Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {approvalData.status === 'approved' ? 'Approve Assessment Result' : 'Reject Assessment Result'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Approval Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={approvalData.notes}
                onChange={(e) => handleApprovalChange('notes', e.target.value)}
                placeholder="Enter your approval notes..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Approved By</Form.Label>
              <Form.Control
                type="text"
                value={approvalData.approvedBy}
                onChange={(e) => handleApprovalChange('approvedBy', e.target.value)}
                placeholder="Enter your name"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Approval Date</Form.Label>
              <Form.Control
                type="date"
                value={approvalData.approvedDate}
                onChange={(e) => handleApprovalChange('approvedDate', e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </Button>
          <Button
            variant={approvalData.status === 'approved' ? 'success' : 'danger'}
            onClick={handleSaveApproval}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                {approvalData.status === 'approved' ? 'Approve' : 'Reject'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ResultApprovalNotePage;
