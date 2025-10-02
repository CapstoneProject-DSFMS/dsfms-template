import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { Plus, Eye, Pencil, Trash, ThreeDots } from 'react-bootstrap-icons';
import { SearchBar, FilterDropdown, PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';

const CourseManagement = () => {
  const [courses] = useState([
    {
      id: 1,
      courseCode: 'CCT-001',
      courseName: 'Cabin Crew Training',
      department: 'CCT',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      maxTrainees: 30,
      currentTrainees: 25,
      status: 'Active'
    },
    {
      id: 2,
      courseCode: 'FCTD-001',
      courseName: 'Flight Crew Training',
      department: 'FCTD',
      startDate: '2024-02-01',
      endDate: '2024-04-01',
      maxTrainees: 20,
      currentTrainees: 18,
      status: 'Active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || course.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const uniqueDepartments = [...new Set(courses.map(course => course.department))];
  const departmentOptions = uniqueDepartments.map(dept => ({ value: dept, label: dept }));

  const getStatusVariant = (status) => {
    return status === 'Active' ? 'success' : 'secondary';
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <Card.Header className="bg-light-custom border-neutral-200">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-primary-custom mb-0">Course Management</h5>
            <small className="text-muted">
              Manage courses and subjects for each department
            </small>
          </Col>
          <Col xs="auto">
            <PermissionWrapper 
              permission={API_PERMISSIONS.COURSES.CREATE}
              fallback={null}
            >
              <Button
                variant="primary"
                size="sm"
                className="d-flex align-items-center"
              >
                <Plus className="me-1" size={16} />
                Add Course
              </Button>
            </PermissionWrapper>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Search and Filters */}
        <Row className="mb-3">
          <Col md={4}>
            <SearchBar
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </Col>
          <Col md={3}>
            <FilterDropdown
              title="Department"
              options={departmentOptions}
              selectedValue={departmentFilter}
              onSelect={setDepartmentFilter}
            />
          </Col>
          <Col md={5}>
            <div className="text-end">
              <small className="text-muted">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </small>
            </div>
          </Col>
        </Row>

        {/* Course Table */}
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-neutral-50">
              <tr>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Course Code
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Course Name
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Department
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Duration
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Trainees
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold">
                  Status
                </th>
                <th className="border-neutral-200 text-primary-custom fw-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, index) => (
                <tr 
                  key={course.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                >
                  <td className="border-neutral-200 align-middle">
                    <span className="fw-semibold text-primary-custom">
                      {course.courseCode}
                    </span>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <div className="fw-medium text-dark">
                      {course.courseName}
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
                      {course.department}
                    </Badge>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <small className="text-muted">
                      {course.startDate} - {course.endDate}
                    </small>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <span className="text-dark">
                      {course.currentTrainees}/{course.maxTrainees}
                    </span>
                  </td>
                  
                  <td className="border-neutral-200 align-middle">
                    <Badge 
                      bg={getStatusVariant(course.status)}
                      className="px-2 py-1"
                      style={{ 
                        fontSize: '0.75rem',
                        width: 'fit-content'
                      }}
                    >
                      {course.status}
                    </Badge>
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
                          View Details
                        </Dropdown.Item>
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.COURSES.UPDATE}
                          fallback={null}
                        >
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Pencil className="me-2" size={16} />
                            Edit Course
                          </Dropdown.Item>
                        </PermissionWrapper>
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.SUBJECTS.CREATE}
                          fallback={null}
                        >
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Plus className="me-2" size={16} />
                            Add Subject
                          </Dropdown.Item>
                        </PermissionWrapper>
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.ENROLLMENTS.CREATE}
                          fallback={null}
                        >
                          <Dropdown.Item className="text-primary-custom d-flex align-items-center">
                            <Plus className="me-2" size={16} />
                            Enroll Trainees
                          </Dropdown.Item>
                        </PermissionWrapper>
                        <PermissionWrapper 
                          permission={API_PERMISSIONS.COURSES.DELETE}
                          fallback={null}
                        >
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-danger d-flex align-items-center">
                            <Trash className="me-2" size={16} />
                            Delete Course
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

export default CourseManagement;
