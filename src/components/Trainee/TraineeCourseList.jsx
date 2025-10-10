import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Eye, Book } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';

const TraineeCourseList = ({ traineeId }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traineeId) {
      loadTraineeCourses();
    }
  }, [traineeId]);

  const loadTraineeCourses = async () => {
    try {
      setLoading(true);
      
      // Hardcoded courses data
      const mockCourses = [
        {
          id: '1',
          code: 'SAF001',
          name: 'Safety Procedures Training',
          description: 'Basic safety procedures and emergency protocols',
          level: 'BEGINNER',
          status: 'ACTIVE',
          startDate: '2024-01-15T09:00:00.000Z',
          endDate: '2024-03-15T17:00:00.000Z',
          progress: 75,
          department: {
            id: 1,
            name: 'Safety Department',
            code: 'SAF'
          }
        },
        {
          id: '2',
          code: 'FLT002',
          name: 'Flight Operations',
          description: 'Advanced flight operations and navigation',
          level: 'INTERMEDIATE',
          status: 'ACTIVE',
          startDate: '2024-02-01T08:00:00.000Z',
          endDate: '2024-04-01T16:00:00.000Z',
          progress: 45,
          department: {
            id: 2,
            name: 'Flight Operations',
            code: 'FO'
          }
        },
        {
          id: '3',
          code: 'EMG003',
          name: 'Emergency Response',
          description: 'Emergency response and crisis management',
          level: 'ADVANCED',
          status: 'COMPLETED',
          startDate: '2023-11-01T09:00:00.000Z',
          endDate: '2023-12-15T17:00:00.000Z',
          progress: 100,
          department: {
            id: 3,
            name: 'Emergency Services',
            code: 'EMG'
          }
        },
        {
          id: '4',
          code: 'TECH004',
          name: 'Technical Systems',
          description: 'Aircraft technical systems and maintenance',
          level: 'INTERMEDIATE',
          status: 'PLANNED',
          startDate: '2024-03-01T09:00:00.000Z',
          endDate: '2024-05-01T17:00:00.000Z',
          progress: 0,
          department: {
            id: 4,
            name: 'Technical Department',
            code: 'TECH'
          }
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading trainee courses:', error);
      toast.error('Failed to load enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { variant: 'success', text: 'Active' },
      'ARCHIVED': { variant: 'secondary', text: 'Archived' },
      'PLANNED': { variant: 'info', text: 'Planned' },
      'COMPLETED': { variant: 'primary', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      'BEGINNER': { variant: 'success', text: 'Beginner' },
      'INTERMEDIATE': { variant: 'warning', text: 'Intermediate' },
      'ADVANCED': { variant: 'danger', text: 'Advanced' }
    };
    
    const config = levelConfig[level] || { variant: 'secondary', text: level };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewCourse = (courseId) => {
    navigate(`/trainee/${traineeId}/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted small">Loading courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-4">
        <Book size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No enrolled courses</p>
      </div>
    );
  }

  return (
    <div className="trainee-courses-table">
      <Table responsive hover className="mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-start">Course Code</th>
            <th className="text-start">Course Name</th>
            <th className="text-start">Level</th>
            <th className="text-start">Status</th>
            <th className="text-start">Start Date</th>
            <th className="text-start">End Date</th>
            <th className="text-start">Progress</th>
            <th className="text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <Badge bg="primary" className="fw-normal">
                  {course.code}
                </Badge>
              </td>
              <td>
                <div className="fw-semibold">{course.name}</div>
                <small className="text-muted">{course.description}</small>
              </td>
              <td>{getLevelBadge(course.level)}</td>
              <td>{getStatusBadge(course.status)}</td>
              <td>
                {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}
              </td>
              <td>
                {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{course.progress || 0}%</small>
                </div>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleViewCourse(course.id)}
                >
                  <Eye size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeCourseList;
