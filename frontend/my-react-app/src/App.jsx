import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Register from './pages/Register';
import Login from './pages/Login';
import RegisterFace from './pages/RegisterFace';
import Dashboard from './pages/Dashboard';
import CheckFace from './pages/CheckFace';
import ProtectedRoute from './components/ProtectedRoute';
import Classes from './pages/Classes'
import VerifyCode from './pages/verifyCode'
import VerifyLocation from './pages/VerifyLocation';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState();
  const [userId, setUserId] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true });
        setUserId(response.data.userId);
        setUserRole(response.data.role);
        setIsLoggedIn(response.data.success);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthorization();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <>
        <Routes>
          <Route path="/register" element={isLoggedIn ?  <Navigate to="/" /> : <Register />  } />
          <Route path="/login" element={isLoggedIn ?  <Navigate to="/" /> : <Login /> } />

          <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
            <Route path="/" element={<Dashboard isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} />} />
            <Route path="/checkface" element={<CheckFace userId={userId} />} />
            <Route path="/classes" element={<Classes isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} />} />
            <Route path="/registerface" element={<RegisterFace userId={userId} />} />
            <Route path="/verifycode" element={<VerifyCode userId={userId} />} />
            <Route path="/verifylocation" element={<VerifyLocation userId={userId} />} />
            <Route path="/register" element={<Navigate to="/" />} />
            <Route path="/login" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
