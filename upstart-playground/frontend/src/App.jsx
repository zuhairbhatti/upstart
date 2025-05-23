import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreateBoard from "./pages/CreateBoard";
import Board from "./pages/Board";

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
    <Router>
      <Routes>
        {!isLoggedIn ? (
          // Show login page if not authenticated
          <Route path="*" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        ) : (
          // Show other pages if authenticated
          <>
            <Route path="/create-board" element={<CreateBoard />} />
            <Route path="/board/:id" element={<Board />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
