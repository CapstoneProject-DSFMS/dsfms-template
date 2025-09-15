import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagementPage from '../pages/UserManagement/UserManagementPage'
import RoleManagementPage from '../pages/RoleManagement/RoleManagementPage'

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/users",
    element: <UserManagementPage />
  },
  {
    path: "/roles",
    element: <RoleManagementPage />
  },
  {
    path: "/departments",
    element: <div>Departments Page</div>
  },
  {
    path: "/forms",
    element: <div>Forms Page</div>
  },
  {
    path: "/",
    element: <Dashboard /> 
  },
  
],
  {
    basename: "/dsfms-template", 
  })
