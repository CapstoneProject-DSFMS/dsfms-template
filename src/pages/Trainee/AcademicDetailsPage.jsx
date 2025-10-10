import React from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import TraineeDetailView from '../../components/Trainee/TraineeDetailView';

const AcademicDetailsPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Container className="py-3">
        <div className="text-center">
          <p>Please log in to view your academic details.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <TraineeDetailView traineeId={user.id} />
    </Container>
  );
};

export default AcademicDetailsPage;
