import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const LoadingSkeleton = ({ rows = 5, columns = 4 }) => {
  const SkeletonRow = () => (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index}>
          <div 
            className="placeholder-glow"
            style={{ 
              height: '20px', 
              backgroundColor: 'var(--bs-neutral-200)',
              borderRadius: '4px',
              animation: 'placeholder-glow 2s ease-in-out infinite alternate'
            }}
          >
            <span className="placeholder col-12"></span>
          </div>
        </td>
      ))}
    </tr>
  );

  return (
    <Card className="border-neutral-200">
      <Card.Header className="bg-light-custom border-neutral-200">
        <div className="d-flex justify-content-between align-items-center">
          <div 
            className="placeholder-glow"
            style={{ 
              height: '24px', 
              width: '200px',
              backgroundColor: 'var(--bs-neutral-200)',
              borderRadius: '4px'
            }}
          >
            <span className="placeholder col-12"></span>
          </div>
          <div 
            className="placeholder-glow"
            style={{ 
              height: '32px', 
              width: '100px',
              backgroundColor: 'var(--bs-neutral-200)',
              borderRadius: '4px'
            }}
          >
            <span className="placeholder col-12"></span>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-neutral-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="border-neutral-200">
                    <div 
                      className="placeholder-glow"
                      style={{ 
                        height: '16px', 
                        backgroundColor: 'var(--bs-neutral-300)',
                        borderRadius: '4px'
                      }}
                    >
                      <span className="placeholder col-12"></span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoadingSkeleton;
