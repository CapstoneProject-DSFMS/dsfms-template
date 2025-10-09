import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TraineeDetailView from '../../components/Trainee/TraineeDetailView';

const TraineeDetailPage = () => {
  const { traineeId } = useParams();

  return (
    <Container className="py-3">
      <TraineeDetailView traineeId={traineeId} />
    </Container>
  );
};

export default TraineeDetailPage;
