import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Pen, CheckCircle, ClipboardCheck } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const AllAssessmentsPage = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center">
            <ClipboardCheck size={64} className="text-muted mb-3" />
            <h4 className="mb-3">All Assessments</h4>
            <p className="text-muted mb-4">
              This page provides an overview of all assessment-related activities. 
              Use the navigation menu to access specific assessment types.
            </p>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <Pen size={32} className="text-primary mb-2" />
                    <h6 className="card-title">Signature Required</h6>
                    <p className="card-text text-muted small">
                      Documents that require your signature
                    </p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate('/trainee/signature-required')}
                    >
                      View Documents
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <CheckCircle size={32} className="text-success mb-2" />
                    <h6 className="card-title">Section Completion</h6>
                    <p className="card-text text-muted small">
                      Training sections that need completion
                    </p>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => navigate('/trainee/completion-required')}
                    >
                      View Sections
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <ClipboardCheck size={32} className="text-info mb-2" />
                    <h6 className="card-title">Your Assessments</h6>
                    <p className="card-text text-muted small">
                      Upcoming and completed assessments
                    </p>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => navigate('/trainee/your-assessments')}
                    >
                      View Assessments
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AllAssessmentsPage;
