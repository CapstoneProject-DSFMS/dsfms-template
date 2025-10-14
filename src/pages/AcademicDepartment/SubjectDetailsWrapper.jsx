import React from 'react';
import { useParams } from 'react-router-dom';
import SubjectDetailsView from '../../components/AcademicDepartment/SubjectDetailsView';

const SubjectDetailsWrapper = () => {
  const { subjectId, courseId } = useParams();
  

  return <SubjectDetailsView subjectId={subjectId} courseId={courseId} />;
};

export default SubjectDetailsWrapper;
