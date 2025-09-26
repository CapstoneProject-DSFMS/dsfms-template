import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Envelope, X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/api';

const ForgotPasswordModal = ({ show, onHide }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          magicLink: "https://capstoneproject-dsfms.github.io/dsfms-template/reset-password/"
        }),
      });

      // Check if response is ok first
      if (!response.ok) {
        if (response.status === 405) {
          setError('Forgot password feature is not available on this server. Please contact support.');
        } else if (response.status === 404) {
          setError('Forgot password endpoint not found. Please contact support.');
        } else {
          setError(`Server error (${response.status}). Please try again later.`);
        }
        return;
      }

      // Try to parse JSON response
      try {
        await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        setError('Server returned invalid response. Please try again later.');
        return;
      }

      // Success case
      toast.success('Password reset link has been sent to your email!');
      setEmail('');
      onHide();
      
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="border-0 pb-0" style={{ background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-secondary) 100%)' }}>
        <Modal.Title className="d-flex align-items-center text-white">
          <Envelope className="me-2" size={20} />
          Forgot Password
        </Modal.Title>
        <Button
          variant="link"
          onClick={handleClose}
          className="p-0 ms-auto"
          style={{ 
            fontSize: '1.5rem', 
            lineHeight: 1,
            color: 'white',
            filter: 'brightness(1.2)'
          }}
        >
          <X />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        <p className="text-muted mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label style={{ color: 'var(--bs-primary)', fontWeight: '600' }}>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="py-3 border-0 rounded-3"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--bs-neutral-200)',
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(27, 60, 83, 0.1)'
              }}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !email.trim()}
              className="py-3 fw-bold rounded-3"
              style={{
                background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-secondary) 100%)',
                border: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(27, 60, 83, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(27, 60, 83, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(27, 60, 83, 0.3)';
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleClose}
              disabled={loading}
              className="py-3 rounded-3"
              style={{
                border: '2px solid var(--bs-neutral-300)',
                color: 'var(--bs-primary)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bs-neutral-100)';
                e.target.style.borderColor = 'var(--bs-primary)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                e.target.style.borderColor = 'var(--bs-neutral-300)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;
