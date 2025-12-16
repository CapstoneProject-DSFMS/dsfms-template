import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { CalendarEvent } from 'react-bootstrap-icons';
import UpcomingAssessmentsList from '../../components/Trainer/UpcomingAssessmentsList';

const UpcomingAssessmentsPage = () => {
  const tabs = [
    {
      id: 'upcoming-assessments',
      title: 'Upcoming Assessment Events',
      icon: CalendarEvent,
      component: <UpcomingAssessmentsList />
    }
  ];

  const activeTabData = tabs[0];

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="border-0">
            <Card.Header className="bg-primary text-white p-3">
              <div className="d-flex align-items-center">
                <CalendarEvent size={20} className="me-2" />
                <h5 className="mb-0">Upcoming Assessment Events</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {activeTabData && activeTabData.component}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpcomingAssessmentsPage;

