import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { Person, Save } from 'react-bootstrap-icons';
import profileAPI from '../../api/profile';
import { toast } from 'react-toastify';

const PersonalInfoForm = ({ profileData, user, onUpdate, loading = false }) => {
  const [formLoading, setFormLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    avatarUrl: ''
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Update form when profile data changes
  useEffect(() => {
    if (profileData && profileData.firstName) {
      const newPersonalInfo = {
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        middleName: profileData.middleName || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        gender: profileData.gender || '',
        avatarUrl: profileData.avatarUrl || ''
      };
      setPersonalInfo(newPersonalInfo);
      setIsInitialized(true);
    }
  }, [profileData, isInitialized]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (onUpdate) {
        await onUpdate(personalInfo);
      } else {
        await profileAPI.updateProfile(personalInfo);
        toast.success('Personal information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      if (!onUpdate) {
        toast.error('Failed to update personal information. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header className="bg-primary text-white border-0">
        <div className="d-flex align-items-center">
          <Person size={20} className="me-2 text-white" />
          <h5 className="mb-0 text-white">Personal Information</h5>
        </div>
      </Card.Header>
      <Card.Body>
    
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handleInputChange}
                  disabled={true}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Middle Name</Form.Label>
                <Form.Control
                  type="text"
                  name="middleName"
                  value={personalInfo.middleName}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </Form.Group>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handleInputChange}
                  disabled={true}
                  required
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                  disabled={true}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={personalInfo.phoneNumber}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={personalInfo.gender}
                  onChange={handleInputChange}
                  disabled={true}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-12 mb-3">
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={personalInfo.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  disabled={true}
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PersonalInfoForm;
