import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { Eye, Pencil, FileEarmarkPdf, Lock, Unlock, ThreeDots } from 'react-bootstrap-icons';
import { SearchBar, FilterDropdown, PermissionWrapper } from '../Common';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../constants/permissions';

const AssessmentManagement = () => {
  const { hasPermission } = useAuth();
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      traineeId: 'T001',
      traineeName: 'John Smith',
      courseCode: 'CCT-001',
      subjectCode: 'CCT-SAFETY',
      assessmentType: 'Safety Training',
      status: 'Draft',
      submittedDate: null,
      approvedDate: null,
      score: null
    },
    {
      id: 2,
      traineeId: 'T002',
      traineeName: 'Jane Doe',
      courseCode: 'CCT-001',
      subjectCode: 'CCT-SAFETY',
      assessmentType: 'Safety Training',
      status: 'Submitted',
      submittedDate: '2024-01-20',
      approvedDate: null,
      score: 85
    },
    {
      id: 3,
      traineeId: 'T003',
      traineeName: 'Bob Johnson',
      courseCode: 'FCTD-001',
      subjectCode: 'FCTD-FLIGHT',
      assessmentType: 'Flight Training',
      status: 'Approved',
      submittedDate: '2024-01-18',
      approvedDate: '2024-01-22',
      score: 92
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.traineeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Submitted': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const handleLockForm = (assessmentId) => {
    setAssessments(assessments.map(assessment => 
      assessment.id === assessmentId 
        ? { ...assessment, status: 'Locked' }
        : assessment
    ));
  };

  const handleUnlockForm = (assessmentId) => {
    setAssessments(assessments.map(assessment => 
      assessment.id === assessmentId 
        ? { ...assessment, status: 'Draft' }
        : assessment
    ));
  };

  const handleExportPDF = (assessmentId) => {
    // Handle PDF export
    console.log('Exporting PDF for assessment:', assessmentId);
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <Card.Header className="bg-light-custom border-neutral-200">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-primary-custom mb-0">Assessment Management</h5>
            <small className="text-muted">
              Manage trainee assessments and evaluations
            </small>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Search and Filters */}
        <Row className="mb-3">
          <Col md={4}>
            <SearchBar
              placeholder="Search by trainee name, ID, or course..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </Col>
          <Col md={3}>
            <FilterDropdown
              title="Status"
              options={statusOptions}
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
            />
          </Col>
          <Col md={5}>
            <div className="text-end">
              <small className="text-muted">
                {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''}
              </small>
            </div>
          </Col>
        </Row>

        {/* Assessment Table */}
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-neutral-50">
              <tr>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Trainee
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Course/Subject
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Assessment Type
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Status
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Score
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Submitted
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment, index) => (
                <tr 
                  key={assessment.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                >
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="fw-semibold text-primary-custom">
                        {assessment.traineeId}
                      </div>
                      <small className="text-muted">
                        {assessment.traineeName}
                      </small>
                    </div>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="fw-medium text-dark">
                        {assessment.courseCode}
                      </div>
                      <small className="text-muted">
                        {assessment.subjectCode}
                      </small>
                    </div>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <span className="text-dark">
                      {assessment.assessmentType}
                    </span>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <Badge 
                      bg={getStatusVariant(assessment.status)}
                      className="px-2 py-1"
                      style={{ 
                        fontSize: '0.75rem',
                        width: 'fit-content'
                      }}
                    >
                      {assessment.status}
                    </Badge>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    {assessment.score ? (
                      <span className="fw-medium text-dark">
                        {assessment.score}%
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    {assessment.submittedDate ? (
                      <small className="text-muted">
                        {assessment.submittedDate}
                      </small>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  
                  <td className="border-neutral-200 align-middle text-center">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        className="text-primary-custom p-1"
                        style={{ 
                          border: 'none', 
                          background: 'transparent',
                          boxShadow: 'none'
                        }}
                      >
                        <ThreeDots size={16} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="border-0 shadow">
                        <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                          <Eye className="me-2" size={16} />
                          View Assessment
                        </Dropdown.Item>
                        
                        <PermissionWrapper 
                          permission={PERMISSIONS.FILL_ASSESSMENT}
                          fallback={null}
                        >
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Pencil className="me-2" size={16} />
                            Edit Assessment
                          </Dropdown.Item>
                        </PermissionWrapper>
                        
                        <PermissionWrapper 
                          permission={PERMISSIONS.LOCK_FORM}
                          fallback={null}
                        >
                          {assessment.status === 'Draft' ? (
                            <Dropdown.Item 
                              className="text-warning d-flex align-items-center"
                              onClick={() => handleLockForm(assessment.id)}
                            >
                              <Lock className="me-2" size={16} />
                              Lock Form
                            </Dropdown.Item>
                          ) : assessment.status === 'Locked' ? (
                            <Dropdown.Item 
                              className="text-success d-flex align-items-center"
                              onClick={() => handleUnlockForm(assessment.id)}
                            >
                              <Unlock className="me-2" size={16} />
                              Unlock Form
                            </Dropdown.Item>
                          ) : null}
                        </PermissionWrapper>
                        
                        <PermissionWrapper 
                          permission={PERMISSIONS.APPROVE_ASSESSMENT}
                          fallback={null}
                        >
                          {assessment.status === 'Submitted' && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-success d-flex align-items-center">
                                <Eye className="me-2" size={16} />
                                Approve Assessment
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger d-flex align-items-center">
                                <Pencil className="me-2" size={16} />
                                Reject Assessment
                              </Dropdown.Item>
                            </>
                          )}
                        </PermissionWrapper>
                        
                        <PermissionWrapper 
                          permission={PERMISSIONS.EXPORT_PDF}
                          fallback={null}
                        >
                          {assessment.status === 'Approved' && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                className="text-primary d-flex align-items-center"
                                onClick={() => handleExportPDF(assessment.id)}
                              >
                                <FileEarmarkPdf className="me-2" size={16} />
                                Export PDF
                              </Dropdown.Item>
                            </>
                          )}
                        </PermissionWrapper>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AssessmentManagement;
