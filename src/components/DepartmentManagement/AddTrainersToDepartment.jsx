import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { PersonPlus } from 'react-bootstrap-icons';
import AssignedTrainersTable from './AssignedTrainersTable';
import AddTrainersModal from './AddTrainersModal';

const AddTrainersToDepartment = ({ department, onDepartmentUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Get trainers from department data
  const assignedTrainers = department?.trainers || [];

  const handleTrainersAdded = () => {
    // Refresh department data
    if (onDepartmentUpdate) {
      onDepartmentUpdate();
    }
  };

  return (
    <div>
      {/* Assigned Trainers Table - Default view */}
      <AssignedTrainersTable 
        trainers={assignedTrainers}
        loading={false}
        showAddButton={true}
        onAddClick={() => setShowAddModal(true)}
      />

      {/* Add Trainers Modal */}
      <AddTrainersModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        departmentId={department?.id}
        assignedTrainers={assignedTrainers}
        onTrainersAdded={handleTrainersAdded}
      />
    </div>
  );
};

export default AddTrainersToDepartment;