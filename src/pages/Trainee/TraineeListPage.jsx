import React from 'react';
import { Container } from 'react-bootstrap';
import TraineeListView from '../../components/Trainee/TraineeListView';

const TraineeListPage = () => {
  return (
    <Container className="py-3">
      <TraineeListView />
    </Container>
  );
};

export default TraineeListPage;
