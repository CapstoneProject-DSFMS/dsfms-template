import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { X, Trash, People, Book } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import courseAPI from '../../api/course';

const DeleteBatchEnrollmentsModal = ({ show, onClose, courseId, onSuccess }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedBatchCodes, setSelectedBatchCodes] = useState([]);
  const [error, setError] = useState(null);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseAPI.getCourseEnrollmentBatches(courseId);
      let batchesData = response?.batches || response?.data?.batches || [];
      
      // Filter out batches with "All Cancelled" status (no active enrollments)
      batchesData = batchesData.filter(batch => {
        const statusCounts = batch.statusCounts || {};
        const activeCount = (statusCounts.ENROLLED || 0) + (statusCounts.ON_GOING || 0);
        return activeCount > 0; // Only show batches with at least one active enrollment
      });
      
      setBatches(batchesData);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load batches';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (show && courseId) {
      loadBatches();
    } else {
      // Reset state when modal closes
      setBatches([]);
      setSelectedBatchCodes([]);
      setError(null);
    }
  }, [show, courseId, loadBatches]);

  const handleBatchToggle = (batchCode) => {
    setSelectedBatchCodes(prev => {
      if (prev.includes(batchCode)) {
        return prev.filter(code => code !== batchCode);
      } else {
        return [...prev, batchCode];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBatchCodes.length === batches.length) {
      setSelectedBatchCodes([]);
    } else {
      setSelectedBatchCodes(batches.map(b => b.batchCode));
    }
  };

  const handleDelete = async () => {
    if (selectedBatchCodes.length === 0) {
      toast.error('Please select at least one batch to delete');
      return;
    }

    setDeleting(true);
    try {
      // Delete batches sequentially to avoid overwhelming the server
      const deletePromises = selectedBatchCodes.map(batchCode => 
        courseAPI.deleteBatchEnrollments(courseId, batchCode)
      );
      
      await Promise.all(deletePromises);
      
      const batchCount = selectedBatchCodes.length;
      toast.success(`Successfully deleted all enrollments for ${batchCount} batch(es)`);
      
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
    
    const activeCount = (statusCounts.ENROLLED || 0) + (statusCounts.ON_GOING || 0);
    if (activeCount > 0) {
      return <Badge bg="success">{activeCount} Active</Badge>;
    }
    return <Badge bg="secondary">All Cancelled</Badge>;
  };

  const selectedBatches = batches.filter(b => selectedBatchCodes.includes(b.batchCode));

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header className="bg-danger text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Trash className="me-2" size={20} />
          Delete All Subject Enrollments by Batch Code
        </Modal.Title>
      </Modal.Header>

      <Modal.Body 
        className="p-4" 
        style={{ 
          height: '450px', 
          overflowY: 'auto',
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
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
            <p className="text-muted">No batches with active enrollments found for this course.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Alert variant="warning" className="mb-3" style={{ flexShrink: 0 }}>
              <strong>Warning:</strong> This action will permanently delete all subject enrollments for the selected batch(es). This cannot be undone.
            </Alert>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexShrink: 0 }}>
                <h6 className="mb-0">Select batch(es) to delete:</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedBatchCodes.length === batches.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table hover responsive>
                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={selectedBatchCodes.length === batches.length && batches.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Batch Code</th>
                      <th>Trainees</th>
                      <th>Active</th>
                      <th>Subjects</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => {
                      const isSelected = selectedBatchCodes.includes(batch.batchCode);
                      return (
                        <tr
                          key={batch.batchCode}
                          onClick={() => handleBatchToggle(batch.batchCode)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#e7f3ff' : 'transparent'
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleBatchToggle(batch.batchCode)}
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
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>

            <div 
              className="mt-3 p-3 bg-light rounded" 
              style={{ 
                minHeight: '120px', 
                maxHeight: '150px', 
                overflowY: 'auto',
                flexShrink: 0
              }}
            >
              {selectedBatchCodes.length > 0 ? (
                <>
                  <h6 className="mb-2">
                    Selected Batch Details ({selectedBatchCodes.length}):
                  </h6>
                  <div>
                    {selectedBatches.map((batch) => (
                      <div key={batch.batchCode} className="mb-3 pb-3 border-bottom">
                        <p className="mb-1">
                          <strong>Batch Code:</strong> {batch.batchCode}
                        </p>
                        <p className="mb-1">
                          <strong>Total Trainees:</strong> {batch.totalTrainees} 
                          {' '}(<Badge bg="success" className="ms-1">{batch.activeTrainees} Active</Badge>)
                        </p>
                        <p className="mb-1">
                          <strong>Subjects:</strong> {batch.subjects?.length || 0}
                        </p>
                        {batch.subjects && batch.subjects.length > 0 && (
                          <div className="mt-1">
                            <strong>Subject Details:</strong>
                            <ul className="mt-1 mb-0" style={{ fontSize: '0.875rem' }}>
                              {batch.subjects.map((subject) => (
                                <li key={subject.subjectId}>
                                  {subject.subjectCode} - {subject.subjectName} 
                                  {' '}({subject.activeTrainees}/{subject.totalTrainees} active)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-muted" style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                  <span>No batches selected</span>
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
          disabled={selectedBatchCodes.length === 0 || deleting || loading || batches.length === 0}
        >
          {deleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            <>
              <Trash className="me-2" size={16} />
              Delete Enrollments ({selectedBatchCodes.length})
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteBatchEnrollmentsModal;
