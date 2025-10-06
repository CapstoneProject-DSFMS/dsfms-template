import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import InPageCourseDetail from './InPageCourseDetail';

// Wrapper page to show full-screen detail using mock data
import SubjectTable from './SubjectTable';

const mockCourse = {
  id: 1,
  name: 'Safety Procedures',
  code: 'SAF001'
};

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const course = { ...mockCourse, id: courseId };
  return (
    <Container className="py-3">
      <InPageCourseDetail course={course} />
    </Container>
  );
};

export default CourseDetailPage;


