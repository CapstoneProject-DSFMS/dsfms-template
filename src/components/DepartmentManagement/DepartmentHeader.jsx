import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

const DepartmentHeader = ({ department, onBack }) => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex align-items-start mb-3">
          <Button 
            variant="outline-secondary" 
            onClick={onBack}
            className="me-3 mt-1"
            size="sm"
          >
            <ArrowLeft />
          </Button>
          <div>
            <h2 className="mb-1">{department.name}</h2>
            <p className="text-muted mb-0">
              {department.description}
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default DepartmentHeader;
