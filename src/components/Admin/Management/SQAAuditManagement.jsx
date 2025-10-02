import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { Eye, Pencil, FileEarmarkText, Plus, ThreeDots, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { SearchBar, FilterDropdown, PermissionWrapper } from '../Common';
const SQAAuditManagement = () => {
  const [audits, setAudits] = useState([
    {
      id: 1,
      auditCode: 'AUD-001',
      auditType: 'Course Audit',
      targetCourse: 'CCT-001',
      auditor: 'SQA-001',
      status: 'In Progress',
      startDate: '2024-01-15',
      endDate: null,
      findings: 2,
      cars: 1
    },
    {
      id: 2,
      auditCode: 'AUD-002',
      auditType: 'Trainer Audit',
      targetCourse: 'FCTD-001',
      auditor: 'SQA-002',
      status: 'Completed',
      startDate: '2024-01-10',
      endDate: '2024-01-20',
      findings: 0,
      cars: 0
    },
    {
      id: 3,
      auditCode: 'AUD-003',
      auditType: 'Department Audit',
      targetCourse: 'CCT',
      auditor: 'SQA-001',
      status: 'Draft',
      startDate: null,
      endDate: null,
      findings: 0,
      cars: 0
    }
  ]);

  const [cars, setCars] = useState([
    {
      id: 1,
      carCode: 'CAR-001',
      auditId: 1,
      finding: 'Safety equipment not properly maintained',
      department: 'CCT',
      status: 'Open',
      createdDate: '2024-01-16',
      dueDate: '2024-02-15',
      assignedTo: 'Dept Head - CCT'
    },
    {
      id: 2,
      carCode: 'CAR-002',
      auditId: 1,
      finding: 'Training records incomplete',
      department: 'CCT',
      status: 'In Progress',
      createdDate: '2024-01-16',
      dueDate: '2024-02-20',
      assignedTo: 'Dept Head - CCT'
    }
  ]);

  const [activeTab, setActiveTab] = useState('audits');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.auditCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.targetCourse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || audit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.carCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.finding.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Closed', label: 'Closed' }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
      case 'Open': return 'danger';
      case 'Closed': return 'success';
      default: return 'secondary';
    }
  };

  const handleCloseCAR = (carId) => {
    setCars(cars.map(car => 
      car.id === carId 
        ? { ...car, status: 'Closed' }
        : car
    ));
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <Card.Header className="bg-light-custom border-neutral-200">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-primary-custom mb-0">SQA Audit Management</h5>
            <small className="text-muted">
              Manage audits, findings, and corrective action requests
            </small>
          </Col>
          <Col xs="auto">
            <div className="btn-group" role="group">
              <Button
                variant={activeTab === 'audits' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setActiveTab('audits')}
              >
                Audits
              </Button>
              <Button
                variant={activeTab === 'cars' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setActiveTab('cars')}
              >
                CARs
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Search and Filters */}
        <Row className="mb-3">
          <Col md={4}>
            <SearchBar
              placeholder={`Search ${activeTab}...`}
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
                {activeTab === 'audits' ? filteredAudits.length : filteredCars.length} {activeTab}
              </small>
            </div>
          </Col>
        </Row>

        {/* Audits Tab */}
        {activeTab === 'audits' && (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Audit Code
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Type
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Target
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Status
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Findings
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    CARs
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((audit, index) => (
                  <tr 
                    key={audit.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                  >
                    <td className="border-neutral-200 align-middle">
                      <span className="fw-semibold text-primary-custom">
                        {audit.auditCode}
                      </span>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <span className="text-dark">
                        {audit.auditType}
                      </span>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <span className="text-dark">
                        {audit.targetCourse}
                      </span>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <Badge 
                        bg={getStatusVariant(audit.status)}
                        className="px-2 py-1"
                        style={{ 
                          fontSize: '0.75rem',
                          width: 'fit-content'
                        }}
                      >
                        {audit.status}
                      </Badge>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <span className="text-dark">
                        {audit.findings}
                      </span>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <span className="text-dark">
                        {audit.cars}
                      </span>
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
                            View Audit
                          </Dropdown.Item>
                          
                          <PermissionWrapper 
                            permission="POST /reports"
                            fallback={null}
                          >
                            <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                              <Pencil className="me-2" size={16} />
                              Edit Audit
                            </Dropdown.Item>
                          </PermissionWrapper>
                          
                          <PermissionWrapper 
                            permission="GET /reports"
                            fallback={null}
                          >
                            <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                              <Plus className="me-2" size={16} />
                              Add Finding
                            </Dropdown.Item>
                          </PermissionWrapper>
                          
                          <PermissionWrapper 
                            permission="POST /reports"
                            fallback={null}
                          >
                            <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                              <Plus className="me-2" size={16} />
                              Create CAR
                            </Dropdown.Item>
                          </PermissionWrapper>
                          
                          <PermissionWrapper 
                            permission="POST /reports"
                            fallback={null}
                          >
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-primary d-flex align-items-center">
                              <FileEarmarkText className="me-2" size={16} />
                              Generate Report
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
        )}

        {/* CARs Tab */}
        {activeTab === 'cars' && (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    CAR Code
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Finding
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Department
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Status
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold">
                    Due Date
                  </th>
                  <th className="border-neutral-200 text-primary-custom fw-semibold text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car, index) => (
                  <tr 
                    key={car.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                  >
                    <td className="border-neutral-200 align-middle">
                      <span className="fw-semibold text-primary-custom">
                        {car.carCode}
                      </span>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <div className="text-dark" style={{ maxWidth: '200px' }}>
                        {car.finding}
                      </div>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <Badge 
                        bg="secondary" 
                        className="px-2 py-1"
                        style={{ 
                          backgroundColor: 'var(--bs-secondary)',
                          fontSize: '0.75rem'
                        }}
                      >
                        {car.department}
                      </Badge>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <Badge 
                        bg={getStatusVariant(car.status)}
                        className="px-2 py-1"
                        style={{ 
                          fontSize: '0.75rem',
                          width: 'fit-content'
                        }}
                      >
                        {car.status}
                      </Badge>
                    </td>
                    
                    <td className="border-neutral-200 align-middle">
                      <small className="text-muted">
                        {car.dueDate}
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
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Eye className="me-2" size={16} />
                            View CAR
                          </Dropdown.Item>
                          
                          <PermissionWrapper 
                            permission="GET /reports"
                            fallback={null}
                          >
                            <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                              <Pencil className="me-2" size={16} />
                              Update Status
                            </Dropdown.Item>
                          </PermissionWrapper>
                          
                          <PermissionWrapper 
                            permission="GET /reports"
                            fallback={null}
                          >
                            {car.status !== 'Closed' && (
                              <Dropdown.Item 
                                className="text-success d-flex align-items-center"
                                onClick={() => handleCloseCAR(car.id)}
                              >
                                <CheckCircle className="me-2" size={16} />
                                Close CAR
                              </Dropdown.Item>
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
        )}
      </Card.Body>
    </Card>
  );
};

export default SQAAuditManagement;
