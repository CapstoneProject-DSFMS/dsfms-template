import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Nav, Tab } from 'react-bootstrap';
import { ListUl, Plus, Collection } from 'react-bootstrap-icons';
import { useSearchParams } from 'react-router-dom';
import AssessmentEventTable from '../../components/AcademicDepartment/AssessmentEventTable';
import AssessmentEventDetailModal from '../../components/AcademicDepartment/AssessmentEventDetailModal';
import EditAssessmentEventModal from '../../components/AcademicDepartment/EditAssessmentEventModal';
import CreateAssessmentEventForm from '../../components/AcademicDepartment/CreateAssessmentEventForm';
import CreateBulkAssessmentEventForm from '../../components/AcademicDepartment/CreateBulkAssessmentEventForm';
import { assessmentAPI } from '../../api';

const AssessmentEventPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [assessmentEvents, setAssessmentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'list');

  const loadAssessmentEvents = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAssessmentEvents();
      const events = response?.data?.events || [];
      
      const mappedEvents = events.map((event, index) => {
        let subjectName = '';
        let courseName = '';
        
        if (event.subjectId === null) {
          if (event.entityInfo && event.entityInfo.type === 'course') {
            courseName = event.entityInfo.name || '';
            subjectName = '';
          }
        } else {
          if (event.entityInfo && event.entityInfo.type === 'subject') {
            subjectName = event.entityInfo.name || '';
          }
          courseName = '';
        }
        
        return {
          id: event.id || `event-${index}`,
          name: event.name || 'N/A',
          subject: subjectName,
          course: courseName,
          occurrenceDate: event.occuranceDate || event.occurrenceDate,
          status: event.status || 'N/A',
          originalEvent: event
        };
      });
      
      setAssessmentEvents(mappedEvents);
    } catch (error) {
      console.error('Error loading assessment events:', error);
      setAssessmentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentEvents();
  }, []);

  useEffect(() => {
    // Update activeTab when URL query param changes
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['list', 'create', 'create-bulk'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    // Update URL query param
    if (tab === 'list') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const handleView = (event) => {
    // Use originalEvent if available, otherwise use the event itself
    const eventData = event.originalEvent || event;
    setSelectedEvent(eventData);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  const handleUpdate = (event) => {
    // Use originalEvent if available, otherwise use the event itself
    const eventData = event.originalEvent || event;
    setSelectedEvent(eventData);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleUpdateSuccess = () => {
    loadAssessmentEvents();
  };

  const handleCreateSuccess = () => {
    loadAssessmentEvents();
    setActiveTab('list'); // Switch to list tab after successful creation
    setSearchParams({}); // Clear query params
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
              <Card.Body className="p-0" style={{ overflow: 'visible', minHeight: '800px' }}>
                <Card.Header className="border-bottom py-2 bg-primary">
                  <Nav variant="tabs" className="border-0">
                    <Nav.Item>
                      <Nav.Link 
                        eventKey="list"
                        className="d-flex align-items-center"
                        style={{ 
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#ffffff',
                          fontWeight: activeTab === 'list' ? '600' : '400',
                          opacity: activeTab === 'list' ? '1' : '0.7',
                          borderRadius: '4px 4px 0 0'
                        }}
                      >
                        <ListUl className="me-2" size={16} />
                        Assessment Events
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        eventKey="create"
                        className="d-flex align-items-center"
                        style={{ 
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#ffffff',
                          fontWeight: activeTab === 'create' ? '600' : '400',
                          opacity: activeTab === 'create' ? '1' : '0.7',
                          borderRadius: '4px 4px 0 0'
                        }}
                      >
                        <Plus className="me-2" size={16} />
                        Create New Assessment Event
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        eventKey="create-bulk"
                        className="d-flex align-items-center"
                        style={{ 
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#ffffff',
                          fontWeight: activeTab === 'create-bulk' ? '600' : '400',
                          opacity: activeTab === 'create-bulk' ? '1' : '0.7',
                          borderRadius: '4px 4px 0 0'
                        }}
                      >
                        <Collection className="me-2" size={16} />
                        Create Bulk Assessment Event
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>

                <Tab.Content>
                  <Tab.Pane eventKey="list" className="p-4">
                    <AssessmentEventTable
                      assessmentEvents={assessmentEvents}
                      loading={loading}
                      onView={handleView}
                      onUpdate={handleUpdate}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="create" className="p-4" style={{ overflow: 'visible', minHeight: '800px' }}>
                    <CreateAssessmentEventForm onSuccess={handleCreateSuccess} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="create-bulk" className="p-4" style={{ overflow: 'visible', minHeight: '800px' }}>
                    <CreateBulkAssessmentEventForm onSuccess={handleCreateSuccess} />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Tab.Container>
          </Card>
        </Col>
      </Row>

      {/* Assessment Event Detail Modal */}
      <AssessmentEventDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        event={selectedEvent}
      />

      {/* Edit Assessment Event Modal */}
      <EditAssessmentEventModal
        show={showEditModal}
        onClose={handleCloseEditModal}
        onSave={handleUpdateSuccess}
        event={selectedEvent}
        loading={loading}
      />
    </Container>
  );
};

export default AssessmentEventPage;
