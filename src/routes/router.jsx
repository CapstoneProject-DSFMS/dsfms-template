import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute, ErrorBoundary } from '../components/Common'
import Login from '../pages/Auth/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagementPage from '../pages/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/RoleManagement/RoleManagementPage'

// Determine basename based on environment
const getBasename = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return "/dsfms-template";
  }
  // For production, check if the app is deployed in a subdirectory
  const pathname = window.location.pathname;
  if (pathname.includes('/dsfms-template')) {
    return "/dsfms-template";
  }
  // If deployed at root, no basename needed
  return "/";
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
      }
    ]
  }
],
  {
    basename: getBasename(),
  })
