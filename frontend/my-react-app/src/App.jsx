import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import axios from 'axios'
import Register from './pages/Register'
import Login from './pages/Login'
import RegisterFace from './pages/RegisterFace'
import Dashboard from './pages/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState();
  const [userId, setUserId] = useState();


  useEffect(() => {
    // Check if the token exists in cookies and verify the authorization
    const checkAuthorization = async () => {

      try {
        const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true });
        const isVerified = response.data.success;
        const role = response.data.role;  
        const id = response.data.userId;  
        setUserId(id)
        setUserRole(role)
        console.log('Authorization response:', response.data);

        if (isVerified) {
          setIsLoggedIn(true);  // User is logged in
        } else {
          setIsLoggedIn(false); // User is not logged in
        }

      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsLoggedIn(false); // Default to false if error occurs
      }
    };

    checkAuthorization();
  }, []);

  // useEffect(() => {
    console.log("Updated isLoggedIn:", isLoggedIn);
    console.log("Updated userRole:", userRole);
    console.log("Updated id:", userId);

  // }, [isLoggedIn, userRole]);

  return (
    <BrowserRouter>
    
      <Routes>
        {!isLoggedIn &&
        (
          <>
            <Route path='/register' element={<Register />}></Route>
            <Route path='/login' element={<Login />}></Route> 
            <Route path='/' element={<Login />}></Route> 

          </>
        )
        }

         <Route path='/register' element={<Navigate to ="/" />}></Route>
         <Route path='/login' element={<Navigate to ="/" />}></Route> 
        <Route path='/' element={<Dashboard isLoggedIn={isLoggedIn} userRole={userRole} userId={userId} />}></Route>
        
        <Route path='/registerface' element={<RegisterFace userId={userId} />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
