import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      setError('Password confirmation does not match')
      return
    }
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setSuccess('Registration successful! You can login now.')
      setForm({ fullName: '', email: '', password: '', confirm: '' })
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex position-relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px)',
          zIndex: -1
        }}
      />
      
      {/* Overlay */}
      <div 
        className="position-absolute w-100 h-100"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 0
        }}
      />

      {/* Content */}
      <Container fluid className="position-relative" style={{ zIndex: 1 }}>
        <Row className="min-vh-100">
          {/* Left Side - Promotional Content */}
          <Col lg={6} className="d-flex align-items-center justify-content-center p-5">
            <div className="text-white text-start" style={{ maxWidth: '500px' }}>
              {/* Travel Icon with dashed line */}
              <div className="d-flex align-items-center mb-4">
                <div className="dashed-line me-3"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V14L13 9V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="white"/>
                </svg>
              </div>
              
              <div className="mb-2" style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9 }}>TRAVEL</div>
              <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: '1.1' }}>
                EXPLORE<br />HORIZONS
              </h1>
              <p className="fs-5 mb-3" style={{ opacity: 0.9 }}>
                Where Your Dream Destinations Become Reality.
              </p>
              <p className="fs-6" style={{ opacity: 0.8 }}>
                Embark on a journey where every corner of the world is within your reach.
              </p>
            </div>
          </Col>

          {/* Right Side - Register Form */}
          <Col lg={6} className="d-flex align-items-center justify-content-center p-5">
            <div 
              className="w-100"
              style={{ 
                maxWidth: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                padding: '2.5rem'
              }}
            >
              {error && (
                <Alert variant="danger" className="py-2 mb-3">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="py-2 mb-3">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label className="text-white fw-medium">Full Name</Form.Label>
                  <Form.Control
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="bg-white border-0 rounded-3 py-3"
                    style={{ fontSize: '1rem' }}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="text-white fw-medium">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="bg-white border-0 rounded-3 py-3"
                    style={{ fontSize: '1rem' }}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label className="text-white fw-medium">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="bg-white border-0 rounded-3 py-3"
                    style={{ fontSize: '1rem' }}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirm">
                  <Form.Label className="text-white fw-medium">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="bg-white border-0 rounded-3 py-3"
                    style={{ fontSize: '1rem' }}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-3 fw-bold rounded-3 mb-4"
                  style={{ 
                    fontSize: '1.1rem'
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" /> CREATING ACCOUNT...
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </Button>

                <div className="text-center mb-4">
                  <div className="d-flex align-items-center">
                    <hr className="flex-grow-1 text-white-50" />
                    <span className="mx-3 text-white-50">or</span>
                    <hr className="flex-grow-1 text-white-50" />
                  </div>
                </div>

                <Button
                  variant="light"
                  className="w-100 py-3 rounded-3 mb-4 d-flex align-items-center justify-content-center"
                  style={{ fontSize: '1rem' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="me-2">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Button>

                <div className="text-center">
                  <span className="text-white-50">Already have an account? </span>
                  <Button 
                    variant="link" 
                    className="p-0 text-white text-decoration-underline fw-medium"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Custom Styles */}
      <style>{`
        .dashed-line {
          width: 60px;
          height: 2px;
          background: repeating-linear-gradient(
            to right,
            white 0px,
            white 8px,
            transparent 8px,
            transparent 16px
          );
        }
      `}</style>
    </div>
  )
}

export default Register


