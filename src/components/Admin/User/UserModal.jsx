import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { X, Save, Eye } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { roleAPI } from '../../../api/role';
import { userAPI } from '../../../api/user';

const UserModal = ({ show, user, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    email: '',
    phoneNumber: '',
    role: '',
    roleId: '',
    certificationNumber: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    dateOfBirth: '',
    trainingBatch: '',
    passportNo: '',
    nation: '',
    department: ''
  });

  // DEBUG: Log user prop
  console.log('🔍 DEBUG UserModal: user prop received:', user);
  if (user?.traineeProfile) {
    console.log('   traineeProfile:', user.traineeProfile);
    console.log('   traineeProfile.dob:', user.traineeProfile.dob);
    console.log('   traineeProfile.nation:', user.traineeProfile.nation);
    console.log('   traineeProfile.trainingBatch:', user.traineeProfile.trainingBatch);
  }
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // ✅ Helper: Normalize field values (convert "N/A" and empty strings)
  const normalizeField = (value) => {
    if (!value || value === 'N/A' || value === 'null' || value === 'undefined') {
      return '';
    }
    return String(value).trim();
  };

  // Format role name: remove underscores and capitalize words
  const formatRoleName = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const rolesData = await roleAPI.getRoles();
      
      // Extract roles array from response
      const rolesArray = rolesData?.roles || rolesData || [];
      
      // Transform to simple array of role names
      const roleNames = rolesArray.map(role => role.name);
      setRoles(roleNames);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
      // Fallback to empty array
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };
  const nations = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan',
    'Kazakhstan', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Myanmar',
    'Nepal', 'Netherlands', 'New Zealand', 'Norway', 'Oman', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
    'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uzbekistan',
    'Vietnam', 'Yemen'
  ];


  // Fetch roles when modal opens
  useEffect(() => {
    if (show) {
      fetchRoles();
    }
  }, [show]);

  useEffect(() => {
    if (user && mode !== 'add') {
      // ✅ Extract role name (from role object or string)
      const roleName = typeof user.role === 'string' ? user.role : (user.role?.name || '');
      
      // ✅ Initialize base data with normalization
      let formDataToSet = {
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: roleName,
        roleId: user.roleId || '',
        department: normalizeField(user.department),  // ✅ Normalize "N/A" → ""
        certificationNumber: '',
        specialization: '',
        yearsOfExperience: '',
        bio: '',
        dateOfBirth: '',
        trainingBatch: '',
        passportNo: '',
        nation: ''
      };

      // ✅ Load TRAINEE-specific data from traineeProfile
      if (roleName === 'TRAINEE' && user.traineeProfile) {
        console.log('✅ traineeProfile found:', user.traineeProfile);
        
        formDataToSet.dateOfBirth = user.traineeProfile.dob ? user.traineeProfile.dob.split('T')[0] : '';
        formDataToSet.passportNo = normalizeField(user.traineeProfile.passportNo);
        formDataToSet.nation = normalizeField(user.traineeProfile.nation);
        formDataToSet.trainingBatch = normalizeField(user.traineeProfile.trainingBatch);
        
        console.log('✅ DEBUG: Loaded TRAINEE profile data:');
        console.log('   dob raw:', user.traineeProfile.dob);
        console.log('   dateOfBirth after split:', formDataToSet.dateOfBirth);
        console.log('   nation raw:', user.traineeProfile.nation);
        console.log('   nation after normalize:', formDataToSet.nation);
        console.log('   trainingBatch raw:', user.traineeProfile.trainingBatch);
        console.log('   trainingBatch after normalize:', formDataToSet.trainingBatch);
        console.log('   passportNo:', formDataToSet.passportNo);
      }

      // ✅ Load TRAINER-specific data from trainerProfile
      if (roleName === 'TRAINER' && user.trainerProfile) {
        formDataToSet.specialization = normalizeField(user.trainerProfile.specialization);  // ✅ Normalize
        formDataToSet.certificationNumber = normalizeField(user.trainerProfile.certificationNumber);  // ✅ Normalize
        formDataToSet.yearsOfExperience = user.trainerProfile.yearsOfExperience || '';
        formDataToSet.bio = normalizeField(user.trainerProfile.bio);  // ✅ Normalize
        
        console.log('✅ DEBUG: Loaded TRAINER profile data:');
        console.log('   specialization:', formDataToSet.specialization);
        console.log('   certificationNumber:', formDataToSet.certificationNumber);
        console.log('   bio:', formDataToSet.bio);
      }

      // ✅ Fallback: Try to load from root level (for backward compatibility)
      if (!formDataToSet.specialization && user.specialization) {
        formDataToSet.specialization = normalizeField(user.specialization);  // ✅ Normalize
      }
      if (!formDataToSet.certificationNumber && user.certificationNumber) {
        formDataToSet.certificationNumber = normalizeField(user.certificationNumber);  // ✅ Normalize
      }
      if (!formDataToSet.bio && user.bio) {
        formDataToSet.bio = normalizeField(user.bio);  // ✅ Normalize
      }
      if (!formDataToSet.passportNo && user.passportNo) {
        formDataToSet.passportNo = normalizeField(user.passportNo);  // ✅ Normalize
      }

      setFormData(formDataToSet);
      
      console.log('🔍 DEBUG: Final formData loaded:');
      console.log('   Role:', formDataToSet.role);
      console.log('   Department:', formDataToSet.department, '(should be empty string if was N/A)');
      console.log('   DateOfBirth:', formDataToSet.dateOfBirth, '(ISO format YYYY-MM-DD)');
      console.log('   Nation:', formDataToSet.nation);
      console.log('   PassportNo:', formDataToSet.passportNo);
      console.log('   TrainingBatch:', formDataToSet.trainingBatch);
      console.log('   All fields:', formDataToSet);
    } else if (mode === 'add') {
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        email: '',
        phoneNumber: '',
        role: '',
        roleId: '',
        certificationNumber: '',
        specialization: '',
        yearsOfExperience: '',
        bio: '',
        dateOfBirth: '',
        trainingBatch: '',
        passportNo: '',
        nation: '',
        department: ''
      });
    }
    setErrors({});
  }, [user, mode, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêôáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêôáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    if (formData.middleName.trim() && !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêôáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ\s]+$/.test(formData.middleName.trim())) {
      newErrors.middleName = 'Middle name can only contain letters and spaces';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[0-9\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number cannot contain letters';
    } else {
      // Remove all non-digit characters except + at the beginning
      const cleanPhone = formData.phoneNumber.replace(/[^\d+]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 16) {
        newErrors.phoneNumber = 'Phone number must be 7-16 digits';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Department head validation - department is optional (nullable)

    // Role-specific validation
    if (formData.role === 'TRAINER') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required for trainers';
      }
      if (!formData.certificationNumber.trim()) {
        newErrors.certificationNumber = 'Certification number is required for trainers';
      }
      if (!formData.bio || !formData.bio.trim()) {
        newErrors.bio = 'Bio is required for trainers';
      } else if (formData.bio.trim().length < 1) {
        newErrors.bio = 'Bio must be at least 1 character';
      }
      // ✅ Department is NOT allowed for Trainer role - only check if not empty
      if (formData.department && formData.department.trim() !== '') {
        newErrors.department = 'Department is not allowed for Trainer role';
      }
    }
    
    if (formData.role === 'TRAINEE') {
      if (!formData.trainingBatch.trim()) {
        newErrors.trainingBatch = 'Training batch is required for trainees';
      }
      if (!formData.passportNo.trim()) {
        newErrors.passportNo = 'Passport number is required for trainees';
      }
      if (!formData.dateOfBirth.trim()) {
        newErrors.dateOfBirth = 'Date of birth is required for trainees';
      } else {
        // Check if date format is correct (YYYY-MM-DD)
        if (formData.dateOfBirth.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
          newErrors.dateOfBirth = 'Please enter date in YYYY-MM-DD format';
        } else {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          if (birthDate >= today) {
            newErrors.dateOfBirth = 'Date of birth must be in the past';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      // Error handling is done in the parent component
      console.error('Error in handleSubmit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev };
      
      // Clear the current field error
      if (newErrors[field]) {
        delete newErrors[field];
      }
      
      // Clear role-specific errors when role changes
      if (field === 'role') {
        delete newErrors.specialization;
        delete newErrors.certificationNumber;
        delete newErrors.bio;
        delete newErrors.trainingBatch;
        delete newErrors.passportNo;
        delete newErrors.dateOfBirth;
        delete newErrors.department;
      }
      
      // Clear department error when department changes
      if (field === 'department') {
        delete newErrors.department;
        
        // Real-time validation for TRAINER - department is NOT allowed
        if (formData.role === 'TRAINER') {
          if (value && value.trim() !== '') {
            newErrors.department = 'Department is not allowed for Trainer role';
          }
        }
        // Department head - department is optional (nullable)
      }
      
      // Clear department when role changes to TRAINER (not allowed)
      if (field === 'role' && value === 'TRAINER') {
        // Clear department field for TRAINER
        setFormData(prev => ({
          ...prev,
          department: ''
        }));
      }
      
      return newErrors;
    });
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New User';
      case 'edit':
        return 'Edit User';
      case 'view':
        return 'User Details';
      default:
        return 'User';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header 
        className="bg-gradient-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          {mode === 'view' ? <Eye className="me-2" size={20} /> : <Save className="me-2" size={20} />}
          {getModalTitle()}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger mb-3">
              <strong>Please fix the following errors:</strong>
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Name Fields */}
          <Row>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  First Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  isInvalid={!!errors.firstName}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.firstName ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Middle Name
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  isInvalid={!!errors.middleName}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.middleName ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.middleName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Last Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  isInvalid={!!errors.lastName}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.lastName ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Email */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  isInvalid={!!errors.email}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.email ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Phone Number */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Phone Number *
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  isInvalid={!!errors.phoneNumber}
                  readOnly={isReadOnly}
                  placeholder="Enter phone number"
                  style={{
                    borderColor: errors.phoneNumber ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phoneNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Address (optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  readOnly={isReadOnly}
                  placeholder="Enter address (optional)"
                  style={{
                    borderColor: 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Role and Department */}
          <Row>
            <Col md={(formData.role === 'DEPT_HEAD' || formData.role === 'TRAINER') ? 6 : 12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Role *
                </Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  isInvalid={!!errors.role}
                  disabled={isReadOnly || rolesLoading}
                  style={{
                    borderColor: errors.role ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                >
                  <option value="">
                    {rolesLoading ? 'Loading roles...' : 'Select a role'}
                  </option>
                  {roles.map(role => (
                    <option key={role} value={role}>{formatRoleName(role)}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

                {/* Only show Department field for DEPARTMENT_HEAD (Trainer is NOT allowed to have department) */}
                {formData.role === 'DEPARTMENT_HEAD' && (
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Department
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    isInvalid={!!errors.department}
                    readOnly={isReadOnly}
                    placeholder="Enter department name (optional)"
                    style={{
                      borderColor: errors.department ? '#dc3545' : 'var(--bs-primary)',
                      borderWidth: '2px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.department}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
          </Row>

          {/* Role-specific fields */}
          {formData.role === 'TRAINER' && (
            <>
              {/* Trainer-specific fields */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Specialization *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      isInvalid={!!errors.specialization}
                      readOnly={isReadOnly}
                      placeholder="Enter specialization"
                      style={{
                        borderColor: errors.specialization ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.specialization}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Certification Number *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.certificationNumber}
                      onChange={(e) => handleInputChange('certificationNumber', e.target.value)}
                      isInvalid={!!errors.certificationNumber}
                      readOnly={isReadOnly}
                      placeholder="Enter certification number"
                      style={{
                        borderColor: errors.certificationNumber ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.certificationNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Years of Experience
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter years of experience"
                      min="0"
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Bio *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      isInvalid={!!errors.bio}
                      readOnly={isReadOnly}
                      placeholder="Enter trainer bio (at least 1 character, no unsupported characters)"
                      style={{
                        borderColor: errors.bio ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.bio}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Bio is required and must contain at least 1 character. Only letters, numbers, spaces, and common punctuation are allowed.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {formData.role === 'TRAINEE' && (
            <>
              {/* Trainee-specific fields */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Date of Birth *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Simple validation - only allow if year has 4 digits or less
                        if (value === '' || (value.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
                          handleInputChange('dateOfBirth', value);
                        }
                      }}
                      isInvalid={!!errors.dateOfBirth}
                      readOnly={isReadOnly}
                      max="2024-12-31"
                      min="1900-01-01"
                      style={{
                        borderColor: errors.dateOfBirth ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dateOfBirth}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Training Batch *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.trainingBatch}
                      onChange={(e) => handleInputChange('trainingBatch', e.target.value)}
                      isInvalid={!!errors.trainingBatch}
                      readOnly={isReadOnly}
                      placeholder="Enter training batch"
                      style={{
                        borderColor: errors.trainingBatch ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.trainingBatch}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Passport No *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.passportNo}
                      onChange={(e) => handleInputChange('passportNo', e.target.value)}
                      isInvalid={!!errors.passportNo}
                      readOnly={isReadOnly}
                      placeholder="Enter passport number"
                      style={{
                        borderColor: errors.passportNo ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.passportNo}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Nation
                    </Form.Label>
                    <Form.Select
                      value={formData.nation}
                      onChange={(e) => handleInputChange('nation', e.target.value)}
                      disabled={isReadOnly}
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    >
                      <option value="">Select a nation</option>
                      {nations.map(nation => (
                        <option key={nation} value={nation}>{nation}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {mode === 'view' && user && (
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Employee ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={user.eid}
                    readOnly
                    className="bg-light"
                    style={{
                      borderColor: 'var(--bs-neutral)'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button
            variant="outline-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="me-2" size={16} />
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {mode !== 'view' && (
            <Button
              variant="primary-custom"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="me-2" size={16} />
                  {mode === 'add' ? 'Add User' : 'Save Changes'}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
