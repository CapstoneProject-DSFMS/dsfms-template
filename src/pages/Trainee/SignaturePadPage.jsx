import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import SignaturePad from '../../components/Profile/SignaturePad';
import { ArrowLeft, X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const SignaturePadPage = () => {
  const { traineeId, documentId } = useParams();
  const navigate = useNavigate();
  const [signatureData, setSignatureData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignatureChange = (dataUrl) => {
    setSignatureData(dataUrl);
  };

  const handleSave = async () => {
    if (!signatureData) {
      toast.error('Please provide your signature');
      return;
    }

    try {
      setLoading(true);
      // TODO: Save signature to API
      console.log('Signature saved:', {
        documentId,
        traineeId,
        signature: signatureData,
        timestamp: new Date().toISOString()
      });
      toast.success('Signature saved successfully');
      
      // Navigate to assessment detail
      navigate(ROUTES.ASSESSMENTS_DETAIL(documentId), { replace: true });
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(`/trainee/${traineeId}/assessment/${documentId}`, { replace: true });
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          className="mb-3"
        >
          <ArrowLeft size={16} className="me-2" />
          Back
        </Button>
      </div>

      <Card>
        <Card.Header className="bg-primary text-white border-0">
          <h5 className="mb-0">Digital Signature</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Alert variant="info" className="mb-4">
            <p className="mb-0">Please sign in the box below using your mouse or touch device</p>
          </Alert>

          <div className="mb-4">
            <SignaturePad 
              onSignatureChange={handleSignatureChange}
              width={250}
              height={150}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              <X className="me-2" size={16} />
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || !signatureData}
            >
              {loading ? 'Saving...' : 'Save Signature'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SignaturePadPage;
