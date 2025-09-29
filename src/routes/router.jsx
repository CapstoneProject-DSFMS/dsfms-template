import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary } from '../components/Common'
import Login from '../pages/Auth/Login'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagementPage from '../pages/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/RoleManagement/RoleManagementPage'
import DepartmentManagementPage from '../pages/DepartmentManagement/DepartmentManagementPage'
import DepartmentDetailPage from '../pages/DepartmentManagement/DepartmentDetailPage'
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
        element: <Dashboard />
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
    path: "*",
    element: <Login />,
    errorElement: <ErrorBoundary />
  }
], {
  basename: getBasename(),
})
