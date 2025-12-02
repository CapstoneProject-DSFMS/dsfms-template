import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Pen, X, Save, ArrowClockwise } from 'react-bootstrap-icons';

const SignaturePad = ({ show, onClose, onSave, documentName, loading = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      // Reset signature when modal opens
      setHasSignature(false);
      setError('');
      clearCanvas();
    }
  }, [show]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = async () => {
    if (!hasSignature) {
      setError('Please provide your signature before saving');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');
      
      await onSave({
        documentName,
        signature: signatureData,
        timestamp: new Date().toISOString()
      });
      
      onClose();
    } catch (error) {
      setError('Failed to save signature. Please try again.');
    }
  };

  const handleClose = () => {
    clearCanvas();
    setError('');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Pen className="me-2" size={20} />
          Digital Signature
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="text-center mb-4">
          <h5>Sign Document: {documentName}</h5>
          <p className="text-muted">
            Please sign in the box below using your mouse or touch device
          </p>
        </div>

        <div className="signature-container border rounded p-3 mb-3">
          <canvas
            ref={canvasRef}
            width={250}
            height={150}
            className="border rounded w-100"
            style={{ 
              cursor: 'crosshair',
              touchAction: 'none'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              startDrawing(mouseEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              draw(mouseEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <Button 
            variant="outline-secondary" 
            onClick={clearCanvas}
            disabled={loading}
          >
            <ArrowClockwise className="me-2" size={16} />
            Clear
          </Button>
          
          <div className="text-muted small">
            {hasSignature ? (
              <span className="text-success">✓ Signature captured</span>
            ) : (
              <span>Please sign above</span>
            )}
          </div>
        </div>

        <div className="mt-3 p-3 bg-light rounded">
          <h6 className="mb-2">Signature Guidelines:</h6>
          <ul className="mb-0 small text-muted">
            <li>Sign within the designated area</li>
            <li>Use your full legal signature</li>
            <li>Ensure the signature is clear and readable</li>
            <li>Click "Clear" to start over if needed</li>
          </ul>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
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
          disabled={loading || !hasSignature}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <Save className="me-2" size={16} />
              Save Signature
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SignaturePad;
