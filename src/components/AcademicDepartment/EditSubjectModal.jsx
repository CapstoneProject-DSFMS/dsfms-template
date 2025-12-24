import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Pencil } from 'react-bootstrap-icons';

const EditSubjectModal = ({ show, onClose, onSave, subject, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    method: 'CLASSROOM',
    type: 'UNLIMIT',
    roomName: '',
    remarkNote: '',
    timeSlot: '',
    isSIM: false,
    passScore: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState([]);

  // Helper function to format ISO date to YYYY-MM-DD for input type="date"
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return '';
    try {
      return new Date(isoDate).toISOString().split('T')[0];
    } catch (error) {
      return isoDate;
    }
  };

  useEffect(() => {
    if (subject && show) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        method: subject.method || 'CLASSROOM',
        type: subject.type || 'UNLIMIT',
        roomName: subject.roomName || '',
        remarkNote: subject.remarkNote || '',
        timeSlot: subject.timeSlot || '',
        isSIM: subject.isSIM || false,
        passScore: subject.passScore || '',
        startDate: formatDateForInput(subject.startDate),
        endDate: formatDateForInput(subject.endDate)
      });
      setErrors([]);
    }
  }, [subject, show]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.name.trim()) {
      newErrors.push('Subject name is required');
    }
    
    if (!formData.code.trim()) {
      newErrors.push('Subject code is required');
    }

    const passScoreStr = String(formData.passScore || '').trim();
    if (passScoreStr && (isNaN(passScoreStr) || !Number.isInteger(parseFloat(passScoreStr)) || parseFloat(passScoreStr) < 0 || parseFloat(passScoreStr) > 100)) {
      newErrors.push('Pass score must be an integer between 0 and 100');
    }

    // Validate Time Slot format if provided
    if (formData.timeSlot.trim()) {
      // Support both ; and , as separators
      const slots = formData.timeSlot.split(/[;,]/).map(s => s.trim()).filter(s => s);
      
      if (slots.length === 0) {
        newErrors.push('Time slot cannot be empty');
      } else {
        // Accept time with or without leading zero (9:00 or 09:00)
        const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        
        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          const parts = slot.split('-');
          
          if (parts.length !== 2) {
            newErrors.push(`Time slot ${i + 1} must contain exactly one dash (-)`);
            continue;
          }
          
          const [start, end] = parts;
          
          if (!timeRegex.test(start) || !timeRegex.test(end)) {
            newErrors.push(`Time slot ${i + 1} must be in format H:mm or HH:mm (e.g., 9:00-13:00 or 09:00-13:00)`);
            continue;
          }
          
          // Check if start time < end time
          const [startHour, startMin] = start.split(':').map(Number);
          const [endHour, endMin] = end.split(':').map(Number);
          
          if (startHour * 60 + startMin >= endHour * 60 + endMin) {
            newErrors.push(`Time slot ${i + 1}: End time must be after start time`);
          }
        }
      }
    }

    if (!formData.startDate.trim()) {
      newErrors.push('Start date is required');
    }

    if (!formData.endDate.trim()) {
      newErrors.push('End date is required');
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate + 'T00:00:00') >= new Date(formData.endDate + 'T00:00:00')) {
      newErrors.push('End date must be after start date');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const subjectData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description?.trim() || null,
        method: formData.method,
        type: formData.type,
        roomName: formData.roomName?.trim() || null,
        remarkNote: formData.remarkNote?.trim() || null,
        timeSlot: formData.timeSlot?.trim() || null,
        isSIM: formData.isSIM,
        passScore: formData.passScore ? parseFloat(formData.passScore) : null,
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      await onSave(subjectData);
      handleClose();
    } catch (error) {
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      method: 'CLASSROOM',
      type: 'UNLIMIT',
      roomName: '',
      remarkNote: '',
      timeSlot: '',
      isSIM: false,
      passScore: '',
      startDate: '',
      endDate: ''
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Pencil className="me-2" size={20} />
          Edit Subject
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden' }}>
        {errors.length > 0 && (
          <Alert variant="danger" className="mb-3">
            <ul className="mb-0">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter subject name"
                  disabled={loading}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter subject code"
                  disabled={loading}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter subject description"
              disabled={loading}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Method *</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="CLASSROOM">CLASSROOM</option>
                  <option value="E_LEARNING">E_LEARNING</option>
                  <option value="ERO">ERO</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="UNLIMIT">UNLIMIT</option>
                  <option value="RECURRENT">RECURRENT</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  placeholder="Enter venue"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Time Slot</Form.Label>
                <Form.Control
                  type="text"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  placeholder="e.g., 09:00-11:00"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pass Score</Form.Label>
                <Form.Control
                  type="number"
                  name="passScore"
                  value={formData.passScore}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === '.' && e.preventDefault()}
                  placeholder="Enter pass score (0-100)"
                  min="0"
                  max="100"
                  step="1"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Remark Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="remarkNote"
              value={formData.remarkNote}
              onChange={handleInputChange}
              placeholder="Enter remark note"
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isSIM"
              checked={formData.isSIM}
              onChange={handleInputChange}
              label="Is Simulator"
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose} 
          disabled={loading}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <Pencil className="me-2" size={16} />
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSubjectModal;
