import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary } from '../components/Common'
import Login from '../pages/Auth/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagementPage from '../pages/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/RoleManagement/RoleManagementPage'

// Determine basename based on environment
const getBasename = () => {
  // For GitHub Pages deployment, always use the repository name as basename
  if (import.meta.env.PROD) {
    return "/dsfms-template";
  }
  // For development, use the repository name as well
  return "/dsfms-template";
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
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
        element: <div>Departments Page</div>
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
  }
],
  {
    basename: getBasename(),
  })
