import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary } from '../components/Common'
import RoleBasedRedirect from '../components/Common/RoleBasedRedirect'
import Login from '../pages/Auth/Login'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage'
import Dashboard from '../pages/Admin/Dashboard'
import UserManagementPage from '../pages/Admin/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/Admin/RoleManagement/RoleManagementPage'
import DepartmentManagementPage from '../pages/Admin/DepartmentManagement/DepartmentManagementPage'
import DepartmentDetailPage from '../pages/Admin/DepartmentManagement/DepartmentDetailPage'
import ProfilePage from '../pages/Profile/ProfilePage'
// Academic pages
import AcademicDashboard from '../pages/Academic/AcademicDashboard'
import CourseListPage from '../pages/Academic/CourseManagement/CourseListPage'
import SubjectListPage from '../pages/Academic/SubjectManagement/SubjectListPage'
import TraineeEnrollmentPage from '../pages/Academic/TraineeEnrollmentPage'
import AssessmentFormsPage from '../pages/Academic/AssessmentFormsPage'
import AssessmentHistoryPage from '../pages/Academic/AssessmentHistoryPage'

// Proper GitHub Pages basename configuration
const getBasename = () => {
  // Use environment variable for basename - proper deployment setup
  return import.meta.env.VITE_BASE_PATH || "/";
};

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
        element: <Dashboard />
      },
      {
        path: "users",
        element: <UserManagementPage />
      },
      {
        path: "roles",
        element: <RoleManagementPage />
      },
      {
        path: "departments",
        element: <DepartmentManagementPage />
      },
      {
        path: "departments/:id",
        element: <DepartmentDetailPage />
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "forms",
        element: <div>Forms Page</div>
      },
      {
        path: "system-config",
        element: <div>System Configuration Page</div>
      }
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
        element: <AcademicDashboard />
      },
      {
        path: "dashboard",
        element: <AcademicDashboard />
      },
      {
        path: "courses",
        element: <CourseListPage />
      },
      {
        path: "courses/create",
        element: <div>Create Course Page</div>
      },
      {
        path: "subjects",
        element: <SubjectListPage />
      },
      {
        path: "subjects/bulk-import",
        element: <div>Bulk Import Subjects Page</div>
      },
      {
        path: "enrollment",
        element: <TraineeEnrollmentPage />
      },
      {
        path: "assessment-forms",
        element: <AssessmentFormsPage />
      },
      {
        path: "assessment-history",
        element: <AssessmentHistoryPage />
      }
    ]
  },
  {
    path: "*",
    element: <Login />,
    errorElement: <ErrorBoundary />
  }
], {
  basename: getBasename(),
})
