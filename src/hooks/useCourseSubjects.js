import { useState, useCallback, useEffect } from 'react';
import subjectAPI from '../api/subject';
import { toast } from 'react-toastify';

/**
 * Hook to load course-subjects for a trainee
 * This hook manages loading course-subjects data from the API
 * and provides course/subject information for assessment filtering
 * 
 * @param {string} traineeId - The trainee ID to load courses/subjects for
 * @returns {Object} { courseSubjects, loading, error, refetch }
 */
export const useCourseSubjects = (traineeId) => {
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCourseSubjects = useCallback(async () => {
    if (!traineeId) {
      setCourseSubjects([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await subjectAPI.getTraineeCourseSubjects(traineeId);
      const courseData = response?.courses || [];
      
      setCourseSubjects(courseData);
    } catch (err) {
      console.error('Error loading course subjects:', err);
      const errorMessage = err.message || 'Failed to load course subjects';
      setError(errorMessage);
      toast.error(errorMessage);
      setCourseSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [traineeId]);

  useEffect(() => {
    if (traineeId) {
      loadCourseSubjects();
    }
  }, [traineeId, loadCourseSubjects]);

  return {
    courseSubjects,
    loading,
    error,
    refetch: loadCourseSubjects
  };
};

export default useCourseSubjects;
