import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import { X, Download, Printer, FileText } from 'react-bootstrap-icons';

const FormPreviewModal = ({ show, onHide, content, fileName }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print: ${fileName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .merge-field { 
              background: #e3f2fd; 
              color: #007bff; 
              padding: 2px 6px; 
              border-radius: 3px; 
              font-weight: bold; 
              border: 1px solid #bbdefb;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
            <h2>Preview: ${fileName}</h2>
            <p class="text-muted">This is how your form will look when printed or exported.</p>
          </div>
          <div>${content.replace(/\{\{([^}]+)\}\}/g, '<span class="merge-field">{{$1}}</span>')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    // Create a downloadable HTML file
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .merge-field { 
              background: #e3f2fd; 
              color: #007bff; 
              padding: 2px 6px; 
              border-radius: 3px; 
              font-weight: bold; 
              border: 1px solid #bbdefb;
            }
          </style>
        </head>
        <body>
          <h1>${fileName}</h1>
          <div>${content.replace(/\{\{([^}]+)\}\}/g, '<span class="merge-field">{{$1}}</span>')}</div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <FileText className="me-2" size={20} />
          Preview: {fileName}
        </Modal.Title>
        <Button variant="link" onClick={onHide} className="text-white p-0">
          <X size={20} />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        <div className="p-3">
          <div 
            className="border rounded p-3 bg-white"
            style={{ minHeight: '400px' }}
            dangerouslySetInnerHTML={{ 
              __html: content.replace(/\{\{([^}]+)\}\}/g, '<span style="background: #e3f2fd; color: #007bff; padding: 2px 6px; border-radius: 3px; font-weight: bold; border: 1px solid #bbdefb;">{{$1}}</span>') 
            }}
          />
        </div>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={handlePrint}>
          <Printer className="me-2" size={16} />
          Print
        </Button>
        <Button variant="primary-custom" onClick={handleDownload}>
          <Download className="me-2" size={16} />
          Download HTML
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormPreviewModal;
