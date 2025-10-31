import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import { CalendarEvent, ClipboardCheck } from 'react-bootstrap-icons';
import UpcomingAssessmentsList from '../../components/Trainer/UpcomingAssessmentsList';
import SectionCompletionList from '../../components/Trainer/SectionCompletionList';

const UpcomingAssessmentsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming-assessments');

  const tabs = [
    {
      id: 'upcoming-assessments',
      title: 'Upcoming Assessments',
      icon: CalendarEvent,
      component: <UpcomingAssessmentsList />
    },
    {
      id: 'section-completion',
      title: 'Section Required Completion',
      icon: ClipboardCheck,
      component: <SectionCompletionList />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <Container fluid className="py-4">

      {/* Custom Tabs */}
      <Row className="mb-4">
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

export default UpcomingAssessmentsPage;

