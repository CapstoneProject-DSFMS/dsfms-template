import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TraineeAssessmentView from '../../components/Trainee/TraineeAssessmentView';

const TraineeAssessmentPage = () => {
  const { traineeId } = useParams();

  return (
    <Container className="py-3">
      <TraineeAssessmentView traineeId={traineeId} />
    </Container>
  );
};

export default TraineeAssessmentPage;
