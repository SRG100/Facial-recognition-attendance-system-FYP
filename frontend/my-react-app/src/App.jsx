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
import 'bootstrap/dist/css/bootstrap.min.css';

import RegisterTeacher from './pages/RegisterTeacher';
import Sections from './pages/Sections';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Modules from './pages/Modules';
import Attendance from './pages/Attendance';

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
          <Route path="/login" element={isLoggedIn ?  <Navigate to="/" /> : <Login /> } />

          <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
            <Route path="/register" element={ <Register userRole={userRole}/>  } />
            <Route path="/registerTeacher" element={<RegisterTeacher userRole={userRole} />  } />
          
            <Route path="/" element={<Dashboard isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} />} />
            <Route path="/checkface" element={<CheckFace userId={userId} userRole={userRole}/>} />
            <Route path="/classes" element={<Classes isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} />} />
            <Route path="/registerface" element={<RegisterFace userId={userId} userRole={userRole} />} />
            <Route path="/verifycode" element={<VerifyCode userId={userId} userRole={userRole} />} />
            <Route path="/verifylocation" element={<VerifyLocation userId={userId} userRole={userRole} />} />

            <Route path="/viewAttendance" element={<Attendance userId={userId} userRole={userRole}/>} />
            <Route path="/viewModules" element={<Modules isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} />} />
            <Route path="/viewStudents" element={<Students userId={userId} userRole={userRole} />} />
            <Route path="/viewTeachers" element={<Teachers userId={userId} userRole={userRole} />} />
            <Route path="/viewSections" element={<Sections userId={userId} userRole={userRole} />} />

            <Route path="/login" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
