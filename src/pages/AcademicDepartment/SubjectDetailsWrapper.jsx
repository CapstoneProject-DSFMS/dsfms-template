import React from 'react';
import { useParams } from 'react-router-dom';
import SubjectDetailsView from '../../components/AcademicDepartment/SubjectDetailsView';

const SubjectDetailsWrapper = () => {
  const { subjectId, courseId } = useParams();
  
  console.log('🔍 SubjectDetailsWrapper - subjectId:', subjectId);
  console.log('🔍 SubjectDetailsWrapper - courseId:', courseId);

  return <SubjectDetailsView subjectId={subjectId} courseId={courseId} />;
};

export default SubjectDetailsWrapper;
