import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary, PermissionRoute } from '../components/Common'
import RoleBasedRedirect from '../components/Common/RoleBasedRedirect'
import Login from '../pages/Auth/Login'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage'
import Dashboard from '../pages/Admin/Dashboard'
import UserManagementPage from '../pages/Admin/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/Admin/RoleManagement/RoleManagementPage'
import DepartmentManagementPage from '../pages/Admin/DepartmentManagement/DepartmentManagementPage'
import DepartmentDetailPage from '../pages/Admin/DepartmentManagement/DepartmentDetailPage'
import ProfilePage from '../pages/Profile/ProfilePage'
import CourseSelectionView from '../pages/AcademicDepartment/CourseSelectionView'
import AcademicDashboard from '../pages/Academic/AcademicDashboard'
import CourseDetailsWrapper from '../pages/AcademicDepartment/CourseDetailsWrapper'
import SubjectDetailsWrapper from '../pages/AcademicDepartment/SubjectDetailsWrapper'
import CourseDetailPage from '../pages/AcademicDepartment/CourseDetailPage'
import EnrollTraineesPage from '../pages/AcademicDepartment/EnrollTraineesPage'
import TraineeDetailPage from '../pages/Trainee/TraineeDetailPage'
import TraineeCourseDetailPage from '../pages/Trainee/TraineeCourseDetailPage'
import TraineeSubjectDetailPage from '../pages/Trainee/TraineeSubjectDetailPage'
import TraineeAssessmentPage from '../pages/Trainee/TraineeAssessmentPage'
import SignaturePadPage from '../pages/Trainee/SignaturePadPage'
import AssessmentSectionDetailsPage from '../pages/Trainee/AssessmentSectionDetailsPage'
import TraineeDashboardPage from '../pages/Trainee/TraineeDashboardPage'
import AcademicDetailsPage from '../pages/Trainee/AcademicDetailsPage'
import EnrolledCoursesPage from '../pages/Trainee/EnrolledCoursesPage'
import AllAssessmentsPage from '../pages/Trainee/AllAssessmentsPage';
import FormsPage from '../pages/Admin/FormsManagement/FormsPage';
import FormEditorPage from '../pages/Admin/FormsManagement/FormEditorPage';
import SignatureRequiredPage from '../pages/Trainee/SignatureRequiredPage';
import SectionCompletionPage from '../pages/Trainee/SectionCompletionPage';
import YourAssessmentsPage from '../pages/Trainee/YourAssessmentsPage';
import CreateIssuePage from '../pages/Trainee/CreateIssuePage'
import { API_PERMISSIONS } from '../constants/apiPermissions'
import { getCurrentBasename } from '../utils/navigation'

// Using getCurrentBasename from navigation.js for consistency
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: <RoleBasedRedirect />
      },
      {
        path: "dashboard",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.DASHBOARD.VIEW}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access the dashboard.</div>}
          >
            <Dashboard />
          </PermissionRoute>
        )
      },
      {
        path: "users",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.USERS.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access user management.</div>}
          >
            <UserManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: "roles",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.ROLES.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access role management.</div>}
          >
            <RoleManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: "departments",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.DEPARTMENTS.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access department management.</div>}
          >
            <DepartmentManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: "departments/:id",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.DEPARTMENTS.VIEW_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view department details.</div>}
          >
            <DepartmentDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: "profile",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.PROFILES.VIEW}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access your profile.</div>}
          >
            <ProfilePage />
          </PermissionRoute>
        )
      },
      {
        path: "forms",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TEMPLATES.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access form templates.</div>}
          >
            <FormsPage />
          </PermissionRoute>
        )
      },
      {
        path: "forms/editor",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TEMPLATES.CREATE}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to edit form templates.</div>}
          >
            <FormEditorPage />
          </PermissionRoute>
        )
      },
      {
        path: "system-config",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.GLOBAL_FIELDS.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access system configuration.</div>}
          >
            <div>System Configuration Page</div>
          </PermissionRoute>
        )
      },
    ]
  },
  {
    path: "/academic",
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: <RoleBasedRedirect />
      },
      {
        path: "dashboard",
        element: <AcademicDashboard />
      },
      {
        path: "departments",
        element: <CourseSelectionView />
      },
      {
        path: "course/:courseId",
        element: <CourseDetailsWrapper />
      },
      {
        path: "course-detail/:courseId",
        element: <CourseDetailPage />
      },
      {
        path: "course/:courseId/enroll-trainees",
        element: <EnrollTraineesPage />
      },
      {
        path: "subject/:subjectId",
        element: <SubjectDetailsWrapper />
      },
      {
        path: "course/:courseId/subject/:subjectId",
        element: <SubjectDetailsWrapper />
      }
    ]
  },
  {
    path: "/trainee",
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access trainee portal.</div>}
          >
            <TraineeDashboardPage />
          </PermissionRoute>
        )
      },
      {
        path: "dashboard",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access trainee dashboard.</div>}
          >
            <TraineeDashboardPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee details.</div>}
          >
            <TraineeDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/course/:courseId",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_COURSES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee courses.</div>}
          >
            <TraineeCourseDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/course/:courseId/subject/:subjectId",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_SUBJECTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee subjects.</div>}
          >
            <TraineeSubjectDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/assessments",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee assessments.</div>}
          >
            <TraineeAssessmentPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/signature-pad/:documentId",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access signature pad.</div>}
          >
            <SignaturePadPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/assessment-section/:sectionId",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment sections.</div>}
          >
            <AssessmentSectionDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "academic-details",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view academic details.</div>}
          >
            <AcademicDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "enrolled-courses",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_COURSES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view enrolled courses.</div>}
          >
            <EnrolledCoursesPage />
          </PermissionRoute>
        )
      },
      {
        path: "all-assessments",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view all assessments.</div>}
          >
            <AllAssessmentsPage />
          </PermissionRoute>
        )
      },
      {
        path: "signature-required",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view signature required list.</div>}
          >
            <SignatureRequiredPage />
          </PermissionRoute>
        )
      },
      {
        path: "completion-required",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view section completion list.</div>}
          >
            <SectionCompletionPage />
          </PermissionRoute>
        )
      },
      {
        path: "your-assessments",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view your assessments.</div>}
          >
            <YourAssessmentsPage />
          </PermissionRoute>
        )
      },
      {
        path: "create-incident-feedback-report",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ALL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to create incident/feedback reports.</div>}
          >
            <CreateIssuePage />
          </PermissionRoute>
        )
      },
      {
        path: "assessment-pending/signature-required",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view signature required list.</div>}
          >
            <SignatureRequiredPage />
          </PermissionRoute>
        )
      },
      {
        path: "assessment-pending/section-completion",
        element: (
          <PermissionRoute 
            permission={API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view section completion list.</div>}
          >
            <SectionCompletionPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "*",
    element: <Login />,
    errorElement: <ErrorBoundary />
  }
], {
  basename: getCurrentBasename(),
})
