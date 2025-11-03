import React from 'react';
import { Container } from 'react-bootstrap';
import AssessmentResultsList from '../../components/Trainer/AssessmentResultsList';

const AssessmentResultsPage = () => {
  return (
    <Container fluid className="py-4">
      <AssessmentResultsList />
    </Container>
  );
};

export default AssessmentResultsPage;

