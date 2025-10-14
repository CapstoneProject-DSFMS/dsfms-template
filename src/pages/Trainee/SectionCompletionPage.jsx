import React from 'react';
import { Container } from 'react-bootstrap';
import TraineeSectionCompletionList from '../../components/Trainee/TraineeSectionCompletionList';
import { useAuth } from '../../hooks/useAuth';

const SectionCompletionPage = () => {
  const { user } = useAuth();

  return (
    <Container fluid className="py-4">
      <TraineeSectionCompletionList traineeId={user?.id} />
    </Container>
  );
};

export default SectionCompletionPage;