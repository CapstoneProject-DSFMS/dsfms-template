import { createHashRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary } from '../components/Common'
import Login from '../pages/Auth/Login'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagementPage from '../pages/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/RoleManagement/RoleManagementPage'
import DepartmentManagementPage from '../pages/DepartmentManagement/DepartmentManagementPage'
import ProfilePage from '../pages/Profile/ProfilePage'

// Determine basename based on environment
const getBasename = () => {
  // For development, don't use basename to avoid routing issues
  if (import.meta.env.DEV) {
    return "/";
  }
  // For production (GitHub Pages), use the repository name as basename
  const pathname = window.location.pathname;
  if (pathname.includes('/dsfms-template')) {
    return "/dsfms-template";
  }
  return "/";
};

export const router = createHashRouter([
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
],
  {
    basename: getBasename(),
  })
