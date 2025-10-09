import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router.jsx'
import AuthWrapper from './components/Common/AuthWrapper.jsx'
import { ToastContainer } from 'react-toastify'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Handle GitHub Pages 404.html redirect
    const handleGitHubPagesRedirect = () => {
      const pathSegmentsToKeep = 1;
      const l = window.location;
      
      // Check if we're on GitHub Pages and URL has been redirected
      if (l.hostname.includes('github.io') && l.search.includes('?/')) {
        const pathname = l.pathname;
        const search = l.search;
        const hash = l.hash;
        
        // Extract the redirected path from query string
        const pathFromQuery = search.match(/\?\/(.+?)(?:&|$)/);
        if (pathFromQuery) {
          const redirectedPath = pathFromQuery[1].replace(/~and~/g, '&');
          const newPath = `/${redirectedPath}${hash}`;
          
          // Navigate to the correct path
          window.history.replaceState(null, '', newPath);
        }
      }
    };

    handleGitHubPagesRedirect();
  }, []);

  return (
    <AuthWrapper>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthWrapper>
  )
} 

export default App
