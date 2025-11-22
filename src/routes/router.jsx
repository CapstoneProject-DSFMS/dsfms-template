import React from 'react';
import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary, PermissionRoute } from '../components/Common'
import RoleBasedRedirect from '../components/Common/RoleBasedRedirect'
import Login from '../pages/Auth/Login'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage'
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
import AssessmentEventPage from '../pages/AcademicDepartment/AssessmentEventPage'
import TraineeCourseDetailPage from '../pages/Trainee/TraineeCourseDetailPage'
import TraineeSubjectDetailPage from '../pages/Trainee/TraineeSubjectDetailPage'
import TraineeAssessmentPage from '../pages/Trainee/TraineeAssessmentPage'
import TraineeAssessmentDetailPage from '../pages/Trainee/TraineeAssessmentDetailPage'
import SignaturePadPage from '../pages/Trainee/SignaturePadPage'
import AssessmentSectionDetailsPage from '../pages/Trainee/AssessmentSectionDetailsPage'
import TraineeDashboardPage from '../pages/Trainee/TraineeDashboardPage'
import AcademicDetailsPage from '../pages/Trainee/AcademicDetailsPage'
import EnrolledCoursesPage from '../pages/Trainee/EnrolledCoursesPage'
import FormsPage from '../pages/Admin/FormsManagement/FormsPage';
import FormEditorPage from '../pages/Admin/FormsManagement/FormEditorPage';
import YourDraftsPage from '../pages/Admin/FormsManagement/YourDraftsPage';
import MainMenuPage from '../pages/Admin/MainMenuPage';
import GlobalFieldListPage from '../pages/Admin/GlobalField/GlobalFieldListPage';
import SignatureRequiredPage from '../pages/Trainee/SignatureRequiredPage';
import SectionCompletionPage from '../pages/Trainee/SectionCompletionPage';
import YourAssessmentsPage from '../pages/Trainee/YourAssessmentsPage';
import CreateIssuePage from '../pages/Trainee/CreateIssuePage'
import IssueListPage from '../pages/SQA/IssueListPage'
import FeedbackListPage from '../pages/SQA/FeedbackListPage'
import TemplateListPage from '../pages/SQA/TemplateListPage'
import TemplateDetailPage from '../pages/SQA/TemplateDetailPage'
import TrainerDashboardPage from '../pages/Trainer/TrainerDashboardPage'
import UpcomingAssessmentsPage from '../pages/Trainer/UpcomingAssessmentsPage'
import AssessmentResultsPage from '../pages/Trainer/AssessmentResultsPage'
import InstructedCoursesPage from '../pages/Trainer/InstructedCoursesPage'
import TrainerCourseDetailPage from '../pages/Trainer/CourseDetailPage'
import TrainerTraineeDetailsPage from '../pages/Trainer/TraineeDetailsPage'
import TrainerSubjectDetailsPage from '../pages/Trainer/SubjectDetailsPage'
import ConfigureSignaturePage from '../pages/Trainer/ConfigureSignaturePage'
import AssessmentResultDetailsPage from '../pages/Trainer/AssessmentResultDetailsPage'
import AssessmentAssignmentsPage from '../pages/Trainer/AssessmentAssignmentsPage'
import TrainerAssessmentSectionsPage from '../pages/Trainer/AssessmentSectionsPage'
import AssessmentSectionFieldsPage from '../pages/Trainer/AssessmentSectionFieldsPage'
  import ResultApprovalNotePage from '../pages/Trainer/ResultApprovalNotePage'
import DepartmentHeadDashboardPage from '../pages/DepartmentHead/DepartmentHeadDashboardPage'
import MyDepartmentDetailsPage from '../pages/DepartmentHead/MyDepartmentDetailsPage'
import AssessmentReviewRequestsPage from '../pages/DepartmentHead/AssessmentReviewRequestsPage'
import CourseDetailsPage from '../pages/DepartmentHead/CourseDetailsPage'
import DepartmentHeadSubjectDetailsPage from '../pages/DepartmentHead/SubjectDetailsPage'
import DepartmentHeadTraineeDetailsPage from '../pages/DepartmentHead/TraineeDetailsPage'
import { PERMISSION_IDS } from '../constants/permissionIds'
import { getCurrentBasename } from '../utils/navigation'
import { ROUTES } from '../constants/routes'
import { RouteRedirect } from '../components/Common'

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
    path: "/profile",
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
            permission={PERMISSION_IDS.VIEW_MY_PROFILE}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access your profile.</div>}
          >
            <ProfilePage />
          </PermissionRoute>
        )
      }
    ]
  },
  // ============================================
  // NEW: Function-based Routes (Primary Routes)
  // ============================================
  {
    path: ROUTES.DASHBOARD,
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
      }
    ]
  },
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
        path: "",
        element: (
          <PermissionRoute 
            permissions={[
              PERMISSION_IDS.VIEW_ALL_USERS,
              PERMISSION_IDS.CREATE_USER,
              PERMISSION_IDS.UPDATE_USER,
              PERMISSION_IDS.DISABLE_USER,
              PERMISSION_IDS.ENABLE_USER
            ]}
            requireAll={false}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access user management.</div>}
          >
            <UserManagementPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_ALL_ROLES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access role management.</div>}
          >
            <RoleManagementPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_ALL_DEPARTMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access department management.</div>}
          >
            <DepartmentManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: ":id",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view department details.</div>}
          >
            <DepartmentDetailPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_ALL_TEMPLATES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access form templates.</div>}
          >
            <FormsPage />
          </PermissionRoute>
        )
      },
      {
        path: "editor",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.CREATE_TEMPLATE}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to edit form templates.</div>}
          >
            <FormEditorPage />
          </PermissionRoute>
        )
      },
      {
        path: "drafts",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.CREATE_TEMPLATE}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view drafts.</div>}
          >
            <YourDraftsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_GLOBAL_FIELDS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access system configuration.</div>}
          >
            <GlobalFieldListPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: <MainMenuPage />
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_ALL_COURSES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view instructed courses.</div>}
          >
            <InstructedCoursesPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view enrolled courses.</div>}
          >
            <EnrolledCoursesPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/courses/:courseId",
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
            permission={PERMISSION_IDS.VIEW_ALL_COURSES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view course details.</div>}
          >
            <TrainerCourseDetailPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/courses/:courseId/enroll-trainees",
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: <EnrollTraineesPage />
      }
    ]
  },
  {
    path: "/courses/:courseId/subjects/:subjectId",
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
            permission={PERMISSION_IDS.VIEW_SUBJECT_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view subject details.</div>}
          >
            <DepartmentHeadSubjectDetailsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view upcoming assessments.</div>}
          >
            <UpcomingAssessmentsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view your assessments.</div>}
          >
            <YourAssessmentsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment results.</div>}
          >
            <AssessmentResultsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view signature required list.</div>}
          >
            <SignatureRequiredPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: ROUTES.ASSESSMENTS_COMPLETION_REQUIRED,
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
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view section completion list.</div>}
          >
            <SectionCompletionPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/assessments/assign/:entityType/:entityId",
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
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view these assessments.</div>}
          >
            <AssessmentAssignmentsPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/assessments/:assessmentId/sections",
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
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment sections.</div>}
          >
            <TrainerAssessmentSectionsPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/assessments/sections/:sectionId/fields",
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
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view section fields.</div>}
          >
            <AssessmentSectionFieldsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENT_EVENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access assessment events.</div>}
          >
            <AssessmentEventPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.SUBMIT_REPORT_REQUEST}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to create incident/feedback reports.</div>}
          >
            <CreateIssuePage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ALL_REPORTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access issue list.</div>}
          >
            <IssueListPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ALL_REPORTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access feedback list.</div>}
          >
            <FeedbackListPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.UPDATE_MY_PROFILE}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to configure signature.</div>}
          >
            <ConfigureSignaturePage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access department details.</div>}
          >
            <MyDepartmentDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: ":courseId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_COURSE_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view course details.</div>}
          >
            <CourseDetailsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access assessment review requests.</div>}
          >
            <AssessmentReviewRequestsPage />
          </PermissionRoute>
        )
      },
      {
        path: ":requestId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment request details.</div>}
          >
            <AssessmentReviewRequestsPage />
          </PermissionRoute>
        )
      }
    ]
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
        path: "",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view academic details.</div>}
          >
            <AcademicDetailsPage />
          </PermissionRoute>
        )
      }
    ]
  },
  // ============================================
  // OLD: Role-based Routes (Backward Compatibility)
  // These routes redirect to new function-based routes
  // ============================================
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
        path: "main-menu",
        element: <RouteRedirect />
      },
      {
        path: "users",
        element: <RouteRedirect />
      },
      {
        path: "roles",
        element: <RouteRedirect />
      },
      {
        path: "departments",
        element: <RouteRedirect />
      },
      {
        path: "departments/:id",
        element: <RouteRedirect />
      },
      {
        path: "forms",
        element: <RouteRedirect />
      },
      {
        path: "forms/editor",
        element: <RouteRedirect />
      },
      {
        path: "forms/drafts",
        element: <RouteRedirect />
      },
      {
        path: "system-config",
        element: <RouteRedirect />
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
      },
      {
        path: "assessment-events",
        element: <AssessmentEventPage />
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
            permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}
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
            permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access trainee dashboard.</div>}
          >
            <TraineeDashboardPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/course/:courseId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}
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
            permission={PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS}
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
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee assessments.</div>}
          >
            <TraineeAssessmentPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/assessment/:assessmentId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_ASSESSMENT_DETAILS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment details.</div>}
          >
            <TraineeAssessmentDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: ":traineeId/signature-pad/:documentId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.CONFIRM_TRAINEE_PARTICIPATION}
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
            permission={PERMISSION_IDS.VIEW_ASSESSMENT_SECTIONS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment sections.</div>}
          >
            <AssessmentSectionDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "academic-details",
        element: <RouteRedirect />
      },
      {
        path: "enrolled-courses",
        element: <RouteRedirect />
      },
      {
        path: "signature-required",
        element: <RouteRedirect />
      },
      {
        path: "completion-required",
        element: <RouteRedirect />
      },
      {
        path: "your-assessments",
        element: <RouteRedirect />
      },
      {
        path: "create-incident-feedback-report",
        element: <RouteRedirect />
      },
      {
        path: "assessment-pending",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment pending list.</div>}
          >
            <YourAssessmentsPage />
          </PermissionRoute>
        )
      },
      {
        path: "assessment-pending/section-completion",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view section completion list.</div>}
          >
            <SectionCompletionPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/sqa",
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
        path: "issues",
        element: <RouteRedirect />
      },
      {
        path: "feedback",
        element: <RouteRedirect />
      },
      {
        path: "templates",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ALL_REPORTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access template list.</div>}
          >
            <TemplateListPage />
          </PermissionRoute>
        )
      },
      {
        path: "templates/:templateId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_TEMPLATE_DETAILS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access template details.</div>}
          >
            <TemplateDetailPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/trainer",
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
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access trainer portal.</div>}
          >
            <TrainerDashboardPage />
          </PermissionRoute>
        )
      },
      {
        path: "upcoming-assessments",
        element: <RouteRedirect />
      },
      {
        path: "assessment-results",
        element: <RouteRedirect />
      },
      {
        path: "instructed-courses",
        element: <RouteRedirect />
      },
      {
        path: "configure-signature",
        element: <RouteRedirect />
      },
      {
        path: "assessment-details/:resultId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment details.</div>}
          >
            <AssessmentResultDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "assess/:entityType/:entityId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view these assessments.</div>}
          >
            <AssessmentAssignmentsPage />
          </PermissionRoute>
        )
      },
      {
        path: "assessments/:assessmentId/sections",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment sections.</div>}
          >
            <TrainerAssessmentSectionsPage />
          </PermissionRoute>
        )
      },
      {
        path: "assessments/sections/:sectionId/fields",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view section fields.</div>}
          >
            <AssessmentSectionFieldsPage />
          </PermissionRoute>
        )
      },
      {
        path: "assess/:entityType/:entityId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view these assessments.</div>}
          >
            <AssessmentAssignmentsPage />
          </PermissionRoute>
        )
      },
      {
        path: "approval-notes/:resultId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view approval notes.</div>}
          >
            <ResultApprovalNotePage />
          </PermissionRoute>
        )
      },
      {
        path: "courses/:courseId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_ALL_COURSES}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view course details.</div>}
          >
            <TrainerCourseDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: "trainees/:traineeId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_USER_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee details.</div>}
          >
            <TrainerTraineeDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "subjects/:subjectId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_SUBJECT_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view subject details.</div>}
          >
            <TrainerSubjectDetailsPage />
          </PermissionRoute>
        )
      }
    ]
  },
  {
    path: "/department-head",
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
            permission={PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to access department dashboard.</div>}
          >
            <DepartmentHeadDashboardPage />
          </PermissionRoute>
        )
      },
      {
        path: "my-department-details",
        element: <RouteRedirect />
      },
      {
        path: "my-department-details/:courseId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_COURSE_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view course details.</div>}
          >
            <CourseDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "assessment-review-requests",
        element: <RouteRedirect />
      },
      {
        path: "assessment-review-requests/:requestId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.LIST_ASSESSMENTS}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view assessment request details.</div>}
          >
            <AssessmentReviewRequestsPage />
          </PermissionRoute>
        )
      },
      {
        path: "courses/:courseId/subjects/:subjectId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_SUBJECT_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view subject details.</div>}
          >
            <DepartmentHeadSubjectDetailsPage />
          </PermissionRoute>
        )
      },
      {
        path: "trainees/:traineeId",
        element: (
          <PermissionRoute 
            permission={PERMISSION_IDS.VIEW_USER_IN_DETAIL}
            fallback={<div className="p-4 text-center text-muted">You don't have permission to view trainee details.</div>}
          >
            <DepartmentHeadTraineeDetailsPage />
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
