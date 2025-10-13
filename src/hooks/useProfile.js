import { useState, useEffect } from 'react';
import profileAPI from '../api/profile';

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await profileAPI.updateProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!profile) return 'Loading...';
    
    // Handle profile data from /profile API
    const { firstName, lastName, middleName } = profile;
    
    // Construct name from parts
    const nameParts = [];
    if (firstName) nameParts.push(firstName);
    if (middleName) nameParts.push(middleName);
    if (lastName) nameParts.push(lastName);
    
    return nameParts.join(' ') || 'User';
  };

  const getRoleName = () => {
    if (!profile?.role) return 'User';
    return profile.role.name;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    getDisplayName,
    getRoleName
  };
};

export default useProfile;
