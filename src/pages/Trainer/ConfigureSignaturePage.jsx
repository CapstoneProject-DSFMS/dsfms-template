import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { PersonCheck, Save, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../constants/routes';
import SignaturePad from '../../components/Profile/SignaturePad';
import profileAPI from '../../api/profile';
import uploadAPI from '../../api/upload';

const configureSignatureStyles = `
  .signature-card .card-body {
    height: 400px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }

  @media (max-width: 991px) {
    .signature-card .card-body {
      height: 380px !important;
    }
  }

  @media (max-width: 767px) {
    .signature-card .card-body {
      height: 360px !important;
    }
  }

  @media (max-width: 575px) {
    .signature-card .card-body {
      height: 340px !important;
    }
  }

  .signature-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .signature-buttons {
    width: 100%;
    margin-top: auto;
    padding-top: 1rem;
  }
`;


const ConfigureSignaturePage = () => {
  const navigate = useNavigate();
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current signature from profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await profileAPI.getProfile();
        if (profile?.signatureImageUrl) {
          setCurrentSignature(profile.signatureImageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSignatureChange = (dataUrl) => {
    setSignatureDataUrl(dataUrl);
  };

  // Resize signature to 350x200 with transparent background (same size as pad)
  const resizeSignature = (originalDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 350;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas to ensure transparent background
        ctx.clearRect(0, 0, 350, 200);
        
        // Draw the signature image (preserves transparency from original)
        ctx.drawImage(img, 0, 0, 350, 200);
        
        // Export as PNG with transparency
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = originalDataUrl;
    });
  };

  const handleSaveSignature = async () => {
    if (!signatureDataUrl) {
      toast.warning('Please draw your signature first.');
      return;
    }

    setSaving(true);

    try {
      // Resize signature to 350x200
      const resizedDataUrl = await resizeSignature(signatureDataUrl);
      
      // Step 1: Convert dataUrl to blob and file
      const response = await fetch(resizedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });

      // Step 2: Upload signature to S3
      const uploadResponse = await uploadAPI.uploadImage(file, 'signature');
      
      // Get URL from response
      let signatureUrl = '';
      if (typeof uploadResponse === 'string') {
        signatureUrl = uploadResponse;
      } else if (uploadResponse?.url) {
        signatureUrl = uploadResponse.url;
      } else if (uploadResponse?.data?.[0]?.url) {
        signatureUrl = uploadResponse.data[0].url;
      }

      if (!signatureUrl) {
        throw new Error('Failed to get signature URL from upload response');
      }

      console.log('✅ Signature uploaded to S3:', signatureUrl);

      // Step 3: Send signature URL to API
      await profileAPI.updateSignature(signatureUrl);
      
      // Fetch the updated profile to get the new signature image
      const updatedProfile = await profileAPI.getProfile();
      if (updatedProfile?.signatureImageUrl) {
        setCurrentSignature(updatedProfile.signatureImageUrl);
      }
      
      toast.success('Signature saved successfully!');
      
      // Clear the drawing
      setSignatureDataUrl(null);
    } catch (error) {
      console.error('Error saving signature:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save signature. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  return (
    <>
      <style>{configureSignatureStyles}</style>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center mb-3">
              <Button 
                variant="outline-secondary" 
                onClick={handleBackToProfile}
                className="me-3"
              >
                <ArrowLeft size={16} className="me-2" />
                Back to Profile
              </Button>
            </div>
          </Col>
        </Row>



        <Row>
          {/* Your Signature Section */}
          <Col lg={6} md={12} sm={12} xs={12} className="mb-4">
            <Card className="signature-card">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <PersonCheck size={20} className="me-2" />
                  Your Signature
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="signature-content">
                  {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="text-muted">Loading your current signature...</p>
                    </div>
                  ) : currentSignature ? (
                    <>
                      <div
                        style={{
                          width: '350px',
                          height: '200px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '8px',
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img 
                          src={currentSignature} 
                          alt="Current Signature" 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }} 
                        />
                      </div>
                      <p className="text-muted mt-3 text-center">
                        <small>Your current digital signature</small>
                      </p>
                    </>
                  ) : (
                    <div className="text-center text-muted">
                      <p>No signature configured yet</p>
                      <p className="small">Draw your signature on the right to get started</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Config Signature Drawing Section */}
          <Col lg={6} md={12} sm={12} xs={12} className="mb-4">
            <Card className="signature-card">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <PersonCheck size={20} className="me-2" />
                  Config Signature
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="signature-content">
                  <p className="text-muted mb-4 w-100 text-center">
                    Draw your signature in the box below using your mouse or touch device.
                  </p>
                  <div>
                    <SignaturePad
                      onSignatureChange={handleSignatureChange}
                      width={350}
                      height={200}
                    />
                  </div>
                </div>

                <div className="signature-buttons d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={handleBackToProfile}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveSignature}
                    disabled={!signatureDataUrl || saving}
                  >
                    {saving ? (
                      <>
                        <span 
                          className="spinner-border spinner-border-sm me-2" 
                          role="status" 
                          aria-hidden="true"
                          style={{ width: '0.75rem', height: '0.75rem', borderWidth: '0.15em' }}
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Save Signature
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ConfigureSignaturePage;

