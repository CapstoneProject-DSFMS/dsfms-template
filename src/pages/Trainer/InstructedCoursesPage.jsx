import React from 'react';
import { Container } from 'react-bootstrap';
import InstructedCoursesList from '../../components/Trainer/InstructedCoursesList';

const InstructedCoursesPage = () => {
  return (
    <Container fluid className="py-4">
      <InstructedCoursesList />
    </Container>
  );
};

export default InstructedCoursesPage;

