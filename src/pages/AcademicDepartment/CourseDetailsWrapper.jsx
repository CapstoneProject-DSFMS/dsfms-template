import React from 'react';
import { useParams } from 'react-router-dom';
import CourseDetailsView from '../../components/AcademicDepartment/CourseDetailsView';

const CourseDetailsWrapper = () => {
  const { courseId } = useParams();
  
  // In this context, courseId is actually departmentId
  // because the route is /academic/course/:courseId but it's used for department details
  return <CourseDetailsView courseId={courseId} />;
};

export default CourseDetailsWrapper;
