import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SignaturePad from '../../components/Trainee/SignaturePad';

const SignaturePadPage = () => {
  const { traineeId, documentId } = useParams();

  return (
    <Container className="py-3">
      <SignaturePad 
        show={true}
        documentName={`Document ${documentId}`}
        onClose={() => window.history.back()}
        onSave={(signatureData) => {
          console.log('Signature saved:', signatureData);
          // TODO: Save signature to API
        }}
      />
    </Container>
  );
};

export default SignaturePadPage;
