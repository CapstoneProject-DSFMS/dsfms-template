import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AssessmentSectionDetails from '../../components/Trainee/AssessmentSectionDetails';

const AssessmentSectionDetailsPage = () => {
  const { traineeId, sectionId } = useParams();

  return (
    <Container className="py-3">
      <AssessmentSectionDetails 
        traineeId={traineeId}
        sectionId={sectionId}
      />
    </Container>
  );
};

export default AssessmentSectionDetailsPage;
