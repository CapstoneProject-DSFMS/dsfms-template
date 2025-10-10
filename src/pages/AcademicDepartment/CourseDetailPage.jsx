import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import courseAPI from '../../api/course';
import InPageCourseDetail from './InPageCourseDetail';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourseById(courseId);
        
        // Set course data
        setCourse(response);
        
        // Set department data from course response
        if (response.department) {
          setDepartment(response.department);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading course:', error);
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-4">
        <div className="text-center text-muted">
          <h4>Course not found</h4>
          <p>The requested course could not be found.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <InPageCourseDetail course={course} department={department} />
    </Container>
  );
};

export default CourseDetailPage;


