import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {
  return (
    <div>Home
      <div>
      <Link to="/"> Home</Link>
      </div>
      <div>
      <Link to="/login">Login</Link>
      </div>
      <div>
      <Link to="/register">Register</Link>
      </div>
    </div>
    

  )
}

export default Home