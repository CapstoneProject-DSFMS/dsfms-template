import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { ExclamationTriangle, X } from 'react-bootstrap-icons';
import { departmentAPI } from '../../../api/department';

const DisableDepartmentModal = ({ 
  show, 
  department, 
  onConfirm, 
  onCancel, 
  isProcessing 
}) => {
  const [statistics, setStatistics] = useState({
    courseCount: 0,
    traineeCount: 0,
    trainerCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch department statistics when modal opens
  useEffect(() => {
    if (show && department?.id) {
      fetchDepartmentStatistics();
    }
  }, [show, department?.id]);

  const fetchDepartmentStatistics = async () => {
    if (!department?.id) return;
    
    setLoadingStats(true);
    try {
      const response = await departmentAPI.getDepartmentById(department.id);
      console.log('🔍 DisableDepartmentModal - Statistics API response:', response);
      setStatistics({
        courseCount: response.courseCount || response.coursesCount || 0,
        traineeCount: response.traineeCount || response.traineesCount || 0,
        trainerCount: response.trainerCount || response.trainersCount || 0
      });
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      // Fallback to department data if API fails
      setStatistics({
        courseCount: department.courseCount || department.coursesCount || 0,
        traineeCount: department.traineeCount || department.traineesCount || 0,
        trainerCount: department.trainerCount || department.trainersCount || 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (!department) return null;


  const isDeactivating = department.status === 'ACTIVE';
  const actionText = isDeactivating ? 'deactivate' : 'activate';
  const actionTextCapitalized = isDeactivating ? 'Deactivate' : 'Activate';
  
  // Validation: Only allow deactivation if all statistics are 0
  const canDeactivate = !isDeactivating || (
    statistics.courseCount === 0 && 
    statistics.traineeCount === 0 && 
    statistics.trainerCount === 0
  );

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle className="me-2 text-warning" size={20} />
          {actionTextCapitalized} Department
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0">
        <Alert variant={isDeactivating ? 'warning' : 'info'} className="mb-3" style={{ backgroundColor: '#e3f2fd', borderColor: '#1b3c53', color: '#1b3c53' }}>
          <div className="d-flex align-items-start">
            <div>
              <strong>Are you sure you want to {actionText} this department?</strong>
              <div className="mt-2">
                <strong>Department:</strong> {department.name} ({department.code})
              </div>
              {isDeactivating && (
                <div className="mt-2">
                  {!canDeactivate ? (
                    <div className="text-danger">
                      <strong>Cannot deactivate:</strong> This department has active courses, trainees, or trainers. 
                      Please remove all courses, trainees, and trainers before deactivating.
                    </div>
                  ) : (
                    <>
                      <strong>Warning:</strong> Deactivating this department will:
                      <ul className="mb-0 mt-1">
                        <li>Make it unavailable for new course assignments</li>
                        <li>Hide it from department selection dropdowns</li>
                        <li>Not affect existing courses and users</li>
                      </ul>
                    </>
                  )}
                </div>
              )}
              {!isDeactivating && (
                <div className="mt-2">
                  <strong>Note:</strong> Activating this department will make it available for:
                  <ul className="mb-0 mt-1">
                    <li>New course assignments</li>
                    <li>Department selection in forms</li>
                    <li>User management operations</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Alert>

        <div className="bg-light p-4 rounded">
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex flex-column">
                <strong className="mb-1">Department Head:</strong>
                <span className="text-muted text-break">
                  {department.departmentHead?.name || department.departmentHead?.email || 'N/A'}
                </span>
              </div>
            </div>
            <div className="col-12">
              <div className="d-flex flex-column">
                <strong className="mb-1">Current Status:</strong>
                <span className={`badge ${
                  department.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'
                }`} style={{ width: 'fit-content', backgroundColor: department.status === 'ACTIVE' ? '#28a745' : '#1b3c53' }}>
                  {department.status}
                </span>
              </div>
            </div>
          </div>
          
          <hr className="my-3" />
          
          <div className="row g-3">
            <div className="col-4">
              <div className="text-center">
                {loadingStats ? (
                  <Spinner animation="border" size="sm" className="text-primary" style={{ width: '1rem', height: '1rem' }} />
                ) : (
                  <div className="h5 mb-1" style={{ color: '#1b3c53' }}>{statistics.courseCount}</div>
                )}
                <small className="text-muted">Courses</small>
              </div>
            </div>
            <div className="col-4">
              <div className="text-center">
                {loadingStats ? (
                  <Spinner animation="border" size="sm" className="text-primary" style={{ width: '1rem', height: '1rem' }} />
                ) : (
                  <div className="h5 mb-1" style={{ color: '#1b3c53' }}>{statistics.traineeCount}</div>
                )}
                <small className="text-muted">Trainees</small>
              </div>
            </div>
            <div className="col-4">
              <div className="text-center">
                {loadingStats ? (
                  <Spinner animation="border" size="sm" className="text-primary" style={{ width: '1rem', height: '1rem' }} />
                ) : (
                  <div className="h5 mb-1" style={{ color: '#1b3c53' }}>{statistics.trainerCount}</div>
                )}
                <small className="text-muted">Trainers</small>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        <Button
          variant={isDeactivating ? 'warning' : 'success'}
          onClick={onConfirm}
          disabled={isProcessing || (isDeactivating && !canDeactivate)}
          style={{ 
            backgroundColor: isDeactivating ? '#ffc107' : '#28a745',
            borderColor: isDeactivating ? '#ffc107' : '#28a745',
            opacity: (isDeactivating && !canDeactivate) ? 0.5 : 1
          }}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem' }}></span>
              Processing...
            </>
          ) : (
            <>
              <ExclamationTriangle className="me-2" size={16} />
              {isDeactivating && !canDeactivate ? 'Cannot Deactivate' : `${actionTextCapitalized} Department`}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisableDepartmentModal;
