import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LayoutWrapper } from '../components/Layout';
import { ProtectedRoute, ErrorBoundary, PermissionRoute } from '../components/Common';
import RoleBasedRedirect from '../components/Common/RoleBasedRedirect';
import Login from '../pages/Auth/Login';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';
import UserManagementPage from '../pages/Admin/UserManagement/UserManagementPage';
import RoleManagementPage from '../pages/Admin/RoleManagement/RoleManagementPage';
import DepartmentManagementPage from '../pages/Admin/DepartmentManagement/DepartmentManagementPage';
import DepartmentDetailPage from '../pages/Admin/DepartmentManagement/DepartmentDetailPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import CourseSelectionView from '../pages/AcademicDepartment/CourseSelectionView';
import AcademicDashboard from '../pages/Academic/AcademicDashboard';
import CourseDetailsWrapper from '../pages/AcademicDepartment/CourseDetailsWrapper';
import SubjectDetailsWrapper from '../pages/AcademicDepartment/SubjectDetailsWrapper';
import CourseDetailPage from '../pages/AcademicDepartment/CourseDetailPage';
import InPageCourseDetail from '../pages/AcademicDepartment/InPageCourseDetail';
import EnrollTraineesPage from '../pages/AcademicDepartment/EnrollTraineesPage';
import AssessmentEventPage from '../pages/AcademicDepartment/AssessmentEventPage';
import TraineeSubjectDetailPage from '../pages/Trainee/TraineeSubjectDetailPage';
import TraineeAssessmentPage from '../pages/Trainee/TraineeAssessmentPage';
import TraineeAssessmentDetailPage from '../pages/Trainee/TraineeAssessmentDetailPage';
import SignaturePadPage from '../pages/Trainee/SignaturePadPage';
import AssessmentSectionDetailsPage from '../pages/Trainee/AssessmentSectionDetailsPage';
import TraineeDashboardPage from '../pages/Trainee/TraineeDashboardPage';
import AcademicDetailsPage from '../pages/Trainee/AcademicDetailsPage';
import EnrolledCoursesPage from '../pages/Trainee/EnrolledCoursesPage';
import UnifiedTemplateListPage from '../pages/Admin/FormsManagement/UnifiedTemplateListPage';
import FormEditorPage from '../pages/Admin/FormsManagement/FormEditorPage';
import YourDraftsPage from '../pages/Admin/FormsManagement/YourDraftsPage';
import MainMenuPage from '../pages/Admin/MainMenuPage';
import GlobalFieldListPage from '../pages/Admin/GlobalField/GlobalFieldListPage';
import SignatureRequiredPage from '../pages/Trainee/SignatureRequiredPage';
import YourAssessmentsPage from '../pages/Trainee/YourAssessmentsPage';
import CreateIssuePage from '../pages/Trainee/CreateIssuePage';
import UnifiedReportsPage from '../pages/SQA/UnifiedReportsPage';
import ReportDetailPage from '../pages/SQA/ReportDetailPage';
import TemplateDetailPage from '../pages/SQA/TemplateDetailPage';
import TrainerDashboardPage from '../pages/Trainer/TrainerDashboardPage';
import UpcomingAssessmentsPage from '../pages/Trainer/UpcomingAssessmentsPage';
import AssessmentResultsPage from '../pages/Trainer/AssessmentResultsPage';
import InstructedCoursesPage from '../pages/Trainer/InstructedCoursesPage';
import TrainerCourseDetailPage from '../pages/Trainer/CourseDetailPage';
import TrainerTraineeDetailsPage from '../pages/Trainer/TraineeDetailsPage';
import TrainerSubjectDetailsPage from '../pages/Trainer/SubjectDetailsPage';
import ConfigureSignaturePage from '../pages/Trainer/ConfigureSignaturePage';
import AssessmentResultDetailsPage from '../pages/Trainer/AssessmentResultDetailsPage';
import AssessmentAssignmentsPage from '../pages/Trainer/AssessmentAssignmentsPage';
import TrainerAssessmentSectionsPage from '../pages/Trainer/AssessmentSectionsPage';
import AssessmentSectionFieldsPage from '../pages/Trainer/AssessmentSectionFieldsPage';
import ResultApprovalNotePage from '../pages/Trainer/ResultApprovalNotePage';
import DepartmentHeadDashboardPage from '../pages/DepartmentHead/DepartmentHeadDashboardPage';
import MyDepartmentDetailsPage from '../pages/DepartmentHead/MyDepartmentDetailsPage';
import AssessmentReviewRequestsPage from '../pages/DepartmentHead/AssessmentReviewRequestsPage';
import AssessmentEventReviewDetailPage from '../pages/DepartmentHead/AssessmentEventReviewDetailPage';
import DepartmentHeadTraineeDetailsPage from '../pages/DepartmentHead/TraineeDetailsPage';
import { getCurrentBasename } from '../utils/navigation';
import { ROUTES } from '../constants/routes';
import { RouteRedirect } from '../components/Common';
import { PERMISSION_IDS } from '../constants/permissionIds';

// Using getCurrentBasename from navigation.js for consistency
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Login />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: '/login',
      element: <Login />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: '/reset-password',
      element: <ResetPasswordPage />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: '/profile',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <ProfilePage />,
        },
      ],
    },
    // ============================================
    // NEW: Function-based Routes (Primary Routes)
    // ============================================
    {
      path: ROUTES.USERS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_USERS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access user management.</div>
              }
            >
              <UserManagementPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.ROLES,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_ROLES}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access role management.</div>
              }
            >
              <RoleManagementPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.DEPARTMENTS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permissions={[PERMISSION_IDS.VIEW_ALL_DEPARTMENTS, PERMISSION_IDS.UPDATE_DEPARTMENT]}
              requireAll
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access department management.</div>
              }
            >
              <DepartmentManagementPage />
            </PermissionRoute>
          ),
        },
        {
          path: ':id',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_DEPARTMENT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view department details.</div>
              }
            >
              <DepartmentDetailPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.TEMPLATES,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_TEMPLATE}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access form templates.</div>
              }
            >
              <UnifiedTemplateListPage />
            </PermissionRoute>
          ),
        },
        {
          path: 'editor',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.CREATE_TEMPLATE}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to edit form templates.</div>
              }
            >
              <FormEditorPage />
            </PermissionRoute>
          ),
        },
        {
          path: 'drafts',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.CREATE_TEMPLATE}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view drafts.</div>
              }
            >
              <YourDraftsPage />
            </PermissionRoute>
          ),
        },
        {
          path: ':templateId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_TEMPLATE_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access template details.</div>
              }
            >
              <TemplateDetailPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.SYSTEM_CONFIG,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_GLOBAL_FIELDS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access system configuration.</div>
              }
            >
              <GlobalFieldListPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.MAIN_MENU,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <MainMenuPage />,
        },
      ],
    },
    {
      path: ROUTES.COURSES_INSTRUCTED,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_COURSES}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view instructed courses.</div>
              }
            >
              <InstructedCoursesPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.COURSES_ENROLLED,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_ENROLLMENTS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view enrolled courses.</div>
              }
            >
              <EnrolledCoursesPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: '/courses/:courseId',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_COURSE_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view course details.</div>
              }
            >
              <TrainerCourseDetailPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: '/courses/:courseId/enroll-trainees',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <EnrollTraineesPage />,
        },
      ],
    },
    {
      path: '/courses/:courseId/subjects/:subjectId',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_SUBJECT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view subject details.</div>
              }
            >
              <SubjectDetailsWrapper />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.ASSESSMENTS_UPCOMING,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <UpcomingAssessmentsPage />,
        },
      ],
    },
    {
      path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <YourAssessmentsPage />,
        },
      ],
    },
    {
      path: ROUTES.ASSESSMENTS_RESULTS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <AssessmentResultsPage />,
        },
      ],
    },
    {
      path: ROUTES.ASSESSMENTS_SIGNATURE_REQUIRED,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <SignatureRequiredPage />,
        },
      ],
    },
    {
      path: '/assessments/assign/:entityType/:entityId',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <AssessmentAssignmentsPage />,
        },
      ],
    },
    {
      path: '/assessments/:assessmentId/sections',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <TrainerAssessmentSectionsPage />,
        },
      ],
    },
    {
      path: '/assessments/sections/:sectionId/fields',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <AssessmentSectionFieldsPage />,
        },
      ],
    },
    {
      path: ROUTES.ASSESSMENT_EVENTS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <AssessmentEventPage />,
        },
      ],
    },
    {
      path: ROUTES.REPORTS_CREATE,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_SUBMITTED_REPORTS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to create incident/feedback reports.</div>
              }
            >
              <CreateIssuePage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.REPORTS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_INCIDENT_FEEDBACK_REPORT}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access incident/feedback reports.</div>
              }
            >
              <UnifiedReportsPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.REPORTS_ISSUES,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_INCIDENT_FEEDBACK_REPORT}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access issue list.</div>
              }
            >
              <UnifiedReportsPage defaultTab="incidents" />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.REPORTS_FEEDBACK,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_INCIDENT_FEEDBACK_REPORT}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access feedback list.</div>
              }
            >
              <UnifiedReportsPage defaultTab="feedback" />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: '/reports/:reportId',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_INCIDENT_FEEDBACK_REPORT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view incident/feedback report details.</div>
              }
            >
              <ReportDetailPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.TRAINER_CONFIGURE_SIGNATURE,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <ConfigureSignaturePage />,
        },
      ],
    },
    {
      path: ROUTES.DEPARTMENT_MY_DETAILS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_DEPARTMENT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access department details.</div>
              }
            >
              <MyDepartmentDetailsPage />
            </PermissionRoute>
          ),
        },
        {
          path: ':courseId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_COURSE_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view course details.</div>
              }
            >
              <InPageCourseDetail />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: ROUTES.DEPARTMENT_REVIEW_REQUESTS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <AssessmentReviewRequestsPage />,
        },
        {
          path: ':requestId',
          element: <AssessmentReviewRequestsPage />,
        },
        {
          path: 'events/:eventId',
          element: <AssessmentEventReviewDetailPage />,
        },
      ],
    },
    {
      path: ROUTES.TRAINEE_ACADEMIC_DETAILS,
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_ENROLLMENTS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view academic details.</div>
              }
            >
              <AcademicDetailsPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    // ============================================
    // OLD: Role-based Routes (Backward Compatibility)
    // These routes redirect to new function-based routes
    // ============================================
    {
      path: '/admin',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <RoleBasedRedirect />,
        },
        {
          path: 'main-menu',
          element: <RouteRedirect />,
        },
        {
          path: 'users',
          element: <RouteRedirect />,
        },
        {
          path: 'roles',
          element: <RouteRedirect />,
        },
        {
          path: 'departments',
          element: <RouteRedirect />,
        },
        {
          path: 'departments/:id',
          element: <RouteRedirect />,
        },
        {
          path: 'forms',
          element: <RouteRedirect />,
        },
        {
          path: 'forms/editor',
          element: <RouteRedirect />,
        },
        {
          path: 'forms/drafts',
          element: <RouteRedirect />,
        },
        {
          path: 'system-config',
          element: <RouteRedirect />,
        },
      ],
    },
    {
      path: '/academic',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <RoleBasedRedirect />,
        },
        {
          path: 'dashboard',
          element: <AcademicDashboard />,
        },
        {
          path: 'departments',
          element: <CourseSelectionView />,
        },
        {
          path: 'course/:courseId',
          element: <CourseDetailsWrapper />,
        },
        {
          path: 'course-detail/:courseId',
          element: <CourseDetailPage />,
        },
        {
          path: 'course/:courseId/enroll-trainees',
          element: <EnrollTraineesPage />,
        },
        {
          path: 'subject/:subjectId',
          element: <SubjectDetailsWrapper />,
        },
        {
          path: 'course/:courseId/subject/:subjectId',
          element: <SubjectDetailsWrapper />,
        },
        {
          path: 'assessment-events',
          element: <AssessmentEventPage />,
        },
      ],
    },
    {
      path: '/trainee',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <RoleBasedRedirect />,
        },
        {
          path: 'dashboard',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_ENROLLMENTS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access trainee dashboard.</div>
              }
            >
              <TraineeDashboardPage />
            </PermissionRoute>
          ),
        },
        {
          path: ':traineeId/course/:courseId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_ENROLLMENTS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view trainee courses.</div>
              }
            >
              <InPageCourseDetail />
            </PermissionRoute>
          ),
        },
        {
          path: ':traineeId/course/:courseId/subject/:subjectId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_ALL_ENROLLMENTS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view trainee subjects.</div>
              }
            >
              <TraineeSubjectDetailPage />
            </PermissionRoute>
          ),
        },
        {
          path: ':traineeId/assessments',
          element: <TraineeAssessmentPage />,
        },
        {
          path: ':traineeId/assessment/:assessmentId',
          element: <TraineeAssessmentDetailPage />,
        },
        {
          path: ':traineeId/signature-pad/:documentId',
          element: <SignaturePadPage />,
        },
        {
          path: ':traineeId/assessment-section/:sectionId',
          element: <AssessmentSectionDetailsPage />,
        },
        {
          path: 'academic-details',
          element: <RouteRedirect />,
        },
        {
          path: 'enrolled-courses',
          element: <RouteRedirect />,
        },
        {
          path: 'signature-required',
          element: <RouteRedirect />,
        },
        {
          path: 'completion-required',
          element: <RouteRedirect />,
        },
        {
          path: 'your-assessments',
          element: <RouteRedirect />,
        },
        {
          path: 'create-incident-feedback-report',
          element: <RouteRedirect />,
        },
        {
          path: 'assessment-pending',
          element: <YourAssessmentsPage />,
        },
      ],
    },
    {
      path: '/sqa',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <RoleBasedRedirect />,
        },
        {
          path: 'issues',
          element: <RouteRedirect />,
        },
        {
          path: 'feedback',
          element: <RouteRedirect />,
        },
        {
          path: 'templates/:templateId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_TEMPLATE_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access template details.</div>
              }
            >
              <TemplateDetailPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: '/trainer',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <RoleBasedRedirect />,
        },
        {
          path: 'dashboard',
          element: <TrainerDashboardPage />,
        },
        {
          path: 'upcoming-assessments',
          element: <RouteRedirect />,
        },
        {
          path: 'assessment-results',
          element: <RouteRedirect />,
        },
        {
          path: 'instructed-courses',
          element: <RouteRedirect />,
        },
        {
          path: 'configure-signature',
          element: <RouteRedirect />,
        },
        {
          path: 'assessment-details/:resultId',
          element: <AssessmentResultDetailsPage />,
        },
        {
          path: 'assess/:entityType/:entityId',
          element: <AssessmentAssignmentsPage />,
        },
        {
          path: 'assessments/:assessmentId/sections',
          element: <TrainerAssessmentSectionsPage />,
        },
        {
          path: 'assessments/sections/:sectionId/fields',
          element: <AssessmentSectionFieldsPage />,
        },
        {
          path: 'assess/:entityType/:entityId',
          element: <AssessmentAssignmentsPage />,
        },
        {
          path: 'approval-notes/:resultId',
          element: <ResultApprovalNotePage />,
        },
        {
          path: 'courses/:courseId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_COURSE_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view course details.</div>
              }
            >
              <TrainerCourseDetailPage />
            </PermissionRoute>
          ),
        },
        {
          path: 'trainees/:traineeId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_USER_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view trainee details.</div>
              }
            >
              <TrainerTraineeDetailsPage />
            </PermissionRoute>
          ),
        },
        {
          path: 'subjects/:subjectId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_SUBJECT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view subject details.</div>
              }
            >
              <TrainerSubjectDetailsPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: '/department-head',
      element: (
        <ProtectedRoute>
          <LayoutWrapper />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <RoleBasedRedirect />,
        },
        {
          path: 'dashboard',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_DEPARTMENT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to access department dashboard.</div>
              }
            >
              <DepartmentHeadDashboardPage />
            </PermissionRoute>
          ),
        },
        {
          path: 'my-department-details',
          element: <RouteRedirect />,
        },
        {
          path: 'my-department-details/:courseId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_COURSE_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view course details.</div>
              }
            >
              <InPageCourseDetail />
            </PermissionRoute>
          ),
        },
        {
          path: 'assessment-review-requests',
          element: <RouteRedirect />,
        },
        {
          path: 'assessment-review-requests/:requestId',
          element: <AssessmentReviewRequestsPage />,
        },
        {
          path: 'courses/:courseId/subjects/:subjectId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_SUBJECT_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view subject details.</div>
              }
            >
              <SubjectDetailsWrapper />
            </PermissionRoute>
          ),
        },
        {
          path: 'trainees/:traineeId',
          element: (
            <PermissionRoute
              permission={PERMISSION_IDS.VIEW_USER_DETAILS}
              fallback={
                <div className="p-4 text-center text-muted">You don't have permission to view trainee details.</div>
              }
            >
              <DepartmentHeadTraineeDetailsPage />
            </PermissionRoute>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <Login />,
      errorElement: <ErrorBoundary />,
    },
  ],
  {
    basename: getCurrentBasename(),
  }
);