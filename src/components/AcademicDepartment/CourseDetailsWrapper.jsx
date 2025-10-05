import React from 'react';
import { useParams } from 'react-router-dom';
import CourseDetailsView from './CourseDetailsView';

const CourseDetailsWrapper = () => {
  const { courseId } = useParams();
  
  console.log('🔍 CourseDetailsWrapper - courseId:', courseId);

  return <CourseDetailsView courseId={parseInt(courseId)} />;
};

export default CourseDetailsWrapper;
