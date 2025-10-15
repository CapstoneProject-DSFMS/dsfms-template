import React from 'react';
import { Container } from 'react-bootstrap';
import TraineeYourAssessments from '../../components/Trainee/TraineeYourAssessments';
import { useAuth } from '../../hooks/useAuth';

const YourAssessmentsPage = () => {
  const { user } = useAuth();

  return (
    <Container fluid className="py-4">
      <TraineeYourAssessments traineeId={user?.id} />
    </Container>
  );
};

export default YourAssessmentsPage;
