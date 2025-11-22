import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import SignaturePad from '../../components/Trainee/SignaturePad';
import { toast } from 'react-toastify';

const SignaturePadPage = () => {
  const { traineeId, documentId } = useParams();
  const navigate = useNavigate();

  const handleSave = async (signatureData) => {
    try {
      // TODO: Save signature to API
      console.log('Signature saved:', signatureData);
      toast.success('Signature saved successfully');
      
      // Navigate to assessment detail if documentId is an assessment, otherwise go back
      // Try to navigate to assessment detail first, fallback to back navigation
      navigate(ROUTES.ASSESSMENTS_DETAIL(documentId), { replace: true });
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature');
    }
  };

  const handleClose = () => {
    // Navigate back or to assessment detail
    navigate(`/trainee/${traineeId}/assessment/${documentId}`, { replace: true }); // Keep old route for now (trainee-specific with traineeId)
  };

  return (
    <Container className="py-3">
      <SignaturePad 
        show={true}
        documentName={`Document ${documentId}`}
        onClose={handleClose}
        onSave={handleSave}
      />
    </Container>
  );
};

export default SignaturePadPage;
