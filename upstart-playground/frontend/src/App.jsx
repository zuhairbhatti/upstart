import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  console.log('hey', isLoggedIn);
  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      const hasToken = document.cookie.includes('access_token');
      setIsLoggedIn(hasToken);
    };
    
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <div>
        <Routes>
          {!isLoggedIn ? (
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
          ) : (
            <Route 
              path="/*" 
              // element={
              //   <ProtectedRoute>
              //     {/* <Dashboard onLogout={() => setIsLoggedIn(false)} /> */}
              //   </ProtectedRoute>
              // } 
            />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
