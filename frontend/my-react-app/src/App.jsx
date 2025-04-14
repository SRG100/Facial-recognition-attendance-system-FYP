import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
// import "bootstrap/dist/css/bootstrap.min.css";

import axios from 'axios';
import Register from './pages/Register';
import Login from './pages/Login';
import RegisterFace from './pages/RegisterFace';
import Dashboard from './pages/Dashboard';
import CheckFace from './pages/CheckFace';
import ProtectedRoute from './components/ProtectedRoute';
import Classes from './pages/Classes'
import VerifyCode from './pages/VerifyCode';
import VerifyLocation from './pages/VerifyLocation';
// import 'bootstrap/dist/css/bootstrap.min.css';
import ReviewForm from './pages/ReviewForm';
import RegisterTeacher from './pages/RegisterTeacher';
import Sections from './pages/Sections';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Modules from './pages/Modules';
import Attendance from './pages/Attendance';
import ViewReview from './pages/ViewReview';
import ClassAttendance from './pages/ClassAttendance';
import PageNotFound from './components/PageNotFound';

import './assets/MyPopup.css'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUsername] = useState("");

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true });
        setUserId(response.data.userId)
        console.log(response.data.role)
        console.log(response.data.userName)
        setUserRole(response.data.role)
        setUsername(response.data.userName)
        setIsLoggedIn(response.data.success)

      } catch (error) {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    };
    checkAuthorization()
  }, []);

  if (loading) return <p>Loading...</p>;
  console.log(userRole)
  console.log(userName)

  return (
    
    <BrowserRouter>
      <>
        <Routes>
          <Route path="/login" element={isLoggedIn ?  <Navigate to="/" /> : <Login /> } />

          <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
            <Route path="/register" element={ <Register userId={userId} userRole={userRole} userName={userName}/>  } />
            <Route path="/registerTeacher" element={<RegisterTeacher userRole={userRole} userName={userName} />  } />
           {/* ---common access-- */}
            <Route path="/" element={<Dashboard isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} userName={userName}/>}  />
            <Route path="/checkface" element={<CheckFace userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/classes" element={<Classes isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} userName={userName} />} />
            <Route path="/registerface" element={<RegisterFace userId={userId} userRole={userRole} userName={userName} />} />
            <Route path="/verifycode" element={<VerifyCode userId={userId} userRole={userRole} userName={userName} />} />
            <Route path="/verifylocation" element={<VerifyLocation userId={userId} userRole={userRole} userName={userName} />} />

            <Route path="/viewAttendance" element={<Attendance userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/viewModules" element={<Modules isLoggedIn={isLoggedIn} userRole={userRole} userId={userId}  userName={userName}/>} />
            <Route path="/viewStudents" element={<Students userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/viewTeachers" element={<Teachers userId={userId} userRole={userRole} userName={userName} />} />
            <Route path="/viewSections" element={<Sections userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/ReviewForm" element={<ReviewForm userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/ViewReview" element={<ViewReview userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/ViewClassAttendance" element={<ClassAttendance userId={userId} userRole={userRole} userName={userName}/>} />
            <Route path="/login" element={<Navigate to="/" />} />


            {/* Catch-all 404 route */}
  <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
