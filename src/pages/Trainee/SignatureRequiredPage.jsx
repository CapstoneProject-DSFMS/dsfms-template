import React from 'react';
import { Container } from 'react-bootstrap';
import TraineeSignatureRequiredList from '../../components/Trainee/TraineeSignatureRequiredList';
import { useAuth } from '../../hooks/useAuth';

const SignatureRequiredPage = () => {
  const { user } = useAuth();

  return (
    <Container fluid className="py-4">
      <TraineeSignatureRequiredList traineeId={user?.id} />
    </Container>
  );
};

export default SignatureRequiredPage;