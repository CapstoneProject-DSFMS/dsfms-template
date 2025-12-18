import React, { useRef, useState } from 'react';
import { Card, Button, Badge, Image } from 'react-bootstrap';
import { Person, Key, Pen, Save } from 'react-bootstrap-icons';
import profileAPI from '../../api/profile';
import { toast } from 'react-toastify';

const ProfileAvatar = ({ 
  profileData, 
  user, 
  onResetPassword,
  onAvatarSelected,
  onConfigureSignature,
  onSaveChanges,
  loading,
  hasAvatarSelected = false
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const getRoleVariant = (role) => {
    const variants = {
      'ADMIN': 'danger',
      'DEPT_HEAD': 'primary',
      'TRAINER': 'info',
      'TRAINEE': 'success',
      'ACADEMIC_DEPT': 'warning',
      'ACADEMIC_DEPARTMENT': 'warning', // Handle both variants
      'SQA_AUDITOR': 'secondary'
    };
    return variants[role] || 'secondary';
  };

  const getDisplayName = () => {
    if (profileData) {
      return [profileData.lastName, profileData.middleName, profileData.firstName]
        .filter(Boolean)
        .join(' ') || 'User Name';
    }
    return 'User Name';
  };

  const getEmail = () => {
    return profileData?.email || user?.email || 'user@example.com';
  };

  const getRole = () => {
    const role = profileData?.role?.name || user?.role || 'USER';
    // Normalize role name - handle both ACADEMIC_DEPT and ACADEMIC_DEPARTMENT
    if (role === 'ACADEMIC_DEPARTMENT' || role === 'ACADEMIC_DEPT') {
      return 'ACADEMIC_DEPT';
    }
    return role;
  };


  const currentAvatarUrl = previewUrl || profileData?.avatarUrl || '';

  const handleChooseFile = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Compress and resize image
  const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image(); // Use window.Image to avoid conflict with React Bootstrap Image
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Please choose an image smaller than 5MB.');
      return;
    }

    try {
      // Show local preview
      const previewBase64 = await compressImage(file, 200, 200, 0.7);
      setPreviewUrl(previewBase64);
      
      // Notify parent with the file
      if (onAvatarSelected) {
        onAvatarSelected(file);
      }
      
    } catch (error) {
      console.error('Preview avatar failed:', error);
      setPreviewUrl(null);
    }
  };

  return (
    <Card className="h-100">
      <Card.Body className="text-center">
        <div className="position-relative d-inline-block mb-3">
          {currentAvatarUrl ? (
            <Image 
              roundedCircle 
              src={currentAvatarUrl} 
              alt="Avatar"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
              style={{ width: '120px', height: '120px', margin: '0 auto' }}
            >
              <Person size={48} className="text-white" />
            </div>
          )}
          <button
            className="position-absolute rounded-circle border border-2 border-white shadow-sm"
            style={{ 
              width: '36px', 
              height: '36px',
              bottom: '0px',
              right: '0px',
              transform: 'translate(40%, 30%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#456882',
              fontWeight: 'bold',
              backgroundColor: '#d2c1b6',
              lineHeight: '1'
            }}
            onClick={handleChooseFile}
            disabled={uploading}
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleFileChange}
          />
        </div>
        
        <h4 className="mb-1">{getDisplayName()}</h4>
        <p className="text-muted mb-2">{getEmail()}</p>
        <Badge bg={getRoleVariant(getRole())} className="mb-3">
          {getRole()}
        </Badge>
        
        <div className="text-start">
          
          
          <div className="d-flex flex-column gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onResetPassword}
              className="d-flex align-items-center justify-content-center"
              style={{ 
                minWidth: '140px',
                borderRadius: '20px',
                fontWeight: '500'
              }}
            >
              <Key size={14} className="me-2" />
              Reset Password
            </Button>
            
            {getRole() === 'TRAINER' && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onConfigureSignature}
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  minWidth: '140px',
                  borderRadius: '20px',
                  fontWeight: '500'
                }}
              >
                <Pen size={14} className="me-2" />
                Configure Signature
              </Button>
            )}
            
            <Button
              variant="primary"
              size="sm"
              onClick={onSaveChanges}
              disabled={loading || !hasAvatarSelected}
              className="d-flex align-items-center justify-content-center"
              style={{ 
                minWidth: '140px',
                borderRadius: '20px',
                fontWeight: '500',
                opacity: hasAvatarSelected ? 1 : 0.5,
                cursor: hasAvatarSelected ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={14} className="me-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileAvatar;
