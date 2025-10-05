import React from 'react';
import { useParams } from 'react-router-dom';
import SubjectDetailsView from './SubjectDetailsView';

const SubjectDetailsWrapper = () => {
  const { subjectId } = useParams();
  
  console.log('🔍 SubjectDetailsWrapper - subjectId:', subjectId);

  return <SubjectDetailsView subjectId={parseInt(subjectId)} />;
};

export default SubjectDetailsWrapper;
