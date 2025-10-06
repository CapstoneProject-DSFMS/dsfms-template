import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import profileAPI from '../../api/profile';
import ResetPasswordModal from '../../components/Common/ResetPasswordModal';
import ProfileAvatar from '../../components/Profile/ProfileAvatar';
import PersonalInfoForm from '../../components/Profile/PersonalInfoForm';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
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
      // Call API to update profile
      const response = await profileAPI.updateProfile(personalInfo);
      setProfileData(response);
      toast.success('Personal information updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update personal information. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (passwordData) => {
    setLoading(true);
    
    try {
      // Call reset password API
      const response = await profileAPI.resetPassword(passwordData);
      
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
            onAvatarUpdated={refreshProfile}
          />
        </Col>

        {/* Personal Information Form */}
        <Col lg={8} className="mb-4">
          <PersonalInfoForm 
            profileData={profileData}
            user={user}
            onUpdate={handleUpdatePersonalInfo}
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
