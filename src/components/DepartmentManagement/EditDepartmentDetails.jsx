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
    code: department.code || '',
    description: department.description || '',
    headUserId: department.headUserId || ''
  });
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    const loadDepartmentHeads = async () => {
      try {
        // Call API to get all department heads
        const response = await departmentAPI.getDepartmentHeads();
        const heads = response?.users || response?.data?.users || [];
        setAvailableUsers(heads);
      } catch (error) {
        console.error('Error loading department heads:', error);
        toast.error('Failed to load department heads');
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
      // Validate form data
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Department name is required');
        setLoading(false);
        return;
      }

      if (!formData.code || formData.code.trim() === '') {
        toast.error('Department code is required');
        setLoading(false);
        return;
      }

      console.log('📝 Submitting department update:', {
        departmentId: department.id,
        formData: formData
      });

      const response = await departmentAPI.updateDepartment(department.id, formData);
      
      // Transform response to match expected format
      const transformedDepartment = transformDepartmentData(response);
      onUpdate(transformedDepartment);
      toast.success('Department updated successfully!');
    } catch (err) {
      console.error('❌ Error updating department:', err);
      
      // Show more specific error messages
      let errorMessage = 'Failed to update department';
      
      if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
      } else if (err.code === 'BAD_GATEWAY') {
        errorMessage = 'Server error (502): The server is temporarily unavailable. Please try again later.';
      } else if (err.code === 'PERMISSION_DENIED') {
        errorMessage = 'Permission denied: You do not have permission to update this department.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
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
              <label htmlFor="code" className="form-label">Department Code</label>
              <input
                type="text"
                className="form-control"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CCT"
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
                    [{user.eid}] - {user.lastName}{user.middleName ? ' ' + user.middleName : ''} {user.firstName}
                  </option>
                ))}
              </select>
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
