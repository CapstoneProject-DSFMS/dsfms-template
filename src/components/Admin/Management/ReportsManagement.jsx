import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { Eye, Pencil, FileEarmarkText, Plus, ThreeDots, CheckCircle } from 'react-bootstrap-icons';
import { SearchBar, FilterDropdown, PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';
const ReportsManagement = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      reportCode: 'RPT-001',
      reportType: 'Safety Report',
      reporter: 'TRAINER-001',
      reporterName: 'John Trainer',
      subject: 'Equipment malfunction during training',
      status: 'Submitted',
      submittedDate: '2024-01-20',
      priority: 'High',
      assignedTo: 'SQA-001'
    },
    {
      id: 2,
      reportCode: 'RPT-002',
      reportType: 'Student Feedback',
      reporter: 'TRAINEE-001',
      reporterName: 'Jane Student',
      subject: 'Concern about training facilities',
      status: 'In Review',
      submittedDate: '2024-01-18',
      priority: 'Medium',
      assignedTo: 'SQA-002'
    },
    {
      id: 3,
      reportCode: 'RPT-003',
      reportType: 'Incident Report',
      reporter: 'TRAINEE-002',
      reporterName: 'Bob Student',
      subject: 'Health issue during training',
      status: 'Resolved',
      submittedDate: '2024-01-15',
      priority: 'High',
      assignedTo: 'SQA-001'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || report.reportType === typeFilter;
    const matchesStatus = !statusFilter || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeOptions = [
    { value: 'Safety Report', label: 'Safety Report' },
    { value: 'Student Feedback', label: 'Student Feedback' },
    { value: 'Incident Report', label: 'Incident Report' }
  ];

  const statusOptions = [
    { value: 'Submitted', label: 'Submitted' },
    { value: 'In Review', label: 'In Review' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Submitted': return 'warning';
      case 'In Review': return 'info';
      case 'Resolved': return 'success';
      case 'Closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  const handleResolveReport = (reportId) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'Resolved' }
        : report
    ));
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <Card.Header className="bg-light-custom border-neutral-200">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-primary-custom mb-0">Reports Management</h5>
            <small className="text-muted">
              Manage safety reports, student feedback, and incident reports
            </small>
          </Col>
          <Col xs="auto">
            <PermissionWrapper 
              permission={API_PERMISSIONS.REPORTS.CREATE}
              fallback={null}
            >
              <Button
                variant="primary"
                size="sm"
                className="d-flex align-items-center"
              >
                <Plus className="me-1" size={16} />
                Submit Report
              </Button>
            </PermissionWrapper>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Search and Filters */}
        <Row className="mb-3">
          <Col md={3}>
            <SearchBar
              placeholder="Search reports..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </Col>
          <Col md={2}>
            <FilterDropdown
              title="Type"
              options={typeOptions}
              selectedValue={typeFilter}
              onSelect={setTypeFilter}
            />
          </Col>
          <Col md={2}>
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
                {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
              </small>
            </div>
          </Col>
        </Row>

        {/* Reports Table */}
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-neutral-50">
              <tr>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Report Code
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Type
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Reporter
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Subject
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Priority
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Status
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
              {filteredReports.map((report, index) => (
                <tr 
                  key={report.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                >
                  <td className="border-neutral-200 align-middle">
                    <span className="fw-semibold text-primary-custom">
                      {report.reportCode}
                    </span>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <Badge 
                      bg="info" 
                      className="px-2 py-1"
                      style={{ 
                        backgroundColor: 'var(--bs-info)',
                        fontSize: '0.75rem'
                      }}
                    >
                      {report.reportType}
                    </Badge>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="fw-medium text-dark">
                        {report.reporterName}
                      </div>
                      <small className="text-muted">
                        {report.reporter}
                      </small>
                    </div>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <div className="text-dark" style={{ maxWidth: '200px' }}>
                      {report.subject}
                    </div>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <Badge 
                      bg={getPriorityVariant(report.priority)}
                      className="px-2 py-1"
                      style={{ 
                        fontSize: '0.75rem',
                        width: 'fit-content'
                      }}
                    >
                      {report.priority}
                    </Badge>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <Badge 
                      bg={getStatusVariant(report.status)}
                      className="px-2 py-1"
                      style={{ 
                        fontSize: '0.75rem',
                        width: 'fit-content'
                      }}
                    >
                      {report.status}
                    </Badge>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <small className="text-muted">
                      {report.submittedDate}
                    </small>
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
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.REPORTS.VIEW_ALL}
                          fallback={null}
                        >
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Eye className="me-2" size={16} />
                            View Report
                          </Dropdown.Item>
                        </PermissionWrapper>
                        
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.REPORTS.VIEW_ALL}
                          fallback={null}
                        >
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Pencil className="me-2" size={16} />
                            Update Status
                          </Dropdown.Item>
                        </PermissionWrapper>
                        
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.REPORTS.VIEW_ALL}
                          fallback={null}
                        >
                          {report.status !== 'Resolved' && report.status !== 'Closed' && (
                            <Dropdown.Item 
                              className="text-success d-flex align-items-center"
                              onClick={() => handleResolveReport(report.id)}
                            >
                              <CheckCircle className="me-2" size={16} />
                              Mark as Resolved
                            </Dropdown.Item>
                          )}
                        </PermissionWrapper>
                        
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.REPORTS.VIEW_ALL}
                          fallback={null}
                        >
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-primary d-flex align-items-center">
                            <FileEarmarkText className="me-2" size={16} />
                            Generate Response
                          </Dropdown.Item>
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

export default ReportsManagement;
