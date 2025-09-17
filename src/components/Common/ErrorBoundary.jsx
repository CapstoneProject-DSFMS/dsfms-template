import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useRouteError, useNavigate } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const getErrorMessage = (error) => {
    if (error?.status === 404) {
      return {
        title: "404 - Page Not Found",
        message: "The page you're looking for doesn't exist.",
        suggestion: "Check the URL or go back to the dashboard."
      };
    }
    
    if (error?.status === 403) {
      return {
        title: "403 - Access Denied",
        message: "You don't have permission to access this page.",
        suggestion: "Contact your administrator for access."
      };
    }
    
    return {
      title: "Something went wrong",
      message: error?.message || "An unexpected error occurred.",
      suggestion: "Please try refreshing the page or contact support."
    };
  };

  const errorInfo = getErrorMessage(error);

  const handleGoHome = () => {
    // Get basename dynamically
    const getBasename = () => {
      if (import.meta.env.DEV) {
        return "/dsfms-template";
      }
      const pathname = window.location.pathname;
      if (pathname.includes('/dsfms-template')) {
        return "/dsfms-template";
      }
      return "/";
    };
    
    navigate(getBasename() + '/admin');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container fluid className="py-5">
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <h1 className="display-1 text-muted">😵</h1>
            <h2 className="text-primary-custom mb-3">{errorInfo.title}</h2>
            <p className="text-muted mb-4">{errorInfo.message}</p>
            <p className="small text-muted">{errorInfo.suggestion}</p>
          </div>
          
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant="primary" 
              onClick={handleGoHome}
              className="px-4"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={handleGoBack}
              className="px-4"
            >
              Go Back
            </Button>
          </div>
          
          {import.meta.env.DEV && error && (
            <Alert variant="danger" className="mt-4 text-start">
              <Alert.Heading>Debug Information</Alert.Heading>
              <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
                {JSON.stringify(error, null, 2)}
              </pre>
            </Alert>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ErrorBoundary;
