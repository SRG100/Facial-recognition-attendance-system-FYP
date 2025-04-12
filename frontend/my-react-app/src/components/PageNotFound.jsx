import React from 'react'
import PageNotFoundImg from '../assets/NotFound.jpg'
// import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate } from 'react-router-dom'

const PageNotFound = () => {
    const navigate = useNavigate();
  
  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
      <div className="row">
        <div className="col-12">
          <h1 className="display-1 fw-bold text-danger mb-4">404</h1>
          <h2 className="mb-4">Oops! Page Not Found</h2>
          <div className="mb-5 mx-auto" style={{ maxWidth: '500px' }}>
            <img 
              src={PageNotFoundImg} 
              alt="Page not found" 
              className="img-fluid rounded shadow" 
              style={{ maxHeight: '350px', width: 'auto' }}
            />
          </div>
          <p className="lead mb-5">We can't seem to find the page you're looking for.</p>
          {/* <a href="./" className="btn btn-danger">
            Go to Dashboard
          </a> */}
          <button className='btn btn-danger' onClick={() => navigate("/")}>Go to dashboard</button>
        </div>
      </div>
    </div>
  )
}

export default PageNotFound