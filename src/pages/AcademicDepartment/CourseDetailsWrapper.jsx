import React from 'react';
import { useParams } from 'react-router-dom';
import CourseDetailsView from '../../components/AcademicDepartment/CourseDetailsView';

const CourseDetailsWrapper = () => {
  const { courseId } = useParams();
  

  return <CourseDetailsView courseId={courseId} />;
};

export default CourseDetailsWrapper;
