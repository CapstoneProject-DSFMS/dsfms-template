import { createBrowserRouter } from 'react-router-dom'
import { LayoutWrapper } from '../components/Layout'
import { ProtectedRoute } from '../components/Common'
import Login from '../pages/Auth/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagementPage from '../pages/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/RoleManagement/RoleManagementPage'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
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
    basename: "/dsfms-template", 
  })
