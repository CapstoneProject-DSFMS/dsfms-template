import React from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import TraineeAssessmentPendingList from '../../components/Trainee/TraineeAssessmentPendingList';

const SectionCompletionPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Container className="py-3">
        <div className="text-center">
          <p>Please log in to view your section completion list.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <TraineeAssessmentPendingList traineeId={user.id} defaultActiveTab="completion" />
    </Container>
  );
};

export default SectionCompletionPage;
