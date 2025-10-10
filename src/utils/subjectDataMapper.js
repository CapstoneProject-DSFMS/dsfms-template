/**
 * Utility functions to map API response data to UI-friendly format
 */

/**
 * Map API subject data to table format
 * @param {Object} apiSubject - Subject data from API
 * @returns {Object} Mapped subject data for UI
 */
export const mapApiSubjectToTable = (apiSubject) => {
  // Debug log to see API field names
  console.log('🔍 mapApiSubjectToTable - API subject fields:', Object.keys(apiSubject));
  console.log('🔍 mapApiSubjectToTable - start_date:', apiSubject.start_date, 'startDate:', apiSubject.startDate);
  console.log('🔍 mapApiSubjectToTable - end_date:', apiSubject.end_date, 'endDate:', apiSubject.endDate);
  
  return {
    id: apiSubject.id,
    name: apiSubject.name,
    code: apiSubject.code,
    method: apiSubject.method,
    duration: formatDuration(apiSubject.duration),
    // Handle both camelCase and snake_case field names
    startDate: formatDate(apiSubject.startDate || apiSubject.start_date),
    endDate: formatDate(apiSubject.endDate || apiSubject.end_date),
    roomName: apiSubject.roomName || apiSubject.room_name,
    trainees: apiSubject.enrollmentCount || apiSubject.enrollment_count || 0,
    status: apiSubject.deletedAt ? 'INACTIVE' : 'ACTIVE',
    // Additional fields from API
    description: apiSubject.description,
    type: apiSubject.type,
    remarkNote: apiSubject.remarkNote || apiSubject.remark_note,
    timeSlot: apiSubject.timeSlot || apiSubject.time_slot,
    passScore: apiSubject.passScore || apiSubject.pass_score,
    isSIM: apiSubject.isSIM || apiSubject.is_sim,
    courseId: apiSubject.courseId || apiSubject.course_id,
    course: apiSubject.course,
    createdBy: apiSubject.createdBy || apiSubject.created_by,
    updatedBy: apiSubject.updatedBy || apiSubject.updated_by,
    instructorCount: apiSubject.instructorCount || apiSubject.instructor_count || 0,
    // Source tracking
    source: 'api_data'
  };
};

/**
 * Map multiple API subjects to table format
 * @param {Array} apiSubjects - Array of subjects from API
 * @returns {Array} Array of mapped subjects for UI
 */
export const mapApiSubjectsToTable = (apiSubjects) => {
  return apiSubjects.map(mapApiSubjectToTable);
};

/**
 * Format duration from number to readable string
 * @param {number} duration - Duration in days
 * @returns {string} Formatted duration string
 */
const formatDuration = (duration) => {
  if (!duration) return 'N/A';
  
  if (duration === 1) {
    return '1 day';
  } else if (duration < 7) {
    return `${duration} days`;
  } else if (duration === 7) {
    return '1 week';
  } else if (duration < 14) {
    return `${Math.round(duration / 7)} weeks`;
  } else if (duration === 14) {
    return '2 weeks';
  } else {
    return `${Math.round(duration / 7)} weeks`;
  }
};

/**
 * Format date from ISO string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Get status badge color based on status
 * @param {string} status - Subject status
 * @returns {string} Bootstrap badge color class
 */
export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Get method badge color based on method
 * @param {string} method - Subject method
 * @returns {string} Bootstrap badge color class
 */
export const getMethodBadgeColor = (method) => {
  switch (method) {
    case 'CLASSROOM':
      return 'info';
    case 'PRACTICAL':
      return 'warning';
    case 'MIXED':
      return 'primary';
    default:
      return 'secondary';
  }
};

/**
 * Get type badge color based on type
 * @param {string} type - Subject type
 * @returns {string} Bootstrap badge color class
 */
export const getTypeBadgeColor = (type) => {
  switch (type) {
    case 'MANDATORY':
      return 'danger';
    case 'OPTIONAL':
      return 'success';
    case 'UNLIMIT':
      return 'info';
    default:
      return 'secondary';
  }
};
