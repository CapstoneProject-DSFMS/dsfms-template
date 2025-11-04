import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Calendar, People, Book } from 'react-bootstrap-icons';

const DepartmentInfo = ({ department }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
    <div className="department-info">
      <h4 className="mb-4">Department Overview</h4>
      
      <Row className="g-4">
        <Col md={6}>
          <div className="info-card info-card-basic">
            <div className="info-header">
              <Book className="info-icon" />
              <h6>Basic Information</h6>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{department.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Code:</span>
                <span className="info-value">{department.code || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Description:</span>
                <span className="info-value">{department.description || 'No description provided'}</span>
              </div>
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="info-card info-card-statistics">
            <div className="info-header">
              <People className="info-icon" />
              <h6>Department Statistics</h6>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Total Courses:</span>
                <span className="info-value">
                  {department.courseCount || 0}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Trainees:</span>
                <span className="info-value">
                  {department.traineeCount || 0}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Trainers:</span>
                <span className="info-value">
                  {department.trainerCount || 0}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Head of Department:</span>
                <span className="info-value">
                  {department.headUser ? 
                    `${department.headUser.firstName} ${department.headUser.lastName}` : 
                    'Not assigned'
                  }
                </span>
              </div>
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="info-card info-card-timeline">
            <div className="info-header">
              <Calendar className="info-icon" />
              <h6>Timeline</h6>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">{formatDate(department.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">{formatDate(department.updatedAt)}</span>
              </div>
              {department.deletedAt && (
                <div className="info-item">
                  <span className="info-label">Deleted:</span>
                  <span className="info-value">{formatDate(department.deletedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Col>

      </Row>
    </div>
  );
};

export default DepartmentInfo;
