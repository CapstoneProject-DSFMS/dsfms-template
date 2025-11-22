import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Building, Upload, ArrowRight } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../../components/Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { ROUTES } from '../../constants/routes';
import '../../styles/academic-department.css';

const MainMenuPage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'add-template',
      title: 'Add New Template',
      description: 'Create a new form template',
      icon: PlusCircle,
      path: `${ROUTES.TEMPLATES}?action=create`,
      permission: PERMISSION_IDS.CREATE_TEMPLATE,
      color: 'primary',
      action: () => {
        navigate(`${ROUTES.TEMPLATES}?action=create`);
      }
    },
    {
      id: 'add-department',
      title: 'Add New Department',
      description: 'Create a new department',
      icon: Building,
      path: ROUTES.DEPARTMENTS,
      permission: PERMISSION_IDS.CREATE_DEPARTMENT,
      color: 'primary',
      action: () => {
        navigate(ROUTES.DEPARTMENTS);
      }
    },
    {
      id: 'bulk-import-user',
      title: 'Bulk Import User',
      description: 'Import multiple users from Excel file',
      icon: Upload,
      path: `${ROUTES.USERS}?action=bulk-import`,
      permission: PERMISSION_IDS.BULK_CREATE_USERS,
      color: 'primary',
      action: () => {
        navigate(`${ROUTES.USERS}?action=bulk-import`);
      }
    }
  ];

  return (
    <div className="academic-dashboard-page" style={{ paddingBottom: '2rem' }}>
      <Container className="py-4">
        {/* Quick Actions */}
        <Row className="mb-4">
          <Col lg={12} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="academic-dashboard-section-header bg-primary text-white border-0">
                <h5 className="mb-0 text-white">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <PermissionWrapper
                        key={action.id}
                        permission={action.permission}
                        fallback={null}
                      >
                        <Col md={4} key={index} className="mb-3">
                          <div 
                            className="p-3 border rounded cursor-pointer h-100 d-flex flex-column"
                            style={{ cursor: 'pointer' }}
                            onClick={action.action}
                          >
                            <div className="d-flex align-items-center mb-2">
                              <IconComponent size={24} className={`text-${action.color} me-2`} />
                              <h6 className="mb-0">{action.title}</h6>
                            </div>
                            <p className="text-muted small mb-2 flex-grow-1">{action.description}</p>
                            <ArrowRight size={16} className={`text-${action.color} ms-auto`} />
                          </div>
                        </Col>
                      </PermissionWrapper>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainMenuPage;

