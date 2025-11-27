import React from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import TraineeCourseList from '../../components/Trainee/TraineeCourseList';

const EnrolledCoursesPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Container className="py-3">
        <div className="text-center">
          <p>Please log in to view your enrolled courses.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <div className="mb-4">
        <h3 className="text-primary fw-bold">Enrolled Courses</h3>
      </div>
      <TraineeCourseList traineeId={user.id} />
    </Container>
  );
};

export default EnrolledCoursesPage;
