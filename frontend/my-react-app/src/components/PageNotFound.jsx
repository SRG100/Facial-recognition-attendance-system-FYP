import React from 'react'
import PageNotFoundImg from '../assets/NotFound.jpg'
// import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate } from 'react-router-dom'

const PageNotFound = () => {
    const navigate = useNavigate();
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
      <h1 className="text-8xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Oops! Page Not Found</h2>
      <div className="mb-10 mx-auto max-w-md">
        {/* <img 
          src={PageNotFoundImg}
          alt="Page not found" 
          className="rounded-lg shadow-lg max-h-80 w-auto mx-auto"
        /> */}
      </div>
      <p className="text-lg text-gray-600 mb-8">We can't seem to find the page you're looking for.</p>
      <button 
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        onClick={() => navigate("/")}
      >
        Go to Dashboard
      </button>
    </div>
  )
}

export default PageNotFound