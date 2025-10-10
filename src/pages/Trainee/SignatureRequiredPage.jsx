import React from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import TraineeAssessmentPendingList from '../../components/Trainee/TraineeAssessmentPendingList';

const SignatureRequiredPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Container className="py-3">
        <div className="text-center">
          <p>Please log in to view your signature required list.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <TraineeAssessmentPendingList traineeId={user.id} defaultActiveTab="signature" />
    </Container>
  );
};

export default SignatureRequiredPage;
