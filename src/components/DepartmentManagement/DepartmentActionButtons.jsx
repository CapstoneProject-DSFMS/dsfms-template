import React from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { Pencil, PersonPlus } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const DepartmentActionButtons = ({ activeTab, onEditDetails, onAddTrainers }) => {
  return (
    <Row className="mb-4">
      <Col>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row gap-3">
              <PermissionWrapper 
                permission={PERMISSION_IDS.UPDATE_DEPARTMENT}
                fallback={null}
              >
                <Button
                  variant={activeTab === 'edit' ? 'primary' : 'outline-primary'}
                  size="lg"
                  className="flex-fill d-flex align-items-center justify-content-center py-3"
                  onClick={onEditDetails}
                >
                  <Pencil className="me-2" size={20} />
                  Edit Department Details
                </Button>
              </PermissionWrapper>
              
              <PermissionWrapper 
                permission={PERMISSION_IDS.ASSIGN_COURSE_TRAINER}
                fallback={null}
              >
                <Button
                  variant={activeTab === 'trainers' ? 'primary' : 'outline-primary'}
                  size="lg"
                  className="flex-fill d-flex align-items-center justify-content-center py-3"
                  onClick={onAddTrainers}
                >
                  <PersonPlus className="me-2" size={20} />
                  Add Trainers to Department
                </Button>
              </PermissionWrapper>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DepartmentActionButtons;
