import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { Person, Save } from 'react-bootstrap-icons';
import profileAPI from '../../api/profile';
import { toast } from 'react-toastify';

const PersonalInfoForm = ({ profileData, user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    avatarUrl: ''
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      const fullName = [profileData.firstName, profileData.middleName, profileData.lastName]
        .filter(Boolean)
        .join(' ');
      
      setPersonalInfo({
        fullName: fullName || '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        address: profileData.address || '',
        gender: profileData.gender || '',
        avatarUrl: profileData.avatarUrl || ''
      });
    } else if (user) {
      setPersonalInfo({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '',
        gender: '',
        avatarUrl: ''
      });
    }
  }, [profileData, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call parent update function if provided
      if (onUpdate) {
        await onUpdate(personalInfo);
      } else {
        // Fallback: call API directly if no parent handler
        await profileAPI.updateProfile(personalInfo);
        toast.success('Personal information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error('Failed to update personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center">
          <Person size={20} className="me-2 text-primary" />
          <h5 className="mb-0">Personal Information</h5>
        </div>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={personalInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={personalInfo.gender}
                  onChange={handleInputChange}
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
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-12 mb-3">
              <Form.Group>
                <Form.Label>Avatar URL</Form.Label>
                <Form.Control
                  type="url"
                  name="avatarUrl"
                  value={personalInfo.avatarUrl}
                  onChange={handleInputChange}
                  placeholder="Enter avatar image URL"
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="d-flex justify-content-end">
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={16} className="me-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PersonalInfoForm;
