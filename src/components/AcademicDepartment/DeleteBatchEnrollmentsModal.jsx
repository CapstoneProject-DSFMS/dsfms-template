import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { X, Trash, People, Book } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import courseAPI from '../../api/course';

const DeleteBatchEnrollmentsModal = ({ show, onClose, courseId, onSuccess }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedBatchCode, setSelectedBatchCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && courseId) {
      loadBatches();
    } else {
      // Reset state when modal closes
      setBatches([]);
      setSelectedBatchCode(null);
      setError(null);
    }
  }, [show, courseId]);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseAPI.getCourseEnrollmentBatches(courseId);
      const batchesData = response?.batches || response?.data?.batches || [];
      setBatches(batchesData);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load batches';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBatchCode) {
      toast.error('Please select a batch to delete');
      return;
    }

    const selectedBatch = batches.find(b => b.batchCode === selectedBatchCode);
    if (!selectedBatch) {
      toast.error('Selected batch not found');
      return;
    }

    setDeleting(true);
    try {
      await courseAPI.deleteBatchEnrollments(courseId, selectedBatchCode);
      toast.success(`Successfully deleted all enrollments for batch "${selectedBatchCode}"`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete batch enrollments';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (statusCounts) => {
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return <Badge bg="secondary">No enrollments</Badge>;
    
    const activeCount = statusCounts.ENROLLED + statusCounts.ON_GOING;
    if (activeCount > 0) {
      return <Badge bg="success">{activeCount} Active</Badge>;
    }
    return <Badge bg="secondary">All Cancelled</Badge>;
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header className="bg-danger text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Trash className="me-2" size={20} />
          Delete All Subject Enrollments by Batch Code
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ minHeight: '400px', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading batches...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" size="sm" onClick={loadBatches}>
              Try Again
            </Button>
          </Alert>
        ) : batches.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No batches found for this course.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Alert variant="warning" className="mb-3" style={{ flexShrink: 0 }}>
              <strong>Warning:</strong> This action will permanently delete all subject enrollments for the selected batch. This cannot be undone.
            </Alert>

            <div className="mb-3" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <h6 className="mb-3" style={{ flexShrink: 0 }}>Select a batch to delete:</h6>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <Table hover responsive>
                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Batch Code</th>
                      <th>Trainees</th>
                      <th>Active</th>
                      <th>Subjects</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr
                        key={batch.batchCode}
                        onClick={() => setSelectedBatchCode(batch.batchCode)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedBatchCode === batch.batchCode ? '#e7f3ff' : 'transparent'
                        }}
                      >
                        <td>
                          <input
                            type="radio"
                            name="batchSelection"
                            checked={selectedBatchCode === batch.batchCode}
                            onChange={() => setSelectedBatchCode(batch.batchCode)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          <strong>{batch.batchCode}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <People size={14} className="me-1 text-muted" />
                            <span>{batch.totalTrainees}</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg="success">{batch.activeTrainees}</Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Book size={14} className="me-1 text-muted" />
                            <span>{batch.subjects?.length || 0}</span>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(batch.statusCounts)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <div 
              className="mt-3 p-3 bg-light rounded" 
              style={{ 
                minHeight: '120px', 
                maxHeight: '180px', 
                overflowY: 'auto',
                flexShrink: 0
              }}
            >
              {selectedBatchCode ? (
                <>
                  <h6 className="mb-2">Selected Batch Details:</h6>
                  {(() => {
                    const selectedBatch = batches.find(b => b.batchCode === selectedBatchCode);
                    if (!selectedBatch) return null;
                    
                    return (
                      <div>
                        <p className="mb-2">
                          <strong>Batch Code:</strong> {selectedBatch.batchCode}
                        </p>
                        <p className="mb-2">
                          <strong>Total Trainees:</strong> {selectedBatch.totalTrainees} 
                          {' '}(<Badge bg="success" className="ms-1">{selectedBatch.activeTrainees} Active</Badge>)
                        </p>
                        <p className="mb-2">
                          <strong>Subjects:</strong> {selectedBatch.subjects?.length || 0}
                        </p>
                        {selectedBatch.subjects && selectedBatch.subjects.length > 0 && (
                          <div className="mt-2">
                            <strong>Subject Details:</strong>
                            <ul className="mt-2 mb-0">
                              {selectedBatch.subjects.map((subject) => (
                                <li key={subject.subjectId}>
                                  {subject.subjectCode} - {subject.subjectName} 
                                  {' '}({subject.activeTrainees}/{subject.totalTrainees} active)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-muted" style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                  <span>No batch selected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button variant="outline-secondary" onClick={onClose} disabled={deleting}>
          <X className="me-2" size={16} />
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={!selectedBatchCode || deleting || loading || batches.length === 0}
        >
          {deleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            <>
              <Trash className="me-2" size={16} />
              Delete Enrollments
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteBatchEnrollmentsModal;

