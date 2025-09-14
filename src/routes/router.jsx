import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import TiptapDemo from '../pages/TiptapDemo'
import Dashboard from '../pages/Dashboard/Dashboard'

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
    path: "/tiptap-demo",
    element: <TiptapDemo />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/",
    element: <Dashboard /> 
  },
  
],
  {
    basename: "/dsfms-template", 
  })
