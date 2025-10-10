import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TraineeSubjectDetailView from '../../components/Trainee/TraineeSubjectDetailView';

const TraineeSubjectDetailPage = () => {
  const { traineeId, courseId, subjectId } = useParams();

  return (
    <Container className="py-3">
      <TraineeSubjectDetailView 
        traineeId={traineeId} 
        courseId={courseId} 
        subjectId={subjectId} 
      />
    </Container>
  );
};

export default TraineeSubjectDetailPage;
