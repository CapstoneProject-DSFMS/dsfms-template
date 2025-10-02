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
        element: (
          <PermissionRoute permission="GET /dashboard">
            <Dashboard />
          </PermissionRoute>
        )
      },
      {
        path: "users",
        element: (
          <PermissionRoute permission="GET /users">
            <UserManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: "roles",
        element: (
          <PermissionRoute permission="GET /roles">
            <RoleManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: "departments",
        element: (
          <PermissionRoute permission="GET /departments">
            <DepartmentManagementPage />
          </PermissionRoute>
        )
      },
      {
        path: "departments/:id",
        element: (
          <PermissionRoute permission="GET /departments/:departmentId">
            <DepartmentDetailPage />
          </PermissionRoute>
        )
      },
      {
        path: "profile",
        element: (
          <PermissionRoute permission="GET /profile">
            <ProfilePage />
          </PermissionRoute>
        )
      },
      {
        path: "forms",
        element: (
          <PermissionRoute permission="GET /templates">
            <div>Forms Page</div>
          </PermissionRoute>
        )
      },
      {
        path: "system-config",
        element: (
          <PermissionRoute permission="GET /global-fields">
            <div>System Configuration Page</div>
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
  basename: getBasename(),
})
