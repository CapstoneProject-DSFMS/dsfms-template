import React from 'react';
import PropTypes from 'prop-types';

const AssessmentOverview = ({ assessmentInfo, roleInSubject, formatDate }) => {
  if (!assessmentInfo) return null;

  const summaryItems = [
    {
      label: 'Trainee',
      value: `${assessmentInfo.trainee?.firstName || ''} ${assessmentInfo.trainee?.lastName || ''}`.trim() || '—',
      subValue: assessmentInfo.trainee?.eid || ''
    },
    {
      label: 'Assessment Date',
      value: formatDate(assessmentInfo.occuranceDate),
      subValue: ''
    },
    {
      label: 'Status',
      value: assessmentInfo.status || '—',
      subValue: ''
    },
    {
      label: 'Role In Subject',
      value: roleInSubject || '—',
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

