import React from 'react'
import { Navigate,Outlet } from 'react-router-dom'

function ProtectedRoute({ isLoggedIn}) {
    console.log('the login in protected routes is is:',isLoggedIn)
   return isLoggedIn===true?<Outlet/>:<Navigate to="login"/>
}

export default ProtectedRoute