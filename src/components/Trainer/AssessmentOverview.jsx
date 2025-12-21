import React from 'react';
import PropTypes from 'prop-types';

const AssessmentOverview = ({ assessmentInfo, roleInSubject, formatDate }) => {
  if (!assessmentInfo) return null;

  // Format role text - remove underscores and capitalize
  const formatRoleText = (role) => {
    if (!role) return '—';
    return role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format status text - remove underscores and capitalize
  const formatStatusText = (status) => {
    if (!status) return '—';
    return status
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get trainee display info - prioritize fullName, fallback to lastName + middleName + firstName
  const traineeName = assessmentInfo.trainee?.fullName || 
                      `${assessmentInfo.trainee?.lastName || ''}${assessmentInfo.trainee?.middleName ? ' ' + assessmentInfo.trainee.middleName : ''} ${assessmentInfo.trainee?.firstName || ''}`.trim() || '—';
  const traineeEid = assessmentInfo.trainee?.eid || '';
  
  // Get trainee profile info if available
  const traineeProfile = assessmentInfo.trainee?.traineeProfile;
  
  // Build subValue with trainee profile information
  let traineeSubValue = traineeEid;
  if (traineeProfile) {
    const profileParts = [];
    if (traineeProfile.trainingBatch) {
      profileParts.push(traineeProfile.trainingBatch);
    }
    if (traineeProfile.nation) {
      profileParts.push(traineeProfile.nation);
    }
    if (traineeProfile.passportNo) {
      profileParts.push(`Passport: ${traineeProfile.passportNo}`);
    }
    if (profileParts.length > 0) {
      traineeSubValue = `${traineeEid ? `${traineeEid} · ` : ''}${profileParts.join(' · ')}`;
    } else if (traineeEid) {
      traineeSubValue = traineeEid;
    }
  }

  const summaryItems = [
    {
      label: 'Trainee',
      value: traineeName,
      subValue: traineeSubValue
    },
    {
      label: 'Assessment Date',
      value: formatDate(assessmentInfo.occuranceDate),
      subValue: ''
    },
    {
      label: 'Status',
      value: formatStatusText(assessmentInfo.status),
      subValue: ''
    },
    {
      label: 'Your Role In Assessment',
      value: formatRoleText(roleInSubject),
      subValue: ''
    }
  ];

  return (
    <div className="assessment-info-banner">
      <div className="title-block">
        <h2 className="assessment-title">{assessmentInfo.name || 'Assessment'}</h2>
        <p className="text-muted mb-0 assessment-course-subtitle">
          {assessmentInfo.course?.name || assessmentInfo.subject?.name || '—'}
          {assessmentInfo.course?.code ? ` · ${assessmentInfo.course.code}` : ''}
        </p>
      </div>
      <div className="assessment-summary-inline">
        {summaryItems.map((item) => (
          <div className="summary-item" key={item.label}>
            <span className="summary-label">{item.label}:</span>
            <span className="summary-value">{item.value}</span>
            {item.subValue && <span className="summary-sub-value">{item.subValue}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

AssessmentOverview.propTypes = {
  assessmentInfo: PropTypes.object,
  roleInSubject: PropTypes.string,
  formatDate: PropTypes.func.isRequired
};

export default AssessmentOverview;

