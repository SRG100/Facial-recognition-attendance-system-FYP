import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

const Dashboard = ({ isLoggedIn, userRole, userId }) => {

  return (
    <div>Home
      <Nav />
      {userRole === "admin" ?
        <p>Admin Condition</p>
        : userRole === "student" ? <p>Student Condition</p>
          : <p>Teacher Condition</p>
      }


      link to current class <br />
      link to result prediction <br />


    </div>


  )
}

export default Dashboard