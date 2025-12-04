import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import profileAPI from '../../api/profile';
import ResetPasswordModal from '../../components/Common/ResetPasswordModal';
import ProfileAvatar from '../../components/Profile/ProfileAvatar';
import PersonalInfoForm from '../../components/Profile/PersonalInfoForm';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const refreshProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await profileAPI.getProfile();
      setProfileData(response);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };


  // Fetch profile data from API
  useEffect(() => {
    refreshProfile();
  }, []);

  const handleUpdatePersonalInfo = async (personalInfo) => {
    setLoading(true);
    
    try {
      // If avatar file is selected, only send avatar
      if (selectedAvatarFile) {
        const response = await profileAPI.updateProfile(selectedAvatarFile);
        setProfileData(response);
        setSelectedAvatarFile(null);
      } else {
        // Otherwise send profile info normally
        const response = await profileAPI.updateProfile(personalInfo);
        setProfileData(response);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelected = (file) => {
    setSelectedAvatarFile(file);
  };

  const handleResetPassword = async (passwordData) => {
    setLoading(true);
    
    try {
      // Map password data to API format
      const apiData = {
        oldPassword: passwordData.oldPassword || '',
        newPassword: passwordData.newPassword || '',
        confirmNewPassword: passwordData.confirmPassword || ''
      };
      
      // Call reset password API
      const response = await profileAPI.resetPassword(apiData);
      
      // Show success toast
      toast.success(response.message || 'Password updated successfully!');
    } catch (error) {
      // Show error toast
      toast.error(error.message || 'Failed to update password. Please check your current password.');
      throw error; // Re-throw to let modal handle it
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureSignature = () => {
    // Navigate to Configure Signature page based on user role
    if (user?.role === 'TRAINER') {
      navigate(ROUTES.TRAINER_CONFIGURE_SIGNATURE);
    } else {
      // For other roles, navigate to a general configure signature page
      // You can create a general configure signature page or redirect to trainer page
      navigate(ROUTES.TRAINER_CONFIGURE_SIGNATURE);
    }
  };


  if (profileLoading) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading profile data...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Profile Avatar Section */}
        <Col lg={4} className="mb-4">
          <ProfileAvatar 
            profileData={profileData}
            user={user}
            onResetPassword={() => setShowResetPasswordModal(true)}
            onAvatarSelected={handleAvatarSelected}
            onConfigureSignature={handleConfigureSignature}
            onSaveChanges={handleUpdatePersonalInfo}
            loading={loading}
          />
        </Col>

        {/* Personal Information Form */}
        <Col lg={8} className="mb-4">
          <PersonalInfoForm 
            profileData={profileData}
            user={user}
            onUpdate={null}
          />
        </Col>
      </Row>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        show={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onSave={handleResetPassword}
        loading={loading}
      />
    </Container>
  );
};

export default ProfilePage;
