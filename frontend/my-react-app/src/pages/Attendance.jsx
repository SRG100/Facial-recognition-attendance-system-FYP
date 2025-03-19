import React from 'react'
import SidebarComponent from '../components/SideBar'

const Attendance = ({userRole}) => {
  return (
    <div>Attendance
        <SidebarComponent userRole={userRole}/>
    </div>
  )
}

export default Attendance