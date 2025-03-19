import React from 'react'
import SidebarComponent from '../components/SideBar'

const Sections = ({userRole}) => {
  return (
    <div>Sections
        <SidebarComponent userRole={userRole}/>
    </div>
  )
}

export default Sections