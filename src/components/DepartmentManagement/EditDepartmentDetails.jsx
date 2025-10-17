import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../api';

// Helper function to transform API data to expected format
const transformDepartmentData = (response) => {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    headUserId: response.headUserId,
    headUser: response.headUser,
    isActive: response.isActive,
    courseCount: response.courseCount || 0,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    deletedAt: response.deletedAt
  };
};

const EditDepartmentDetails = ({ department, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: department.name || '',
    description: department.description || '',
    headUserId: department.headUserId || ''
  });
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    const loadDepartmentHeads = async () => {
      try {
        const response = await departmentAPI.getDepartmentHeads();
        // Ensure response is an array
        const users = Array.isArray(response) ? response : (response.data || response.users || []);
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error loading department heads:', error);
        toast.error('Failed to load department heads');
        // Fallback to empty array if API fails
        setAvailableUsers([]);
      }
    };

    loadDepartmentHeads();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await departmentAPI.updateDepartment(department.id, formData);
      // Transform response to match expected format
      const transformedDepartment = transformDepartmentData(response);
      onUpdate(transformedDepartment);
      toast.success('Department updated successfully!');
    } catch (err) {
      console.error('Error updating department:', err);
      toast.error('Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Edit Department Details</h4>

      <form onSubmit={handleSubmit}>
        <Row>
          <Col md={12}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Department Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <div className="mb-3">
              <label htmlFor="headUserId" className="form-label">Department Head</label>
              <select
                className="form-select"
                id="headUserId"
                name="headUserId"
                value={formData.headUserId}
                onChange={handleInputChange}
              >
                <option value="">Select Department Head</option>
                {Array.isArray(availableUsers) && availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    [{user.eid}] - {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              {formData.headUserId && (() => {
                const selectedUser = Array.isArray(availableUsers) ? availableUsers.find(u => u.id === formData.headUserId) : null;
                return selectedUser ? (
                  <div className="form-text">
                    Current selection: [{selectedUser.eid}] - {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                ) : null;
              })()}
            </div>
          </Col>
        </Row>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="d-flex gap-2">
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Department'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartmentDetails;
