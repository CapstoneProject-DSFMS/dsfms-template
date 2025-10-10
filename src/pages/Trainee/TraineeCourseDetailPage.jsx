import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TraineeCourseDetailView from '../../components/Trainee/TraineeCourseDetailView';

const TraineeCourseDetailPage = () => {
  const { traineeId, courseId } = useParams();

  return (
    <Container className="py-3">
      <TraineeCourseDetailView traineeId={traineeId} courseId={courseId} />
    </Container>
  );
};

export default TraineeCourseDetailPage;
