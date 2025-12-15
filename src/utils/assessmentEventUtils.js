/**
 * Utility functions for grouping assessments by event
 */

/**
 * Extract common event name from assessment names (part before "-")
 * @param {Array} assessmentNames - Array of assessment names
 * @returns {string} Common event name
 */
const extractCommonEventName = (assessmentNames) => {
  if (!assessmentNames || assessmentNames.length === 0) {
    return 'Unknown Event';
  }

  // Try to extract common part before "-"
  const parts = assessmentNames.map(name => {
    const dashIndex = name.indexOf(' - ');
    return dashIndex > 0 ? name.substring(0, dashIndex).trim() : name;
  });

  // Find common prefix
  let commonName = parts[0];
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] !== commonName) {
      // If not all same, use first name's prefix or first name itself
      return parts[0] || assessmentNames[0] || 'Unknown Event';
    }
  }

  return commonName || assessmentNames[0] || 'Unknown Event';
};

/**
 * Group assessments by event (template + occurrence date)
 * Assessments with same template and occurrence date are grouped together regardless of name
 * @param {Array} assessments - Array of assessment objects
 * @returns {Array} Array of grouped event objects
 */
export const groupAssessmentsByEvent = (assessments) => {
  const groups = {};

  assessments.forEach(assessment => {
    const templateId = assessment.template?.id || null;
    const templateName = assessment.template?.name || 'Unknown Template';
    
    // Logic lấy occurrenceDate - đồng nhất ở mọi nơi
    const occurrenceDate = assessment.occuranceDate || // Direct field on assessment (API format)
                         assessment.occurrenceDate ||
                         assessment.assessmentEvent?.occuranceDate || 
                         assessment.assessmentEvent?.occurrenceDate ||
                         assessment.event?.occuranceDate ||
                         assessment.event?.occurrenceDate ||
                         assessment.eventOccurrenceDate ||
                         null;

    // Group by templateId + occurrenceDate (not by name)
    const eventKey = `${templateId}|${occurrenceDate}`;
    
    // Encode eventKey để tránh lỗi URL encoding với ký tự đặc biệt
    const eventId = encodeURIComponent(eventKey);

    if (!groups[eventKey]) {
      groups[eventKey] = {
        eventId, // Encoded ID cho URL routing
        eventKey, // Original key để internal comparison
        templateId,
        templateName,
        occurrenceDate,
        assessments: [],
        totalTrainees: 0,
        assessmentNames: [] // Collect names to extract common name later
      };
    }

    groups[eventKey].assessments.push(assessment);
    // Collect assessment name for event name extraction
    const assessmentName = assessment.assessmentEvent?.name || 
                          assessment.event?.name ||
                          assessment.eventName || 
                          assessment.name;
    if (assessmentName && !groups[eventKey].assessmentNames.includes(assessmentName)) {
      groups[eventKey].assessmentNames.push(assessmentName);
    }
  });

  // Calculate total trainees and extract event name for each event
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    const uniqueTraineeIds = new Set(
      group.assessments.map(a => a.trainee?.id || a.traineeId).filter(Boolean)
    );
    group.totalTrainees = uniqueTraineeIds.size;
    
    // Extract common event name from collected names
    group.eventName = extractCommonEventName(group.assessmentNames);
    delete group.assessmentNames; // Clean up temporary data
  });

  return Object.values(groups);
};

/**
 * Find event by encoded eventId
 * @param {Array} events - Array of event objects from groupAssessmentsByEvent
 * @param {string} encodedEventId - Encoded eventId from URL
 * @returns {Object|null} Event object or null if not found
 */
export const findEventById = (events, encodedEventId) => {
  // Try direct match first
  let event = events.find(event => event.eventId === encodedEventId);
  
  // If not found, try decoding and matching with eventKey
  if (!event && encodedEventId) {
    try {
      const decodedEventId = decodeURIComponent(encodedEventId);
      event = events.find(event => event.eventKey === decodedEventId);
    } catch (error) {
      console.error('Error decoding eventId:', error);
    }
  }
  
  return event || null;
};

