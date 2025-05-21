import { useState, useEffect } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      const hasToken = document.cookie.includes('access_token');
      setIsLoggedIn(hasToken);
    };
    
    checkAuth();
  }, []);

  return (
    <div>
      <Routes>
        {!isLoggedIn ? (
          <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        ) : (
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Dashboard onLogout={() => setIsLoggedIn(false)} />
              </ProtectedRoute>
            } 
          />
        )}
      </Routes>
    </div>
  )
}

export default App
